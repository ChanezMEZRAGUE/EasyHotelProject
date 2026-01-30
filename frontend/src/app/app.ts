import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MATERIAL_MODULES } from './shared/material';
import { AuthService } from './core/auth.service';
import { ApiService } from './core/api.service';
import { AuthUser } from './core/models';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, ...MATERIAL_MODULES],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  constructor(public auth: AuthService, private api: ApiService) {}

  selectedLang = 'FR';
  languages = [
    { code: 'FR', label: 'Français', flagUrl: '/assets/flags/fr.svg' },
    { code: 'EN', label: 'English', flagUrl: '/assets/flags/gb.svg' }
  ];

  get selectedFlag(): string {
    return this.languages.find(lang => lang.code === this.selectedLang)?.flagUrl ?? '';
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
  }
}
