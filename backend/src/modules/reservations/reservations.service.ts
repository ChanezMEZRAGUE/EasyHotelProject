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
      throw new BadRequestException("La date d'arrivée doit être avant la date de départ");
    }

    return this.prisma.$transaction(async (tx) => {
      const roomType = await tx.roomType.findUnique({
        where: { id: dto.roomTypeId },
        include: { hotel: true },
      });

      if (!roomType || roomType.hotelId !== dto.hotelId) {
        throw new NotFoundException('Chambre introuvable pour cet hôtel');
      }

      if (dto.guests > roomType.capacity) {
        throw new BadRequestException('Le nombre de voyageurs dépasse la capacité de la chambre');
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
        throw new ConflictException('Plus de disponibilité pour cette chambre sur ces dates');
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
            status: PaymentRecordStatus.INITIATED,
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
        throw new NotFoundException('Réservation introuvable');
      }

      if (existing.status === ReservationStatus.CANCELLED) {
        throw new BadRequestException('Impossible de modifier une réservation annulée');
      }

      const roomTypeId = dto.roomTypeId ?? existing.roomTypeId;
      const checkIn = dto.checkIn ? new Date(dto.checkIn) : existing.checkIn;
      const checkOut = dto.checkOut ? new Date(dto.checkOut) : existing.checkOut;
      const guests = dto.guests ?? existing.guests;

      if (checkIn >= checkOut) {
        throw new BadRequestException("La date d'arrivée doit être avant la date de départ");
      }

      const roomType = await tx.roomType.findUnique({
        where: { id: roomTypeId },
        include: { hotel: true },
      });

      if (!roomType || roomType.hotelId !== existing.hotelId) {
        throw new NotFoundException("Type de chambre introuvable pour cet hôtel");
      }

      if (guests > roomType.capacity) {
        throw new BadRequestException('Le nombre de voyageurs dépasse la capacité de la chambre');
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
        throw new ConflictException('Plus de disponibilité pour cette chambre sur ces dates');
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
      throw new NotFoundException('Réservation introuvable');
    }

    if (reservation.status === ReservationStatus.CANCELLED) {
      return {
        reservation,
        message: 'Réservation déjà annulée',
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
      message: 'Réservation annulée',
    };
  }

  async pay(userId: string, reservationId: string) {
    return this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id: reservationId },
        include: {
          hotel: { select: { id: true, name: true, address: true } },
          roomType: { select: { id: true, name: true } },
          payments: { orderBy: { createdAt: 'desc' } },
        },
      });

      if (!reservation || reservation.userId !== userId) {
        throw new NotFoundException('Réservation introuvable');
      }

      if (reservation.status === ReservationStatus.CANCELLED) {
        throw new BadRequestException('Impossible de payer une réservation annulée');
      }

      if (reservation.paymentMode === PaymentMode.FREE) {
        throw new BadRequestException('Aucun paiement requis pour cette réservation');
      }

      if (reservation.paymentMode === PaymentMode.PAY_ON_SITE) {
        throw new BadRequestException('Le paiement sur place ne peut pas être effectué en ligne');
      }

      if (reservation.paymentStatus === PaymentStatus.PAID) {
        return {
          reservation,
          message: 'Réservation déjà payée',
        };
      }

      const scheduledPayment = reservation.payments.find((payment) => payment.status === PaymentRecordStatus.INITIATED);
      let dueDate: Date | null = null;

      if (reservation.paymentMode === PaymentMode.PAY_20_DAYS_BEFORE) {
        const fallbackDueDate = new Date(reservation.checkIn);
        fallbackDueDate.setDate(fallbackDueDate.getDate() - 20);
        dueDate = scheduledPayment?.dueDate ?? fallbackDueDate;

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

        if (today < dueDay) {
          throw new BadRequestException("Le paiement n'est autorisé qu'à partir de 20 jours avant l'arrivée");
        }
      } else if (reservation.paymentMode !== PaymentMode.PAY_NOW) {
        throw new BadRequestException('Mode de paiement non pris en charge pour cette action');
      }

      if (scheduledPayment) {
        await tx.payment.update({
          where: { id: scheduledPayment.id },
          data: { status: PaymentRecordStatus.SUCCESS },
        });
      } else {
        await tx.payment.create({
          data: {
            reservationId: reservation.id,
            amountCents: reservation.totalPriceCents,
            status: PaymentRecordStatus.SUCCESS,
            dueDate: dueDate ?? undefined,
          },
        });
      }

      const updatedReservation = await tx.reservation.update({
        where: { id: reservation.id },
        data: { paymentStatus: PaymentStatus.PAID },
        include: {
          hotel: { select: { id: true, name: true, address: true } },
          roomType: { select: { id: true, name: true } },
        },
      });

      return {
        reservation: updatedReservation,
        message: 'Paiement effectué avec succès',
      };
    });
  }

  private computeNights(checkIn: Date, checkOut: Date): number {
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / msPerDay));
  }

  private computePaymentStatus(mode: PaymentMode): PaymentStatus {
    if (mode === PaymentMode.FREE) return PaymentStatus.NOT_REQUIRED;
    if (mode === PaymentMode.PAY_NOW) return PaymentStatus.UNPAID;
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
      throw new BadRequestException('Mode de paiement non autorisé pour cet hôtel');
    }
  }
}
