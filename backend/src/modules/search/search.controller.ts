import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SearchAvailabilityQueryDto } from './search.dto';
import { SearchService } from './search.service';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('availability')
  @ApiOperation({ summary: 'Search hotel availability by region, dates and guests' })
  @ApiQuery({ name: 'regionId', required: true })
  @ApiQuery({ name: 'checkIn', required: true, example: '2026-03-10' })
  @ApiQuery({ name: 'checkOut', required: true, example: '2026-03-12' })
  @ApiQuery({ name: 'guests', required: true, example: 2 })
  @ApiOkResponse({ description: 'List of hotels and room types with computed availability' })
  getAvailability(@Query() query: SearchAvailabilityQueryDto) {
    return this.searchService.getAvailability(query);
  }
}
