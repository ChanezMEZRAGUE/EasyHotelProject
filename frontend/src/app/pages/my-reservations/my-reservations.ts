import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MATERIAL_MODULES } from '../../shared/material';

interface ReservationCard {
  id: string;
  hotelName: string;
  dates: string;
  status: string;
  payment: string;
  total: number;
}

@Component({
  selector: 'app-my-reservations',
  imports: [CommonModule, ...MATERIAL_MODULES],
  templateUrl: './my-reservations.html',
  styleUrl: './my-reservations.scss'
})
export class MyReservations {
  reservations: ReservationCard[] = [
    {
      id: 'r101',
      hotelName: 'Atlas Riverside',
      dates: '12 Feb 2026 - 15 Feb 2026',
      status: 'CONFIRMED',
      payment: 'PAY_20_DAYS_BEFORE',
      total: 540
    },
    {
      id: 'r102',
      hotelName: 'Marina Centrale',
      dates: '22 Mar 2026 - 24 Mar 2026',
      status: 'PENDING',
      payment: 'PAY_NOW',
      total: 380
    }
  ];
}
