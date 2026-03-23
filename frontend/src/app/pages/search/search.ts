import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MATERIAL_MODULES } from '../../shared/material';
import { ApiService } from '../../core/api.service';
import { Region } from '../../core/models';
import { TrPipe } from '../../shared/tr.pipe';

@Component({
  selector: 'app-search',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TrPipe, ...MATERIAL_MODULES],
  templateUrl: './search.html',
  styleUrl: './search.scss'
})
export class Search implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  regions: Region[] = [];
  loadingRegions = true;
  searchError = '';

  form = this.fb.group({
    regionId: ['', Validators.required],
    checkIn: ['', Validators.required],
    checkOut: ['', Validators.required],
    guests: [2, [Validators.required, Validators.min(1), Validators.max(8)]],
    business: [false]
  });

  ngOnInit(): void {
    this.api.getRegions().subscribe({
      next: (regions) => {
        this.regions = regions;
        this.loadingRegions = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingRegions = false;
        this.cdr.detectChanges();
      }
    });
  }

  submit(): void {
    this.searchError = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const checkIn = this.toYyyyMmDd(raw.checkIn);
    const checkOut = this.toYyyyMmDd(raw.checkOut);
    if (!checkIn || !checkOut || checkIn >= checkOut) {
      this.searchError = 'api.invalidDateRange';
      this.cdr.detectChanges();
      return;
    }

    this.router.navigate(['/results'], {
      queryParams: {
        regionId: raw.regionId,
        checkIn,
        checkOut,
        guests: raw.guests,
      },
    });
  }

  private toYyyyMmDd(value: unknown): string {
    if (value instanceof Date) {
      return this.formatLocalDate(value);
    }
    if (typeof value === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
      }
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return this.formatLocalDate(parsed);
      }
    }
    return '';
  }

  private formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
