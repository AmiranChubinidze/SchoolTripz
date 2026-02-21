import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('availability')
export class AvailabilityController {
  constructor(private availService: AvailabilityService) {}

  @Get('trips/:tripId')
  @UseGuards(JwtAuthGuard)
  getForTrip(
    @Param('tripId') tripId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.availService.getForTrip(tripId, from, to);
  }

  @Get('trips/:tripId/available-dates')
  @UseGuards(JwtAuthGuard)
  getAvailableDates(
    @Param('tripId') tripId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.availService.getAvailableDates(tripId, from, to);
  }

  @Post('trips/:tripId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  upsert(
    @Param('tripId') tripId: string,
    @Body() body: { date: string; capacity: number; isAvailable?: boolean },
  ) {
    return this.availService.upsert(tripId, body.date, body.capacity, body.isAvailable);
  }

  @Post('trips/:tripId/bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  bulkUpsert(
    @Param('tripId') tripId: string,
    @Body() body: { dates: { date: string; capacity: number }[] },
  ) {
    return this.availService.bulkUpsert(tripId, body.dates);
  }
}
