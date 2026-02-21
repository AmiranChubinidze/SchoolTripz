import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { BookingStatus } from './schemas/booking.schema';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  // Client: create booking
  @Post()
  create(@CurrentUser('_id') userId: string, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(userId.toString(), dto);
  }

  // Client: list own bookings
  @Get('my')
  myBookings(@CurrentUser('_id') userId: string, @Query() query: any) {
    return this.bookingsService.findAll(query, userId.toString());
  }

  // Client: get single booking (own)
  @Get('my/:id')
  getMyBooking(@CurrentUser('_id') userId: string, @Param('id') id: string) {
    return this.bookingsService.findById(id, userId.toString());
  }

  // Client: confirm approved booking
  @Patch('my/:id/confirm')
  clientConfirm(@CurrentUser('_id') userId: string, @Param('id') id: string) {
    return this.bookingsService.clientConfirm(id, userId.toString());
  }

  // Client: cancel booking
  @Patch('my/:id/cancel')
  clientCancel(
    @CurrentUser('_id') userId: string,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.bookingsService.clientCancel(id, userId.toString(), reason);
  }

  // Admin: kanban view
  @Get('kanban')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  kanban() {
    return this.bookingsService.getKanbanView();
  }

  // Admin: all bookings
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll(@Query() query: any) {
    return this.bookingsService.findAll(query);
  }

  // Admin: single booking
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.bookingsService.findById(id);
  }

  // Admin: update status
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStatus(
    @CurrentUser('_id') adminId: string,
    @Param('id') id: string,
    @Body() body: { status: BookingStatus; notes?: string },
  ) {
    return this.bookingsService.updateStatus(id, body.status, adminId.toString(), body.notes);
  }
}
