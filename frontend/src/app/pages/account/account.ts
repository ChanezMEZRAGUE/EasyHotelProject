import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MATERIAL_MODULES } from '../../shared/material';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { TrPipe } from '../../shared/tr.pipe';
import { I18nService } from '../../core/i18n.service';

@Component({
  selector: 'app-account',
  imports: [CommonModule, ReactiveFormsModule, TrPipe, ...MATERIAL_MODULES],
  templateUrl: './account.html',
  styleUrl: './account.scss',
})
export class Account implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly i18n = inject(I18nService);

  loading = true;
  saving = false;
  message = '';

  userForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(80)]],
    lastName: ['', [Validators.required, Validators.maxLength(80)]],
    email: [{ value: '', disabled: true }],
    phone: ['', [Validators.maxLength(30)]],
  });

  ngOnInit(): void {
    this.api.getMe().subscribe({
      next: (user) => {
        this.auth.setUser(user);
        this.userForm.patchValue({
          firstName: user.firstName ?? '',
          lastName: user.lastName ?? '',
          email: user.email ?? '',
          phone: user.phone ?? '',
        });
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.message = this.i18n.translateApiMessage(err?.error?.message, 'account.loadError');
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  save(): void {
    this.message = '';
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    const firstName = (this.userForm.getRawValue().firstName ?? '').trim();
    const lastName = (this.userForm.getRawValue().lastName ?? '').trim();
    const phone = (this.userForm.getRawValue().phone ?? '').trim();
    this.api.updateMe({ firstName, lastName, phone }).subscribe({
      next: (user) => {
        this.auth.setUser(user);
        this.userForm.patchValue({
          firstName: user.firstName ?? '',
          lastName: user.lastName ?? '',
          phone: user.phone ?? '',
        });
        this.message = this.i18n.t('account.saved');
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.message = this.i18n.translateApiMessage(err?.error?.message, 'account.saveError');
        this.saving = false;
        this.cdr.detectChanges();
      },
    });
  }
}
