import { Controller, Post, Get, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('pricing')
export class PricingController {
  constructor(private pricingService: PricingService) {}

  @Post('quote')
  @UseGuards(JwtAuthGuard)
  calculateQuote(@Body() body: any) {
    return this.pricingService.calculateQuote(body);
  }

  @Get('rules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findRules(@Query('tripId') tripId: string) {
    return this.pricingService.findRules(tripId);
  }

  @Post('rules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createRule(@Body() dto: any) {
    return this.pricingService.createRule(dto);
  }

  @Patch('rules/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateRule(@Param('id') id: string, @Body() dto: any) {
    return this.pricingService.updateRule(id, dto);
  }

  @Delete('rules/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteRule(@Param('id') id: string) {
    return this.pricingService.deleteRule(id);
  }
}
