import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MATERIAL_MODULES } from '../../shared/material';
import { ApiService } from '../../core/api.service';
import { Reservation } from '../../core/models';

interface ReservationCard {
  id: string;
  roomTypeId: string;
  hotelName: string;
  dates: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: string;
  payment: string;
  total: number;
}

@Component({
  selector: 'app-my-reservations',
  imports: [CommonModule, ReactiveFormsModule, ...MATERIAL_MODULES],
  templateUrl: './my-reservations.html',
  styleUrl: './my-reservations.scss'
})
export class MyReservations implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  reservations: ReservationCard[] = [];
  loading = true;
  saving = false;
  message = '';
  editingReservationId: string | null = null;

  editForm = this.fb.group({
    checkIn: ['', Validators.required],
    checkOut: ['', Validators.required],
    guests: [2, [Validators.required, Validators.min(1), Validators.max(8)]],
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

    this.saving = true;
    this.api
      .updateReservation(reservation.id, {
        checkIn: raw.checkIn,
        checkOut: raw.checkOut,
        guests: Number(raw.guests),
      })
      .subscribe({
        next: () => {
          this.message = 'Reservation modifiee.';
          this.saving = false;
          this.cancelEdit();
          this.loadReservations();
        },
        error: (err) => {
          this.saving = false;
          this.message = err?.error?.message ?? 'Impossible de modifier la reservation.';
          this.cdr.detectChanges();
        },
      });
  }

  cancelReservation(reservation: ReservationCard): void {
    this.message = '';
    const ok = window.confirm('Confirmer l’annulation de cette reservation ?');
    if (!ok) return;

    this.api.cancelReservation(reservation.id).subscribe({
      next: () => {
        this.message = 'Reservation annulee.';
        this.loadReservations();
      },
      error: (err) => {
        this.message = err?.error?.message ?? "Impossible d'annuler la reservation.";
        this.cdr.detectChanges();
      },
    });
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
    const checkIn = new Date(reservation.checkIn).toLocaleDateString('fr-FR');
    const checkOut = new Date(reservation.checkOut).toLocaleDateString('fr-FR');

    return {
      id: reservation.id,
      roomTypeId: reservation.roomTypeId,
      hotelName: reservation.hotel?.name ?? reservation.hotelId,
      dates: `${checkIn} - ${checkOut}`,
      checkIn: reservation.checkIn.slice(0, 10),
      checkOut: reservation.checkOut.slice(0, 10),
      guests: reservation.guests,
      status: reservation.status,
      payment: reservation.paymentMode,
      total: Math.round(reservation.totalPriceCents / 100),
    };
  }
}
