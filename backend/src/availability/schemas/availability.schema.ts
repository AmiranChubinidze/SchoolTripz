import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AvailabilityDocument = Availability & Document;

@Schema({ timestamps: true })
export class Availability {
  @Prop({ type: Types.ObjectId, ref: 'Trip', required: true })
  trip: Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true, min: 0 })
  totalCapacity: number;

  @Prop({ default: 0, min: 0 })
  bookedCount: number;

  @Prop({ default: true })
  isAvailable: boolean;
}

export const AvailabilitySchema = SchemaFactory.createForClass(Availability);
AvailabilitySchema.index({ trip: 1, date: 1 }, { unique: true });
AvailabilitySchema.index({ date: 1, isAvailable: 1 });
