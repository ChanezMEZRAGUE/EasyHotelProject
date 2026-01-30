import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { HotelsService } from './hotels.service';
import { HotelQueryDto } from './hotels.dto';

@ApiTags('Hotels')
@Controller()
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get('regions')
  @ApiOperation({ summary: 'Liste des regions' })
  @ApiOkResponse({ description: 'Liste des regions' })
  getRegions() {
    return this.hotelsService.getRegions();
  }

  @Get('hotels')
  @ApiOperation({ summary: 'Liste des hotels (filtrable par region ou nom)' })
  @ApiQuery({ name: 'regionId', required: false })
  @ApiQuery({ name: 'q', required: false })
  @ApiOkResponse({ description: 'Liste des hotels' })
  getHotels(@Query() query: HotelQueryDto) {
    return this.hotelsService.getHotels({
      regionId: query.regionId,
      q: query.q,
    });
  }

  @Get('hotels/:id')
  @ApiOperation({ summary: 'Detail d\'un hotel avec ses chambres' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ description: 'Detail de l\'hotel' })
  async getHotelById(@Param('id') id: string) {
    const hotel = await this.hotelsService.getHotelById(id);
    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }
    return hotel;
  }
}
