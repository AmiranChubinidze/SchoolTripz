import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PricingRuleDocument = PricingRule & Document;

export enum RuleType {
  EARLY_BIRD = 'early_bird',
  GROUP_DISCOUNT = 'group_discount',
  SEASONAL = 'seasonal',
  FLAT = 'flat',
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

@Schema({ timestamps: true })
export class PricingRule {
  @Prop({ type: Types.ObjectId, ref: 'Trip' })
  trip: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ enum: RuleType, required: true })
  ruleType: RuleType;

  @Prop({ enum: DiscountType, required: true })
  discountType: DiscountType;

  @Prop({ required: true, min: 0 })
  discountValue: number;

  @Prop()
  minStudents: number;

  @Prop()
  maxStudents: number;

  @Prop()
  validFrom: Date;

  @Prop()
  validTo: Date;

  @Prop()
  daysBeforeTrip: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const PricingRuleSchema = SchemaFactory.createForClass(PricingRule);
PricingRuleSchema.index({ trip: 1, isActive: 1 });
PricingRuleSchema.index({ ruleType: 1, isActive: 1 });
