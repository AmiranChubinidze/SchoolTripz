import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PricingRule, PricingRuleDocument, DiscountType } from './schemas/pricing-rule.schema';
import { Trip, TripDocument } from '../trips/schemas/trip.schema';

export interface QuoteInput {
  tripId: string;
  students: number;
  adults: number;
  startDate: string;
  mealsPerDay: number;
  transportType: string;
  selectedExtras: string[];
}

export interface QuoteResult {
  baseStudents: number;
  baseAdults: number;
  meals: number;
  transport: number;
  extras: number;
  discount: number;
  total: number;
  perStudent: number;
  appliedRules: string[];
}

@Injectable()
export class PricingService {
  constructor(
    @InjectModel(Trip.name) private tripModel: Model<TripDocument>,
    @InjectModel(PricingRule.name) private ruleModel: Model<PricingRuleDocument>,
  ) {}

  async calculateQuote(input: QuoteInput): Promise<QuoteResult> {
    const trip = await this.tripModel.findById(input.tripId);
    if (!trip) throw new NotFoundException('Trip not found');

    const { priceConfig, durationDays } = trip;
    const { students, adults, mealsPerDay, transportType, selectedExtras, startDate } = input;
    const totalPeople = students + adults;

    // Base costs
    const baseStudents = priceConfig.basePerStudent * students * durationDays;
    const baseAdults = (priceConfig.basePerAdult || 0) * adults * durationDays;

    // Meals
    const meals = (priceConfig.mealPerPersonPerDay || 0) * mealsPerDay * totalPeople * durationDays;

    // Transport surcharge per person
    const transportRate = priceConfig.transportSurcharge?.[transportType] || 0;
    const transport = transportRate * totalPeople;

    // Extras
    let extrasTotal = 0;
    for (const extra of selectedExtras) {
      const rate = priceConfig.extras?.[extra] || trip.availableExtras?.[extra] || 0;
      extrasTotal += rate * students;
    }

    const subtotal = baseStudents + baseAdults + meals + transport + extrasTotal;

    // Apply pricing rules
    const { discount, appliedRules } = await this.applyRules(
      input.tripId,
      students,
      new Date(startDate),
      subtotal,
    );

    const total = Math.max(0, subtotal - discount);
    const perStudent = students > 0 ? total / students : 0;

    return {
      baseStudents,
      baseAdults,
      meals,
      transport,
      extras: extrasTotal,
      discount,
      total,
      perStudent: Math.round(perStudent * 100) / 100,
      appliedRules,
    };
  }

  private async applyRules(tripId: string, students: number, startDate: Date, subtotal: number) {
    const now = new Date();
    const rules = await this.ruleModel.find({
      $or: [{ trip: tripId }, { trip: { $exists: false } }],
      isActive: true,
      $and: [
        { $or: [{ validFrom: { $lte: now } }, { validFrom: null }] },
        { $or: [{ validTo: { $gte: now } }, { validTo: null }] },
      ],
    });

    let discount = 0;
    const appliedRules: string[] = [];

    for (const rule of rules) {
      let applicable = true;

      if (rule.minStudents && students < rule.minStudents) applicable = false;
      if (rule.maxStudents && students > rule.maxStudents) applicable = false;
      if (rule.daysBeforeTrip) {
        const daysUntilTrip = Math.floor((startDate.getTime() - now.getTime()) / 86400000);
        if (daysUntilTrip < rule.daysBeforeTrip) applicable = false;
      }

      if (applicable) {
        if (rule.discountType === DiscountType.PERCENTAGE) {
          discount += subtotal * (rule.discountValue / 100);
        } else {
          discount += rule.discountValue;
        }
        appliedRules.push(rule.name);
      }
    }

    return { discount: Math.round(discount * 100) / 100, appliedRules };
  }

  async createRule(dto: any) {
    return this.ruleModel.create(dto);
  }

  async findRules(tripId?: string) {
    const filter: any = {};
    if (tripId) filter.trip = tripId;
    return this.ruleModel.find(filter).sort({ createdAt: -1 });
  }

  async updateRule(id: string, dto: any) {
    return this.ruleModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async deleteRule(id: string) {
    return this.ruleModel.findByIdAndDelete(id);
  }
}
