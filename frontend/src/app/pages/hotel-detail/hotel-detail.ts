import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MATERIAL_MODULES } from '../../shared/material';
import { ApiService } from '../../core/api.service';
import { Hotel } from '../../core/models';

interface RoomOption {
  id: string;
  name: string;
  capacity: number;
  price: number;
  available: number;
}

@Component({
  selector: 'app-hotel-detail',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ...MATERIAL_MODULES],
  templateUrl: './hotel-detail.html',
  styleUrl: './hotel-detail.scss'
})
export class HotelDetail implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  rooms: RoomOption[] = [];
  hotel: Hotel | null = null;
  loading = true;
  errorMessage = '';
  reserveError = '';
  reserveSuccess = '';
  reserving = false;

  paymentOptions = [
    { value: 'PAY_NOW', label: 'Payer maintenant' },
    { value: 'PAY_20_DAYS_BEFORE', label: 'Payer 20 jours avant' },
    { value: 'PAY_ON_SITE', label: 'Payer sur place' },
    { value: 'FREE', label: 'Reservation gratuite' }
  ];

  form = this.fb.group({
    roomTypeId: ['', Validators.required],
    checkIn: ['', Validators.required],
    checkOut: ['', Validators.required],
    guests: [2, [Validators.required, Validators.min(1), Validators.max(6)]],
    paymentMode: ['', Validators.required]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
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
        this.errorMessage = 'Impossible de charger cet hotel.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  reserve(): void {
    this.reserveError = '';
    this.reserveSuccess = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.hotel) {
      this.reserveError = "Hotel introuvable.";
      return;
    }

    const raw = this.form.getRawValue();
    if (!raw.roomTypeId || !raw.checkIn || !raw.checkOut || !raw.paymentMode || raw.guests == null) {
      this.reserveError = "Merci de remplir tous les champs.";
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
          this.reserveSuccess = 'Reservation confirmee.';
          this.reserving = false;
          this.cdr.detectChanges();
          void this.router.navigate(['/my-reservations']);
        },
        error: (err) => {
          this.reserving = false;
          this.reserveError = err?.error?.message ?? 'Impossible de confirmer la reservation.';
          this.cdr.detectChanges();
        },
      });
  }

  private updatePaymentOptionsFromPolicies(hotel: Hotel): void {
    const options: Array<{ value: string; label: string }> = [];
    if (hotel.policies?.allowPayNow) {
      options.push({ value: 'PAY_NOW', label: 'Payer maintenant' });
    }
    if (hotel.policies?.allowPay20DaysBefore) {
      options.push({ value: 'PAY_20_DAYS_BEFORE', label: 'Payer 20 jours avant' });
    }
    if (hotel.policies?.allowPayOnSite) {
      options.push({ value: 'PAY_ON_SITE', label: 'Payer sur place' });
    }
    if (hotel.policies?.allowFreeReservation) {
      options.push({ value: 'FREE', label: 'Reservation gratuite' });
    }

    this.paymentOptions = options;
    const current = this.form.get('paymentMode')?.value;
    if (!current || !options.some((o) => o.value === current)) {
      this.form.patchValue({ paymentMode: options[0]?.value ?? '' });
    }
  }
}
