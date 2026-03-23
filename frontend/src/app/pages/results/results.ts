import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MATERIAL_MODULES } from '../../shared/material';
import { ApiService } from '../../core/api.service';
import { Hotel } from '../../core/models';
import { TrPipe } from '../../shared/tr.pipe';
import { I18nService } from '../../core/i18n.service';

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
  imports: [CommonModule, RouterLink, TrPipe, ...MATERIAL_MODULES],
  templateUrl: './results.html',
  styleUrl: './results.scss'
})
export class Results implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly i18n = inject(I18nService);

  hotels: ResultHotel[] = [];
  loading = true;
  errorMessage = '';
  hotelQueryParams: { checkIn?: string; checkOut?: string; guests?: number } = {};

  ngOnInit(): void {
    const regionId = this.route.snapshot.queryParamMap.get('regionId') ?? undefined;
    const q = this.route.snapshot.queryParamMap.get('q') ?? undefined;
    const checkIn = this.route.snapshot.queryParamMap.get('checkIn') ?? undefined;
    const checkOut = this.route.snapshot.queryParamMap.get('checkOut') ?? undefined;
    const guestsRaw = this.route.snapshot.queryParamMap.get('guests');
    const guests = guestsRaw ? Number(guestsRaw) : undefined;

    this.hotelQueryParams = {
      ...(checkIn ? { checkIn } : {}),
      ...(checkOut ? { checkOut } : {}),
      ...(Number.isFinite(guests) ? { guests } : {}),
    };

    const hasAvailabilityParams = Boolean(
      regionId &&
      checkIn &&
      checkOut &&
      Number.isFinite(guests) &&
      (guests as number) > 0,
    );

    const request$ = hasAvailabilityParams
      ? this.api.searchAvailability({
          regionId: regionId as string,
          checkIn: checkIn as string,
          checkOut: checkOut as string,
          guests: guests as number,
        })
      : this.api.getHotels({ regionId, q });

    request$.subscribe({
      next: (hotels) => {
        this.hotels = hotels.map((hotel) => this.mapHotel(hotel));
        this.loading = false;
        console.log('Hotels API ->', hotels);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Hotels API error', err);
        this.errorMessage = this.i18n.translateApiMessage(err?.error?.message, 'results.error');
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
      tags.push(this.i18n.t('results.tag.freeCancel'));
    }
    if (hotel.policies?.allowPay20DaysBefore) {
      tags.push(this.i18n.t('results.tag.payLater'));
    }
    if (hotel.policies?.allowPayOnSite) {
      tags.push(this.i18n.t('results.tag.payOnSite'));
    }
    if (hotel.policies?.allowPayNow) {
      tags.push(this.i18n.t('results.tag.payNow'));
    }

    return tags.slice(0, 3);
  }
}
