import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ApiService } from './core/api.service';
import { AuthService } from './core/auth.service';
import { I18nService } from './core/i18n.service';
import { AuthUser } from './core/models';
import { MATERIAL_MODULES } from './shared/material';
import { TrPipe } from './shared/tr.pipe';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, TrPipe, ...MATERIAL_MODULES],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  constructor(
    public auth: AuthService,
    private api: ApiService,
    private i18n: I18nService,
    private router: Router,
  ) {}

  languages = [
    { code: 'fr', label: 'Français', flagUrl: '/assets/flags/fr.svg' },
    { code: 'en', label: 'English', flagUrl: '/assets/flags/gb.svg' },
  ];

  get selectedLang(): string {
    return this.i18n.lang.toUpperCase();
  }

  get selectedFlag(): string {
    return this.languages.find((lang) => lang.code === this.i18n.lang)?.flagUrl ?? '';
  }

  setLanguage(code: string): void {
    if (code === 'fr' || code === 'en') {
      this.i18n.setLang(code);
    }
  }

  get currentUser(): AuthUser | null {
    return this.auth.getUser();
  }

  ngOnInit(): void {
    if (!this.auth.getToken()) {
      return;
    }

    if (this.auth.getUser()) {
      return;
    }

    this.api.getMe().subscribe({
      next: (user) => this.auth.setUser(user),
      error: () => this.auth.clearToken(),
    });
  }

  logout(): void {
    this.auth.clearToken();
    void this.router.navigateByUrl('/search');
  }
}
