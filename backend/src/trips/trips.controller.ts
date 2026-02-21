import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('trips')
export class TripsController {
  constructor(private tripsService: TripsService) {}

  // Public endpoints
  @Get()
  findAll(@Query() query: any) {
    return this.tripsService.findAll(query, false);
  }

  @Get('categories')
  getCategories() {
    return this.tripsService.getCategories();
  }

  @Get('tags')
  getTags() {
    return this.tripsService.getTags();
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.tripsService.findBySlug(slug, false);
  }

  // Authenticated: client gets pricing config for trip builder
  @Get(':id/pricing')
  @UseGuards(JwtAuthGuard)
  getPricingConfig(@Param('id') id: string) {
    return this.tripsService.findById(id);
  }

  // Admin endpoints
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  adminFindAll(@Query() query: any) {
    return this.tripsService.findAll(query, true);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateTripDto) {
    return this.tripsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: Partial<CreateTripDto>) {
    return this.tripsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.tripsService.remove(id);
  }
}
