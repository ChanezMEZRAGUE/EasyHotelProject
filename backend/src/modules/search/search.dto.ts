import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsUUID, Min } from 'class-validator';

export class SearchAvailabilityQueryDto {
  @ApiProperty({ description: 'Region id' })
  @IsUUID()
  regionId: string;

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
}
