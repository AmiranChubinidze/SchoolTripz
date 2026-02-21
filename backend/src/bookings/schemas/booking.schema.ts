import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TransportType } from '../../trips/schemas/trip.schema';

export type BookingDocument = Booking & Document;

export enum BookingStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}

@Schema({ _id: false })
class BookingConfig {
  @Prop({ required: true, min: 1 })
  students: number;

  @Prop({ default: 0, min: 0 })
  adults: number;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true, min: 0 })
  mealsPerDay: number;

  @Prop({ enum: TransportType, required: true })
  transportType: TransportType;

  @Prop({ type: [String], default: [] })
  selectedExtras: string[];
}
const BookingConfigSchema = SchemaFactory.createForClass(BookingConfig);

@Schema({ _id: false })
class PriceBreakdown {
  @Prop({ required: true })
  baseStudents: number;

  @Prop({ required: true })
  baseAdults: number;

  @Prop({ required: true })
  meals: number;

  @Prop({ required: true })
  transport: number;

  @Prop({ required: true })
  extras: number;

  @Prop({ required: true })
  total: number;

  @Prop({ required: true })
  perStudent: number;
}
const PriceBreakdownSchema = SchemaFactory.createForClass(PriceBreakdown);

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  client: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Trip', required: true })
  trip: Types.ObjectId;

  @Prop({ type: BookingConfigSchema, required: true })
  config: BookingConfig;

  @Prop({ type: PriceBreakdownSchema, required: true })
  priceBreakdown: PriceBreakdown;

  @Prop({ enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Prop({ trim: true })
  clientNotes: string;

  @Prop({ trim: true })
  adminNotes: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  reviewedBy: Types.ObjectId;

  @Prop()
  reviewedAt: Date;

  @Prop()
  confirmedAt: Date;

  @Prop()
  cancelledAt: Date;

  @Prop({ trim: true })
  cancellationReason: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
BookingSchema.index({ client: 1, status: 1 });
BookingSchema.index({ trip: 1, status: 1 });
BookingSchema.index({ status: 1, createdAt: -1 });
BookingSchema.index({ 'config.startDate': 1 });
