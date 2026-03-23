import { BadRequestException } from '@nestjs/common';
import { SearchService } from './search.service';

describe('SearchService', () => {
  const prisma = {
    hotel: { findMany: jest.fn() },
    reservation: { findMany: jest.fn() },
  };

  let service: SearchService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SearchService(prisma as any);
  });

  it('rejects invalid date range', async () => {
    await expect(
      service.getAvailability({
        regionId: 'region-1',
        checkIn: '2026-04-10',
        checkOut: '2026-04-10',
        guests: 2,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns only room types with enough capacity and positive availability', async () => {
    prisma.hotel.findMany.mockResolvedValue([
      {
        id: 'hotel-1',
        name: 'Hotel A',
        roomTypes: [
          { id: 'rt-1', capacity: 2, totalRooms: 2, pricePerNightCents: 10000 },
          { id: 'rt-2', capacity: 1, totalRooms: 5, pricePerNightCents: 6000 },
        ],
      },
    ]);
    prisma.reservation.findMany.mockResolvedValue([
      { roomTypeId: 'rt-1' },
      { roomTypeId: 'rt-1' },
    ]);

    const result = await service.getAvailability({
      regionId: 'region-1',
      checkIn: '2026-04-10',
      checkOut: '2026-04-12',
      guests: 2,
    });

    expect(result).toHaveLength(0);
  });

  it('keeps hotels with at least one available matching room type', async () => {
    prisma.hotel.findMany.mockResolvedValue([
      {
        id: 'hotel-1',
        name: 'Hotel A',
        roomTypes: [
          { id: 'rt-1', capacity: 2, totalRooms: 3, pricePerNightCents: 10000 },
          { id: 'rt-2', capacity: 4, totalRooms: 1, pricePerNightCents: 18000 },
        ],
      },
    ]);
    prisma.reservation.findMany.mockResolvedValue([{ roomTypeId: 'rt-1' }]);

    const result = await service.getAvailability({
      regionId: 'region-1',
      checkIn: '2026-04-10',
      checkOut: '2026-04-12',
      guests: 2,
    });

    expect(result).toHaveLength(1);
    expect(result[0].roomTypes).toHaveLength(2);
    expect(result[0].roomTypes[0].availableRooms).toBe(2);
    expect(result[0].roomTypes[1].availableRooms).toBe(1);
  });
});
