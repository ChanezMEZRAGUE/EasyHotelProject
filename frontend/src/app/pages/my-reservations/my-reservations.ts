import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MATERIAL_MODULES } from '../../shared/material';
import { ApiService } from '../../core/api.service';
import { Reservation } from '../../core/models';
import { I18nService } from '../../core/i18n.service';
import { TrPipe } from '../../shared/tr.pipe';

interface ReservationCard {
  id: string;
  roomTypeId: string;
  hotelName: string;
  dates: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rawStatus: string;
  rawPaymentMode: string;
  rawPaymentStatus: string;
  total: number;
}

@Component({
  selector: 'app-my-reservations',
  imports: [CommonModule, ReactiveFormsModule, TrPipe, ...MATERIAL_MODULES],
  templateUrl: './my-reservations.html',
  styleUrl: './my-reservations.scss'
})
export class MyReservations implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly i18n = inject(I18nService);

  reservations: ReservationCard[] = [];
  loading = true;
  saving = false;
  payingReservationId: string | null = null;
  message = '';
  editingReservationId: string | null = null;
  showPaymentModal = false;
  paymentTarget: ReservationCard | null = null;

  editForm = this.fb.group({
    checkIn: ['', Validators.required],
    checkOut: ['', Validators.required],
    guests: [2, [Validators.required, Validators.min(1), Validators.max(8)]],
  });

  paymentForm = this.fb.group({
    cardHolder: ['', [Validators.required, Validators.minLength(3)]],
    cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
    expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
  });

  ngOnInit(): void {
    this.loadReservations();
  }

  startEdit(reservation: ReservationCard): void {
    this.message = '';
    this.editingReservationId = reservation.id;
    this.editForm.setValue({
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      guests: reservation.guests,
    });
  }

  cancelEdit(): void {
    this.editingReservationId = null;
    this.editForm.reset({
      checkIn: '',
      checkOut: '',
      guests: 2,
    });
  }

  saveEdit(reservation: ReservationCard): void {
    this.message = '';
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const raw = this.editForm.getRawValue();
    if (!raw.checkIn || !raw.checkOut || raw.guests == null) {
      return;
    }
    if (raw.checkIn >= raw.checkOut) {
      this.message = this.i18n.t('api.invalidDateRange');
      return;
    }

    this.saving = true;
    this.api
      .updateReservation(reservation.id, {
        checkIn: raw.checkIn,
        checkOut: raw.checkOut,
        guests: Number(raw.guests),
      })
      .subscribe({
        next: () => {
          this.message = this.i18n.t('res.updated');
          this.saving = false;
          this.cancelEdit();
          this.loadReservations();
        },
        error: (err) => {
          this.saving = false;
          this.message = this.i18n.translateApiMessage(err?.error?.message, 'res.updateError');
          this.cdr.detectChanges();
        },
      });
  }

  cancelReservation(reservation: ReservationCard): void {
    this.message = '';
    const ok = window.confirm(this.i18n.t('res.cancelConfirm'));
    if (!ok) return;

    this.api.cancelReservation(reservation.id).subscribe({
      next: (response) => {
        this.message = this.i18n.translateApiMessage(response?.message, 'res.cancelled');
        this.loadReservations();
      },
      error: (err) => {
        this.message = this.i18n.translateApiMessage(err?.error?.message, 'res.cancelError');
        this.cdr.detectChanges();
      },
    });
  }

  openPaymentModal(reservation: ReservationCard): void {
    if (!this.canPay(reservation)) {
      return;
    }
    this.paymentTarget = reservation;
    this.paymentForm.reset({
      cardHolder: '',
      cardNumber: '',
      expiry: '',
      cvv: '',
    });
    this.showPaymentModal = true;
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
    this.paymentTarget = null;
    this.payingReservationId = null;
  }

  confirmPayment(): void {
    if (!this.paymentTarget) {
      return;
    }

    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      this.message = this.i18n.t('res.payInvalidForm');
      return;
    }

    this.message = '';
    const reservation = this.paymentTarget;
    this.payingReservationId = reservation.id;

    this.api.payReservation(reservation.id).subscribe({
      next: (response) => {
        this.message = this.i18n.translateApiMessage(response?.message, 'res.paid');
        this.closePaymentModal();
        this.loadReservations();
      },
      error: (err) => {
        this.payingReservationId = null;
        this.message = this.i18n.translateApiMessage(err?.error?.message, 'res.payError');
        this.cdr.detectChanges();
      },
    });
  }

  canPay(reservation: ReservationCard): boolean {
    if (reservation.rawStatus === 'CANCELLED') return false;
    if (reservation.rawPaymentStatus === 'PAID' || reservation.rawPaymentStatus === 'NOT_REQUIRED') return false;
    if (reservation.rawPaymentMode === 'PAY_ON_SITE') return false;
    if (reservation.rawPaymentMode === 'PAY_20_DAYS_BEFORE') return reservation.rawPaymentStatus === 'SCHEDULED';
    if (reservation.rawPaymentMode === 'PAY_NOW') return reservation.rawPaymentStatus === 'UNPAID';
    return false;
  }

  paymentStatusClass(reservation: ReservationCard): string {
    if (reservation.rawPaymentStatus === 'PAID') return 'payment-status paid';
    if (reservation.rawPaymentStatus === 'SCHEDULED') return 'payment-status scheduled';
    if (reservation.rawPaymentStatus === 'NOT_REQUIRED') return 'payment-status not-required';
    return 'payment-status unpaid';
  }

  payButtonLabelKey(reservation: ReservationCard): string {
    if (this.payingReservationId === reservation.id) return 'res.paying';
    if (this.canPay(reservation)) return 'res.pay';
    if (reservation.rawStatus === 'CANCELLED') return 'res.payDisabledCancelledShort';
    if (reservation.rawPaymentStatus === 'PAID') return 'res.payDisabledPaidShort';
    if (reservation.rawPaymentStatus === 'NOT_REQUIRED') return 'res.payDisabledNotRequiredShort';
    if (reservation.rawPaymentMode === 'PAY_ON_SITE') return 'res.payDisabledOnSiteShort';
    return 'res.payDisabledUnavailableShort';
  }

  payDisabledReason(reservation: ReservationCard): string {
    if (this.canPay(reservation)) return '';
    if (reservation.rawStatus === 'CANCELLED') return this.i18n.t('res.payDisabledCancelled');
    if (reservation.rawPaymentStatus === 'PAID') return this.i18n.t('res.payDisabledPaid');
    if (reservation.rawPaymentStatus === 'NOT_REQUIRED') return this.i18n.t('res.payDisabledNotRequired');
    if (reservation.rawPaymentMode === 'PAY_ON_SITE') return this.i18n.t('res.payDisabledOnSite');
    return this.i18n.t('res.payDisabledUnavailable');
  }

  private loadReservations(): void {
    this.loading = true;
    this.api.getMyReservations().subscribe({
      next: (items) => {
        this.reservations = items.map((r) => this.mapReservation(r));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private mapReservation(reservation: Reservation): ReservationCard {
    const checkIn = this.formatDateOnlyForLocale(reservation.checkIn);
    const checkOut = this.formatDateOnlyForLocale(reservation.checkOut);

    return {
      id: reservation.id,
      roomTypeId: reservation.roomTypeId,
      hotelName: reservation.hotel?.name ?? reservation.hotelId,
      dates: `${checkIn} - ${checkOut}`,
      checkIn: reservation.checkIn.slice(0, 10),
      checkOut: reservation.checkOut.slice(0, 10),
      guests: reservation.guests,
      rawStatus: reservation.status,
      rawPaymentMode: reservation.paymentMode,
      rawPaymentStatus: reservation.paymentStatus,
      total: Math.round(reservation.totalPriceCents / 100),
    };
  }

  private formatDateOnlyForLocale(value: string): string {
    const raw = value.slice(0, 10);
    const [year, month, day] = raw.split('-').map(Number);
    if (!year || !month || !day) {
      return raw;
    }
    const localDate = new Date(year, month - 1, day);
    return localDate.toLocaleDateString(this.i18n.locale());
  }
}
