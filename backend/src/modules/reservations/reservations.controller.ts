import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateReservationDto, UpdateReservationDto } from './reservations.dto';
import { ReservationsService } from './reservations.service';

@ApiTags('Reservations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @ApiOperation({ summary: 'Creer une reservation' })
  @ApiOkResponse({ description: 'Reservation creee' })
  create(@Req() req: Request, @Body() dto: CreateReservationDto) {
    const user = (req as any).user;
    return this.reservationsService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister mes reservations' })
  @ApiOkResponse({ description: 'Reservations utilisateur' })
  listMine(@Req() req: Request) {
    const user = (req as any).user;
    return this.reservationsService.listForUser(user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une reservation' })
  @ApiOkResponse({ description: 'Reservation modifiee' })
  update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateReservationDto) {
    const user = (req as any).user;
    return this.reservationsService.update(user.sub, id, dto);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Annuler une reservation' })
  @ApiOkResponse({ description: 'Reservation annulee' })
  cancel(@Req() req: Request, @Param('id') id: string) {
    const user = (req as any).user;
    return this.reservationsService.cancel(user.sub, id);
  }
}
