import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import {
  PaymentMode,
  PaymentRecordStatus,
  PaymentStatus,
  ReservationStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReservationDto, UpdateReservationDto } from './reservations.dto';

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateReservationDto) {
    const checkIn = new Date(dto.checkIn);
    const checkOut = new Date(dto.checkOut);

    if (checkIn >= checkOut) {
      throw new BadRequestException("La date d'arrivee doit etre avant la date de depart");
    }

    return this.prisma.$transaction(async (tx) => {
      const roomType = await tx.roomType.findUnique({
        where: { id: dto.roomTypeId },
        include: { hotel: true },
      });

      if (!roomType || roomType.hotelId !== dto.hotelId) {
        throw new NotFoundException('Chambre introuvable pour cet hotel');
      }

      if (dto.guests > roomType.capacity) {
        throw new BadRequestException('Le nombre de voyageurs depasse la capacite de la chambre');
      }

      this.ensurePaymentModeAllowed(dto.paymentMode, roomType.hotel.policies as Record<string, unknown>);

      const overlapping = await tx.reservation.count({
        where: {
          roomTypeId: dto.roomTypeId,
          status: { in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
          checkIn: { lt: checkOut },
          checkOut: { gt: checkIn },
        },
      });

      const available = roomType.totalRooms - overlapping;
      if (available <= 0) {
        throw new ConflictException('Plus de disponibilite pour cette chambre sur ces dates');
      }

      const nights = this.computeNights(checkIn, checkOut);
      const totalPriceCents = nights * roomType.pricePerNightCents;
      const paymentStatus = this.computePaymentStatus(dto.paymentMode);

      const reservation = await tx.reservation.create({
        data: {
          userId,
          hotelId: dto.hotelId,
          roomTypeId: dto.roomTypeId,
          checkIn,
          checkOut,
          guests: dto.guests,
          status: ReservationStatus.CONFIRMED,
          paymentMode: dto.paymentMode,
          paymentStatus,
          totalPriceCents,
        },
        include: {
          hotel: { select: { id: true, name: true, address: true } },
          roomType: { select: { id: true, name: true } },
        },
      });

      if (dto.paymentMode === PaymentMode.PAY_NOW) {
        await tx.payment.create({
          data: {
            reservationId: reservation.id,
            amountCents: totalPriceCents,
            status: PaymentRecordStatus.SUCCESS,
          },
        });
      } else if (dto.paymentMode === PaymentMode.PAY_20_DAYS_BEFORE) {
        const dueDate = new Date(checkIn);
        dueDate.setDate(dueDate.getDate() - 20);
        await tx.payment.create({
          data: {
            reservationId: reservation.id,
            amountCents: totalPriceCents,
            status: PaymentRecordStatus.INITIATED,
            dueDate,
          },
        });
      }

      return reservation;
    });
  }

  async listForUser(userId: string) {
    return this.prisma.reservation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        hotel: { select: { id: true, name: true, address: true } },
        roomType: { select: { id: true, name: true } },
      },
    });
  }

  async update(userId: string, reservationId: string, dto: UpdateReservationDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.reservation.findUnique({
        where: { id: reservationId },
      });

      if (!existing || existing.userId !== userId) {
        throw new NotFoundException('Reservation introuvable');
      }

      if (existing.status === ReservationStatus.CANCELLED) {
        throw new BadRequestException('Impossible de modifier une reservation annulee');
      }

      const roomTypeId = dto.roomTypeId ?? existing.roomTypeId;
      const checkIn = dto.checkIn ? new Date(dto.checkIn) : existing.checkIn;
      const checkOut = dto.checkOut ? new Date(dto.checkOut) : existing.checkOut;
      const guests = dto.guests ?? existing.guests;

      if (checkIn >= checkOut) {
        throw new BadRequestException("La date d'arrivee doit etre avant la date de depart");
      }

      const roomType = await tx.roomType.findUnique({
        where: { id: roomTypeId },
        include: { hotel: true },
      });

      if (!roomType || roomType.hotelId !== existing.hotelId) {
        throw new NotFoundException("Type de chambre introuvable pour cet hotel");
      }

      if (guests > roomType.capacity) {
        throw new BadRequestException('Le nombre de voyageurs depasse la capacite de la chambre');
      }

      const overlapping = await tx.reservation.count({
        where: {
          id: { not: existing.id },
          roomTypeId,
          status: { in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
          checkIn: { lt: checkOut },
          checkOut: { gt: checkIn },
        },
      });

      const available = roomType.totalRooms - overlapping;
      if (available <= 0) {
        throw new ConflictException('Plus de disponibilite pour cette chambre sur ces dates');
      }

      const nights = this.computeNights(checkIn, checkOut);
      const totalPriceCents = nights * roomType.pricePerNightCents;

      return tx.reservation.update({
        where: { id: existing.id },
        data: {
          roomTypeId,
          checkIn,
          checkOut,
          guests,
          totalPriceCents,
        },
        include: {
          hotel: { select: { id: true, name: true, address: true } },
          roomType: { select: { id: true, name: true } },
        },
      });
    });
  }

  async cancel(userId: string, reservationId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { hotel: true },
    });

    if (!reservation || reservation.userId !== userId) {
      throw new NotFoundException('Reservation introuvable');
    }

    if (reservation.status === ReservationStatus.CANCELLED) {
      return {
        reservation,
        message: 'Reservation deja annulee',
      };
    }

    const updated = await this.prisma.reservation.update({
      where: { id: reservation.id },
      data: { status: ReservationStatus.CANCELLED },
      include: {
        hotel: { select: { id: true, name: true, address: true } },
        roomType: { select: { id: true, name: true } },
      },
    });

    return {
      reservation: updated,
      message: 'Reservation annulee',
    };
  }

  private computeNights(checkIn: Date, checkOut: Date): number {
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / msPerDay));
  }

  private computePaymentStatus(mode: PaymentMode): PaymentStatus {
    if (mode === PaymentMode.FREE) return PaymentStatus.NOT_REQUIRED;
    if (mode === PaymentMode.PAY_NOW) return PaymentStatus.PAID;
    if (mode === PaymentMode.PAY_20_DAYS_BEFORE) return PaymentStatus.SCHEDULED;
    return PaymentStatus.UNPAID;
  }

  private ensurePaymentModeAllowed(mode: PaymentMode, policies: Record<string, unknown>) {
    const allowPayNow = policies.allowPayNow === true;
    const allowPay20DaysBefore = policies.allowPay20DaysBefore === true;
    const allowPayOnSite = policies.allowPayOnSite === true;
    const allowFreeReservation = policies.allowFreeReservation === true;

    const allowed =
      (mode === PaymentMode.PAY_NOW && allowPayNow) ||
      (mode === PaymentMode.PAY_20_DAYS_BEFORE && allowPay20DaysBefore) ||
      (mode === PaymentMode.PAY_ON_SITE && allowPayOnSite) ||
      (mode === PaymentMode.FREE && allowFreeReservation);

    if (!allowed) {
      throw new BadRequestException('Mode de paiement non autorise pour cet hotel');
    }
  }
}
