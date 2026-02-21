import { IsString, IsNumber, IsArray, IsOptional, IsBoolean, IsObject, Min, IsNotEmpty } from 'class-validator';

export class CreateTripDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsNumber()
  @Min(1)
  durationDays: number;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsArray()
  highlights?: string[];

  @IsOptional()
  @IsArray()
  includedItems?: string[];

  @IsOptional()
  @IsArray()
  excludedItems?: string[];

  @IsObject()
  priceConfig: {
    basePerStudent: number;
    basePerAdult?: number;
    mealPerPersonPerDay?: number;
    transportSurcharge?: Record<string, number>;
    extras?: Record<string, number>;
  };

  @IsOptional()
  @IsArray()
  availableTransport?: string[];

  @IsOptional()
  @IsObject()
  availableExtras?: Record<string, number>;

  @IsOptional()
  @IsNumber()
  minStudents?: number;

  @IsOptional()
  @IsNumber()
  maxStudents?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];
}
