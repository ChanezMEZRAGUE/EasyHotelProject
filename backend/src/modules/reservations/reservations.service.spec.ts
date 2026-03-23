import { BadRequestException, ConflictException } from '@nestjs/common';
import {
  PaymentMode,
  PaymentRecordStatus,
  PaymentStatus,
  ReservationStatus,
} from '@prisma/client';
import { ReservationsService } from './reservations.service';

describe('ReservationsService', () => {
  let service: ReservationsService;

  const tx = {
    roomType: {
      findUnique: jest.fn(),
    },
    reservation: {
      count: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  const prisma = {
    $transaction: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(async (callback: (db: typeof tx) => unknown) =>
      callback(tx),
    );
    service = new ReservationsService(prisma as any);
  });

  it('rejects online payment when mode is PAY_ON_SITE', async () => {
    tx.reservation.findUnique.mockResolvedValue({
      id: 'res-1',
      userId: 'user-1',
      status: ReservationStatus.CONFIRMED,
      paymentMode: PaymentMode.PAY_ON_SITE,
      paymentStatus: PaymentStatus.UNPAID,
      checkIn: new Date('2026-05-30'),
      totalPriceCents: 20000,
      payments: [],
    });

    await expect(service.pay('user-1', 'res-1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects reservation creation when payment mode is not allowed by hotel policy', async () => {
    tx.roomType.findUnique.mockResolvedValue({
      id: 'rt-1',
      hotelId: 'hotel-1',
      totalRooms: 3,
      capacity: 2,
      pricePerNightCents: 10000,
      hotel: {
        policies: {
          allowPayNow: false,
          allowPay20DaysBefore: true,
          allowPayOnSite: true,
          allowFreeReservation: false,
        },
      },
    });

    await expect(
      service.create('user-1', {
        hotelId: 'hotel-1',
        roomTypeId: 'rt-1',
        checkIn: '2026-04-10',
        checkOut: '2026-04-12',
        guests: 2,
        paymentMode: PaymentMode.PAY_NOW,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects reservation creation when no room is available', async () => {
    tx.roomType.findUnique.mockResolvedValue({
      id: 'rt-1',
      hotelId: 'hotel-1',
      totalRooms: 1,
      capacity: 2,
      pricePerNightCents: 10000,
      hotel: {
        policies: {
          allowPayNow: true,
          allowPay20DaysBefore: true,
          allowPayOnSite: true,
          allowFreeReservation: false,
        },
      },
    });
    tx.reservation.count.mockResolvedValue(1);

    await expect(
      service.create('user-1', {
        hotelId: 'hotel-1',
        roomTypeId: 'rt-1',
        checkIn: '2026-04-10',
        checkOut: '2026-04-12',
        guests: 2,
        paymentMode: PaymentMode.PAY_NOW,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('creates reservation with computed total and scheduled payment for PAY_20_DAYS_BEFORE', async () => {
    tx.roomType.findUnique.mockResolvedValue({
      id: 'rt-1',
      hotelId: 'hotel-1',
      totalRooms: 2,
      capacity: 2,
      pricePerNightCents: 12000,
      hotel: {
        policies: {
          allowPayNow: true,
          allowPay20DaysBefore: true,
          allowPayOnSite: true,
          allowFreeReservation: false,
        },
      },
    });
    tx.reservation.count.mockResolvedValue(0);
    tx.reservation.create.mockResolvedValue({
      id: 'res-100',
      totalPriceCents: 36000,
      hotel: { id: 'hotel-1', name: 'Hotel 1', address: 'Addr' },
      roomType: { id: 'rt-1', name: 'Double' },
    });

    const result = await service.create('user-1', {
      hotelId: 'hotel-1',
      roomTypeId: 'rt-1',
      checkIn: '2026-04-10',
      checkOut: '2026-04-13',
      guests: 2,
      paymentMode: PaymentMode.PAY_20_DAYS_BEFORE,
    });

    expect(tx.reservation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          totalPriceCents: 36000,
          paymentStatus: PaymentStatus.SCHEDULED,
        }),
      }),
    );
    expect(tx.payment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          reservationId: 'res-100',
          amountCents: 36000,
          status: PaymentRecordStatus.INITIATED,
        }),
      }),
    );
    expect(result.id).toBe('res-100');
  });

  it('rejects PAY_20_DAYS_BEFORE before due date', async () => {
    const futureCheckIn = new Date();
    futureCheckIn.setDate(futureCheckIn.getDate() + 40);
    const futureDueDate = new Date();
    futureDueDate.setDate(futureDueDate.getDate() + 20);

    tx.reservation.findUnique.mockResolvedValue({
      id: 'res-2',
      userId: 'user-1',
      status: ReservationStatus.CONFIRMED,
      paymentMode: PaymentMode.PAY_20_DAYS_BEFORE,
      paymentStatus: PaymentStatus.SCHEDULED,
      checkIn: futureCheckIn,
      totalPriceCents: 30000,
      payments: [
        {
          id: 'pay-1',
          status: PaymentRecordStatus.INITIATED,
          dueDate: futureDueDate,
        },
      ],
    });

    await expect(service.pay('user-1', 'res-2')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('marks reservation as paid for PAY_NOW', async () => {
    tx.reservation.findUnique.mockResolvedValue({
      id: 'res-3',
      userId: 'user-1',
      status: ReservationStatus.CONFIRMED,
      paymentMode: PaymentMode.PAY_NOW,
      paymentStatus: PaymentStatus.UNPAID,
      checkIn: new Date('2026-04-10'),
      totalPriceCents: 45000,
      hotel: { id: 'h1', name: 'Hotel 1', address: 'Address 1' },
      roomType: { id: 'rt1', name: 'Suite' },
      payments: [
        {
          id: 'pay-2',
          status: PaymentRecordStatus.INITIATED,
          dueDate: null,
        },
      ],
    });

    tx.reservation.update.mockResolvedValue({
      id: 'res-3',
      paymentStatus: PaymentStatus.PAID,
      hotel: { id: 'h1', name: 'Hotel 1', address: 'Address 1' },
      roomType: { id: 'rt1', name: 'Suite' },
    });

    const result = await service.pay('user-1', 'res-3');

    expect(tx.payment.update).toHaveBeenCalledWith({
      where: { id: 'pay-2' },
      data: { status: PaymentRecordStatus.SUCCESS },
    });
    expect(tx.reservation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'res-3' },
        data: { paymentStatus: PaymentStatus.PAID },
      }),
    );
    expect(result.message).toContain('Paiement');
  });
});
