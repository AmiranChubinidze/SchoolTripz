import { IsString, IsNumber, IsArray, IsOptional, IsDateString, IsEnum, Min } from 'class-validator';
import { TransportType } from '../../trips/schemas/trip.schema';

export class CreateBookingDto {
  @IsString()
  tripId: string;

  @IsNumber()
  @Min(1)
  students: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  adults?: number;

  @IsDateString()
  startDate: string;

  @IsNumber()
  @Min(0)
  mealsPerDay: number;

  @IsEnum(TransportType)
  transportType: TransportType;

  @IsOptional()
  @IsArray()
  selectedExtras?: string[];

  @IsOptional()
  @IsString()
  clientNotes?: string;
}
