import { BadRequestException, Injectable } from '@nestjs/common';
import { ReservationStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchAvailabilityQueryDto } from './search.dto';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async getAvailability(query: SearchAvailabilityQueryDto) {
    const checkIn = new Date(query.checkIn);
    const checkOut = new Date(query.checkOut);

    if (checkIn >= checkOut) {
      throw new BadRequestException('checkIn must be before checkOut');
    }

    const hotels = await this.prisma.hotel.findMany({
      where: { regionId: query.regionId },
      include: { roomTypes: true },
      orderBy: { name: 'asc' },
    });

    const hotelIds = hotels.map((hotel) => hotel.id);
    if (hotelIds.length === 0) {
      return [];
    }

    const overlappingReservations = await this.prisma.reservation.findMany({
      where: {
        hotelId: { in: hotelIds },
        status: { in: [ReservationStatus.CONFIRMED, ReservationStatus.PENDING] },
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn },
      },
      select: { roomTypeId: true },
    });

    const reservedCountByRoomType = overlappingReservations.reduce<Record<string, number>>(
      (acc, reservation) => {
        acc[reservation.roomTypeId] = (acc[reservation.roomTypeId] ?? 0) + 1;
        return acc;
      },
      {},
    );

    return hotels
      .map((hotel) => {
        const roomTypes = hotel.roomTypes
          .map((roomType) => {
            const reserved = reservedCountByRoomType[roomType.id] ?? 0;
            const availableRooms = Math.max(roomType.totalRooms - reserved, 0);
            return {
              ...roomType,
              availableRooms,
            };
          })
          .filter((roomType) => roomType.capacity >= query.guests && roomType.availableRooms > 0);

        if (roomTypes.length === 0) {
          return null;
        }

        return {
          ...hotel,
          roomTypes,
        };
      })
      .filter((hotel): hotel is NonNullable<typeof hotel> => hotel !== null);
  }
}
