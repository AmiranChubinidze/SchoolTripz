import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingDocument, BookingStatus } from '../bookings/schemas/booking.schema';
import { Trip, TripDocument } from '../trips/schemas/trip.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Trip.name) private tripModel: Model<TripDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getDashboardStats() {
    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      totalUsers,
      totalTrips,
      revenueResult,
      recentBookings,
      popularTrips,
      bookingsByStatus,
      monthlyRevenue,
    ] = await Promise.all([
      this.bookingModel.countDocuments(),
      this.bookingModel.countDocuments({ status: BookingStatus.PENDING }),
      this.bookingModel.countDocuments({ status: BookingStatus.CONFIRMED }),
      this.userModel.countDocuments({ role: 'client' }),
      this.tripModel.countDocuments({ isActive: true }),
      this.bookingModel.aggregate([
        { $match: { status: { $in: [BookingStatus.CONFIRMED, BookingStatus.APPROVED] } } },
        { $group: { _id: null, total: { $sum: '$priceBreakdown.total' } } },
      ]),
      this.bookingModel.find()
        .populate('trip', 'title destination')
        .populate('client', 'name email')
        .sort({ createdAt: -1 })
        .limit(5),
      this.bookingModel.aggregate([
        { $group: { _id: '$trip', count: { $sum: 1 }, revenue: { $sum: '$priceBreakdown.total' } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'trips', localField: '_id', foreignField: '_id', as: 'trip' } },
        { $unwind: '$trip' },
        { $project: { 'trip.title': 1, 'trip.destination': 1, count: 1, revenue: 1 } },
      ]),
      this.bookingModel.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.bookingModel.aggregate([
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            bookings: { $sum: 1 },
            revenue: { $sum: '$priceBreakdown.total' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 },
      ]),
    ]);

    return {
      overview: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        totalUsers,
        totalTrips,
        totalRevenue: revenueResult[0]?.total || 0,
      },
      recentBookings,
      popularTrips,
      bookingsByStatus: bookingsByStatus.reduce((acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
      }, {}),
      monthlyRevenue,
    };
  }
}
