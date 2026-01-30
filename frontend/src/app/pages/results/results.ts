import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MATERIAL_MODULES } from '../../shared/material';
import { ApiService } from '../../core/api.service';
import { Hotel } from '../../core/models';

interface ResultHotel {
  id: string;
  name: string;
  address: string;
  pricePerNight: number;
  tags: string[];
  imageUrl?: string;
}

@Component({
  selector: 'app-results',
  imports: [CommonModule, RouterLink, ...MATERIAL_MODULES],
  templateUrl: './results.html',
  styleUrl: './results.scss'
})
export class Results implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  hotels: ResultHotel[] = [];
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    const regionId = this.route.snapshot.queryParamMap.get('regionId') ?? undefined;
    const q = this.route.snapshot.queryParamMap.get('q') ?? undefined;

    this.api.getHotels({ regionId, q }).subscribe({
      next: (hotels) => {
        this.hotels = hotels.map((hotel) => this.mapHotel(hotel));
        this.loading = false;
        console.log('Hotels API ->', hotels);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Hotels API error', err);
        this.errorMessage = 'Impossible de charger les hotels pour le moment.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private mapHotel(hotel: Hotel): ResultHotel {
    const prices = hotel.roomTypes?.map((room) => room.pricePerNightCents) ?? [];
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const tags = this.buildTags(hotel);

    return {
      id: hotel.id,
      name: hotel.name,
      address: hotel.address,
      pricePerNight: Math.round(minPrice / 100),
      tags,
      imageUrl: hotel.heroImageUrl,
    };
  }

  private buildTags(hotel: Hotel): string[] {
    const tags: string[] = [];

    if (hotel.policies?.allowFreeReservation) {
      tags.push('Annulation gratuite');
    }
    if (hotel.policies?.allowPay20DaysBefore) {
      tags.push('Payer plus tard');
    }
    if (hotel.policies?.allowPayOnSite) {
      tags.push('Payer sur place');
    }
    if (hotel.policies?.allowPayNow) {
      tags.push('Payer maintenant');
    }

    return tags.slice(0, 3);
  }
}
