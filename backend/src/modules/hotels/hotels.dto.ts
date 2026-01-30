import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class HotelQueryDto {
  @ApiPropertyOptional({ description: 'Filtrer par regionId' })
  @IsOptional()
  @IsUUID()
  regionId?: string;

  @ApiPropertyOptional({ description: 'Recherche par nom d\'hotel' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  q?: string;
}
