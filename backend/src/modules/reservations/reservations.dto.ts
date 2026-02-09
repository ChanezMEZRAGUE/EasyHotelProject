import { ApiProperty } from '@nestjs/swagger';
import { PaymentMode } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({ description: 'Hotel id' })
  @IsUUID()
  hotelId: string;

  @ApiProperty({ description: 'Room type id' })
  @IsUUID()
  roomTypeId: string;

  @ApiProperty({ description: 'Check-in date (YYYY-MM-DD)' })
  @IsDateString()
  checkIn: string;

  @ApiProperty({ description: 'Check-out date (YYYY-MM-DD)' })
  @IsDateString()
  checkOut: string;

  @ApiProperty({ description: 'Number of guests', minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  guests: number;

  @ApiProperty({ enum: PaymentMode })
  @IsEnum(PaymentMode)
  paymentMode: PaymentMode;
}

export class UpdateReservationDto {
  @ApiProperty({ description: 'Room type id', required: false })
  @IsOptional()
  @IsUUID()
  roomTypeId?: string;

  @ApiProperty({ description: 'Check-in date (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString()
  checkIn?: string;

  @ApiProperty({ description: 'Check-out date (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString()
  checkOut?: string;

  @ApiProperty({ description: 'Number of guests', minimum: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  guests?: number;
}
