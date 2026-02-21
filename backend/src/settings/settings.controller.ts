import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  getAll() {
    return this.settingsService.getAll();
  }

  @Patch(':key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async set(@Param('key') key: string, @Body('value') value: any) {
    await this.settingsService.set(key, value);
    return { key, value };
  }
}
