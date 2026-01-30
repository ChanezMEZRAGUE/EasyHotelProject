import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HotelsService {
  constructor(private readonly prisma: PrismaService) {}

  getRegions() {
    return this.prisma.region.findMany({
      orderBy: { name: 'asc' },
    });
  }

  getHotels(params: { regionId?: string; q?: string }) {
    const where: {
      regionId?: string;
      name?: { contains: string; mode: 'insensitive' };
    } = {};

    if (params.regionId) {
      where.regionId = params.regionId;
    }

    if (params.q) {
      where.name = { contains: params.q, mode: 'insensitive' };
    }

    return this.prisma.hotel.findMany({
      where,
      orderBy: { name: 'asc' },
      include: { roomTypes: true },
    });
  }

  getHotelById(id: string) {
    return this.prisma.hotel.findUnique({
      where: { id },
      include: { roomTypes: true },
    });
  }
}
