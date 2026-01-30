import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
  private readonly cdr = inject(ChangeDetectorRef);

  rooms: RoomOption[] = [];
  hotel: Hotel | null = null;
  loading = true;
  errorMessage = '';

  paymentOptions = [
    { value: 'PAY_NOW', label: 'Payer maintenant' },
    { value: 'PAY_20_DAYS_BEFORE', label: 'Payer 20 jours avant' },
    { value: 'PAY_ON_SITE', label: 'Payer sur place' }
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
  }
}
