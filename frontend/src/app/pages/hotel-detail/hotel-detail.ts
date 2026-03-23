import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MATERIAL_MODULES } from '../../shared/material';
import { ApiService } from '../../core/api.service';
import { Hotel } from '../../core/models';
import { TrPipe } from '../../shared/tr.pipe';
import { I18nService } from '../../core/i18n.service';
import { Subscription } from 'rxjs';

interface RoomOption {
  id: string;
  name: string;
  capacity: number;
  price: number;
  available: number;
}

@Component({
  selector: 'app-hotel-detail',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TrPipe, ...MATERIAL_MODULES],
  templateUrl: './hotel-detail.html',
  styleUrl: './hotel-detail.scss'
})
export class HotelDetail implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly i18n = inject(I18nService);

  rooms: RoomOption[] = [];
  hotel: Hotel | null = null;
  loading = true;
  errorMessage = '';
  reserveError = '';
  reserveSuccess = '';
  reserving = false;

  paymentOptions: Array<{ value: string; label: string }> = [];
  private langSub?: Subscription;

  form = this.fb.group({
    roomTypeId: ['', Validators.required],
    checkIn: ['', Validators.required],
    checkOut: ['', Validators.required],
    guests: [2, [Validators.required, Validators.min(1), Validators.max(6)]],
    paymentMode: ['', Validators.required]
  });

  ngOnInit(): void {
    this.langSub = this.i18n.lang$.subscribe(() => {
      if (this.hotel) {
        this.updatePaymentOptionsFromPolicies(this.hotel);
        this.cdr.detectChanges();
      }
    });

    const id = this.route.snapshot.paramMap.get('id');
    const checkIn = this.normalizeQueryDate(this.route.snapshot.queryParamMap.get('checkIn'));
    const checkOut = this.normalizeQueryDate(this.route.snapshot.queryParamMap.get('checkOut'));
    const guestsRaw = this.route.snapshot.queryParamMap.get('guests');
    const guests = guestsRaw ? Number(guestsRaw) : null;

    this.form.patchValue({
      checkIn: checkIn ?? '',
      checkOut: checkOut ?? '',
      guests: Number.isFinite(guests) && (guests as number) > 0 ? (guests as number) : 2,
    });

    if (!id) {
      this.loading = false;
      return;
    }

    this.api.getHotel(id).subscribe({
      next: (hotel) => {
        this.hotel = hotel;
        this.updatePaymentOptionsFromPolicies(hotel);
        const roomTypes = hotel.roomTypes ?? [];
        this.rooms = roomTypes.map((room) => ({
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          price: Math.round(room.pricePerNightCents / 100),
          available: room.availableRooms ?? room.totalRooms,
        }));
        this.loading = false;
        console.log('Hotel detail API ->', hotel);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Hotel detail API error', err);
        this.errorMessage = this.i18n.translateApiMessage(err?.error?.message, 'hotel.error');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  cancellationPolicyText(): string {
    const days = this.hotel?.policies?.cancellationFreeUntilDaysBefore ?? 0;
    if (days <= 0) {
      return this.i18n.t('hotel.cancelPolicyNoFree');
    }

    if (this.i18n.lang === 'fr') {
      return days === 1
        ? "Annulation gratuite jusqu'a 1 jour avant l'arrivee."
        : `Annulation gratuite jusqu'a ${days} jours avant l'arrivee.`;
    }

    return days === 1
      ? 'Free cancellation up to 1 day before check-in.'
      : `Free cancellation up to ${days} days before check-in.`;
  }

  roomCancellationBadge(): string {
    const days = this.hotel?.policies?.cancellationFreeUntilDaysBefore ?? 0;
    if (days <= 0) {
      return this.i18n.t('hotel.noFreeCancel');
    }

    if (this.i18n.lang === 'fr') {
      return days === 1 ? "Annulation gratuite jusqu'a J-1" : `Annulation gratuite jusqu'a J-${days}`;
    }

    return days === 1 ? 'Free cancellation until D-1' : `Free cancellation until D-${days}`;
  }

  reserve(): void {
    this.reserveError = '';
    this.reserveSuccess = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.hotel) {
      this.reserveError = this.i18n.t('hotel.notFound');
      return;
    }

    const raw = this.form.getRawValue();
    if (!raw.roomTypeId || !raw.checkIn || !raw.checkOut || !raw.paymentMode || raw.guests == null) {
      this.reserveError = this.i18n.t('hotel.fillAll');
      return;
    }
    if (raw.checkIn >= raw.checkOut) {
      this.reserveError = this.i18n.t('api.invalidDateRange');
      return;
    }

    this.reserving = true;

    this.api
      .createReservation({
        hotelId: this.hotel.id,
        roomTypeId: raw.roomTypeId,
        checkIn: raw.checkIn,
        checkOut: raw.checkOut,
        guests: Number(raw.guests),
        paymentMode: raw.paymentMode as 'PAY_NOW' | 'PAY_20_DAYS_BEFORE' | 'PAY_ON_SITE' | 'FREE',
      })
      .subscribe({
        next: () => {
          this.reserveSuccess = this.i18n.t('hotel.success');
          this.reserving = false;
          this.cdr.detectChanges();
          void this.router.navigate(['/my-reservations']);
        },
        error: (err) => {
          this.reserving = false;
          this.reserveError = this.i18n.translateApiMessage(err?.error?.message, 'hotel.confirmError');
          this.cdr.detectChanges();
        },
      });
  }

  private updatePaymentOptionsFromPolicies(hotel: Hotel): void {
    const options: Array<{ value: string; label: string }> = [];
    if (hotel.policies?.allowPayNow) {
      options.push({ value: 'PAY_NOW', label: this.i18n.t('hotel.payNow') });
    }
    if (hotel.policies?.allowPay20DaysBefore) {
      options.push({ value: 'PAY_20_DAYS_BEFORE', label: this.i18n.t('hotel.pay20') });
    }
    if (hotel.policies?.allowPayOnSite) {
      options.push({ value: 'PAY_ON_SITE', label: this.i18n.t('hotel.payOnSite') });
    }
    if (hotel.policies?.allowFreeReservation) {
      options.push({ value: 'FREE', label: this.i18n.t('hotel.free') });
    }

    this.paymentOptions = options;
    const current = this.form.get('paymentMode')?.value;
    if (!current || !options.some((o) => o.value === current)) {
      this.form.patchValue({ paymentMode: options[0]?.value ?? '' });
    }
  }

  private normalizeQueryDate(value: string | null): string | null {
    if (!value) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return value.slice(0, 10);

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
