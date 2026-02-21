import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking, BookingDocument, BookingStatus } from './schemas/booking.schema';
import { PricingService } from '../pricing/pricing.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    private pricingService: PricingService,
  ) {}

  async create(clientId: string, dto: CreateBookingDto) {
    const quote = await this.pricingService.calculateQuote({
      tripId: dto.tripId,
      students: dto.students,
      adults: dto.adults || 0,
      startDate: dto.startDate,
      mealsPerDay: dto.mealsPerDay,
      transportType: dto.transportType,
      selectedExtras: dto.selectedExtras || [],
    });

    const booking = await this.bookingModel.create({
      client: new Types.ObjectId(clientId),
      trip: new Types.ObjectId(dto.tripId),
      config: {
        students: dto.students,
        adults: dto.adults || 0,
        startDate: new Date(dto.startDate),
        mealsPerDay: dto.mealsPerDay,
        transportType: dto.transportType,
        selectedExtras: dto.selectedExtras || [],
      },
      priceBreakdown: {
        baseStudents: quote.baseStudents,
        baseAdults: quote.baseAdults,
        meals: quote.meals,
        transport: quote.transport,
        extras: quote.extras,
        total: quote.total,
        perStudent: quote.perStudent,
      },
      clientNotes: dto.clientNotes,
      status: BookingStatus.PENDING,
    });

    return booking.populate(['trip', 'client']);
  }

  async findAll(query: any = {}, clientId?: string) {
    const { page = 1, limit = 20, status, tripId } = query;
    const filter: any = {};

    if (clientId) filter.client = new Types.ObjectId(clientId);
    if (status) filter.status = status;
    if (tripId) filter.trip = new Types.ObjectId(tripId);

    const [bookings, total] = await Promise.all([
      this.bookingModel.find(filter)
        .populate('trip', 'title destination durationDays images')
        .populate('client', 'name email school')
        .skip((page - 1) * limit)
        .limit(+limit)
        .sort({ createdAt: -1 }),
      this.bookingModel.countDocuments(filter),
    ]);

    return { bookings, total, page: +page, limit: +limit };
  }

  async findById(id: string, clientId?: string) {
    const booking = await this.bookingModel.findById(id)
      .populate('trip')
      .populate('client', 'name email school phone');
    if (!booking) throw new NotFoundException('Booking not found');
    if (clientId && booking.client['_id'].toString() !== clientId) {
      throw new ForbiddenException('Access denied');
    }
    return booking;
  }

  async updateStatus(id: string, status: BookingStatus, adminId: string, notes?: string) {
    const booking = await this.bookingModel.findById(id);
    if (!booking) throw new NotFoundException('Booking not found');

    const validTransitions = {
      [BookingStatus.PENDING]: [BookingStatus.APPROVED, BookingStatus.REJECTED],
      [BookingStatus.APPROVED]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
      [BookingStatus.CONFIRMED]: [BookingStatus.CANCELLED],
      [BookingStatus.REJECTED]: [],
      [BookingStatus.CANCELLED]: [],
    };

    if (!validTransitions[booking.status]?.includes(status)) {
      throw new BadRequestException(`Cannot transition from ${booking.status} to ${status}`);
    }

    const update: any = { status };
    if (notes) update.adminNotes = notes;
    if ([BookingStatus.APPROVED, BookingStatus.REJECTED].includes(status)) {
      update.reviewedBy = new Types.ObjectId(adminId);
      update.reviewedAt = new Date();
    }
    if (status === BookingStatus.CONFIRMED) update.confirmedAt = new Date();
    if (status === BookingStatus.CANCELLED) update.cancelledAt = new Date();

    return this.bookingModel.findByIdAndUpdate(id, update, { new: true })
      .populate('trip', 'title destination')
      .populate('client', 'name email');
  }

  async clientConfirm(id: string, clientId: string) {
    const booking = await this.bookingModel.findById(id);
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.client.toString() !== clientId) throw new ForbiddenException('Access denied');
    if (booking.status !== BookingStatus.APPROVED) {
      throw new BadRequestException('Booking must be approved before confirmation');
    }
    return this.bookingModel.findByIdAndUpdate(
      id,
      { status: BookingStatus.CONFIRMED, confirmedAt: new Date() },
      { new: true },
    ).populate('trip', 'title destination');
  }

  async clientCancel(id: string, clientId: string, reason?: string) {
    const booking = await this.bookingModel.findById(id);
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.client.toString() !== clientId) throw new ForbiddenException('Access denied');
    if ([BookingStatus.CANCELLED, BookingStatus.REJECTED].includes(booking.status)) {
      throw new BadRequestException('Booking already closed');
    }
    return this.bookingModel.findByIdAndUpdate(
      id,
      { status: BookingStatus.CANCELLED, cancelledAt: new Date(), cancellationReason: reason },
      { new: true },
    );
  }

  async getKanbanView() {
    const bookings = await this.bookingModel.find()
      .populate('trip', 'title destination durationDays')
      .populate('client', 'name email school')
      .sort({ createdAt: -1 });

    const kanban: Record<string, any[]> = {
      [BookingStatus.PENDING]: [],
      [BookingStatus.APPROVED]: [],
      [BookingStatus.CONFIRMED]: [],
      [BookingStatus.CANCELLED]: [],
      [BookingStatus.REJECTED]: [],
    };

    for (const booking of bookings) {
      kanban[booking.status]?.push(booking);
    }

    return kanban;
  }
}
