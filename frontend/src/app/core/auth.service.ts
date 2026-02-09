import { Injectable } from '@angular/core';
import { AuthUser } from './models';

const TOKEN_KEY = 'hb_token';
const USER_KEY = 'hb_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor() {
    // Clear legacy persistent auth so users must sign in explicitly.
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  setToken(token: string): void {
    sessionStorage.setItem(TOKEN_KEY, token);
  }

  getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  setUser(user: AuthUser): void {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  getUser(): AuthUser | null {
    const raw = sessionStorage.getItem(USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }

  clearToken(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }
}
