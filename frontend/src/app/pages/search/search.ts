import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MATERIAL_MODULES } from '../../shared/material';

@Component({
  selector: 'app-search',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ...MATERIAL_MODULES],
  templateUrl: './search.html',
  styleUrl: './search.scss'
})
export class Search {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  regions = [
    { id: 'paris', name: 'Ile-de-France' },
    { id: 'rhone', name: 'Auvergne-Rhone-Alpes' },
    { id: 'paca', name: 'Provence-Alpes-Cote d\'Azur' }
  ];

  form = this.fb.group({
    regionId: ['', Validators.required],
    checkIn: ['', Validators.required],
    checkOut: ['', Validators.required],
    guests: [2, [Validators.required, Validators.min(1), Validators.max(8)]],
    business: [false]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.router.navigate(['/results'], { queryParams: this.form.value });
  }
}
