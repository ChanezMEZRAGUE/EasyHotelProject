import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MATERIAL_MODULES } from '../../shared/material';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ...MATERIAL_MODULES],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  loading = false;
  errorMessage = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const payload = {
      email: this.form.value.email ?? '',
      password: this.form.value.password ?? ''
    };

    this.api.login(payload).subscribe({
      next: (res) => {
        this.auth.setToken(res.accessToken);
        this.auth.setUser(res.user);
        this.loading = false;
        this.router.navigate(['/search']);
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Email ou mot de passe incorrect.';
      }
    });
  }
}
