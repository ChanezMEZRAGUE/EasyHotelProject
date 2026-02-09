import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MATERIAL_MODULES } from '../../shared/material';
import { ApiService } from '../../core/api.service';
import { Region } from '../../core/models';

@Component({
  selector: 'app-search',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ...MATERIAL_MODULES],
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.router.navigate(['/results'], { queryParams: this.form.value });
  }
}
