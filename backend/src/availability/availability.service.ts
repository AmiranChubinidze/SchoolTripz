import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Availability, AvailabilityDocument } from './schemas/availability.schema';

@Injectable()
export class AvailabilityService {
  constructor(@InjectModel(Availability.name) private availModel: Model<AvailabilityDocument>) {}

  async getForTrip(tripId: string, from?: string, to?: string) {
    const filter: any = { trip: new Types.ObjectId(tripId) };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }
    return this.availModel.find(filter).sort({ date: 1 });
  }

  async upsert(tripId: string, date: string, totalCapacity: number, isAvailable = true) {
    return this.availModel.findOneAndUpdate(
      { trip: new Types.ObjectId(tripId), date: new Date(date) },
      { totalCapacity, isAvailable },
      { upsert: true, new: true },
    );
  }

  async bulkUpsert(tripId: string, dates: { date: string; capacity: number }[]) {
    const ops = dates.map(({ date, capacity }) => ({
      updateOne: {
        filter: { trip: new Types.ObjectId(tripId), date: new Date(date) },
        update: { totalCapacity: capacity, isAvailable: capacity > 0 },
        upsert: true,
      },
    }));
    return this.availModel.bulkWrite(ops);
  }

  async getAvailableDates(tripId: string, from: string, to: string) {
    return this.availModel.find({
      trip: new Types.ObjectId(tripId),
      date: { $gte: new Date(from), $lte: new Date(to) },
      isAvailable: true,
    }).sort({ date: 1 });
  }

  async decrementCapacity(tripId: string, date: string, count: number) {
    return this.availModel.findOneAndUpdate(
      { trip: new Types.ObjectId(tripId), date: new Date(date) },
      { $inc: { bookedCount: count } },
      { new: true },
    );
  }
}
