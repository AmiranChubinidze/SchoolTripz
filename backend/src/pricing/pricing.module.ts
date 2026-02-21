import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PricingController } from './pricing.controller';
import { PricingService } from './pricing.service';
import { PricingRule, PricingRuleSchema } from './schemas/pricing-rule.schema';
import { Trip, TripSchema } from '../trips/schemas/trip.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PricingRule.name, schema: PricingRuleSchema },
      { name: Trip.name, schema: TripSchema },
    ]),
  ],
  controllers: [PricingController],
  providers: [PricingService],
  exports: [PricingService],
})
export class PricingModule {}
