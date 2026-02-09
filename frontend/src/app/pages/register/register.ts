import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MATERIAL_MODULES } from '../../shared/material';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ...MATERIAL_MODULES],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  loading = false;
  errorMessage = '';
  readonly returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? undefined;

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    phone: ['']
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const payload = {
      firstName: this.form.value.firstName ?? '',
      lastName: this.form.value.lastName ?? '',
      email: this.form.value.email ?? '',
      password: this.form.value.password ?? '',
      phone: this.form.value.phone ?? undefined,
    };

    this.api.register(payload).subscribe({
      next: (res) => {
        this.auth.setToken(res.accessToken);
        this.auth.setUser(res.user);
        this.loading = false;
        this.cdr.detectChanges();
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        this.router.navigateByUrl(returnUrl || '/search');
      },
      error: (err) => {
        this.loading = false;
        if (err?.status === 409) {
          this.errorMessage = 'Ce compte existe déjà. Essayez de vous connecter.';
          this.cdr.detectChanges();
          return;
        }
        this.errorMessage = 'Impossible de créer le compte. Vérifie tes informations.';
        this.cdr.detectChanges();
      }
    });
  }
}
