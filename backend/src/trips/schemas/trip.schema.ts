import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TripDocument = Trip & Document;

export enum TransportType {
  BUS = 'bus',
  TRAIN = 'train',
  FLIGHT = 'flight',
  FERRY = 'ferry',
}

@Schema({ _id: false })
class PriceConfig {
  @Prop({ required: true, min: 0 })
  basePerStudent: number;

  @Prop({ default: 0, min: 0 })
  basePerAdult: number;

  @Prop({ default: 0, min: 0 })
  mealPerPersonPerDay: number;

  @Prop({ type: Object, default: {} })
  transportSurcharge: Record<TransportType, number>;

  @Prop({ type: Object, default: {} })
  extras: Record<string, number>;
}
const PriceConfigSchema = SchemaFactory.createForClass(PriceConfig);

@Schema({ timestamps: true })
export class Trip {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  slug: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, trim: true })
  destination: string;

  @Prop({ required: true, trim: true })
  country: string;

  @Prop({ required: true, min: 1 })
  durationDays: number;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [String], default: [] })
  highlights: string[];

  @Prop({ type: [String], default: [] })
  includedItems: string[];

  @Prop({ type: [String], default: [] })
  excludedItems: string[];

  @Prop({ type: PriceConfigSchema, required: true })
  priceConfig: PriceConfig;

  @Prop({ type: [String], enum: Object.values(TransportType), default: [TransportType.BUS] })
  availableTransport: TransportType[];

  @Prop({ type: Object, default: {} })
  availableExtras: Record<string, number>;

  @Prop({ min: 1 })
  minStudents: number;

  @Prop({ min: 1 })
  maxStudents: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ trim: true })
  category: string;

  @Prop({ type: [String], default: [] })
  tags: string[];
}

export const TripSchema = SchemaFactory.createForClass(Trip);
TripSchema.index({ slug: 1 }, { unique: true });
TripSchema.index({ isActive: 1, isFeatured: -1 });
TripSchema.index({ destination: 1 });
TripSchema.index({ tags: 1 });
