import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, AuthUser, Hotel, Region, Reservation } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getRegions(): Observable<Region[]> {
    return this.http.get<Region[]>(`${this.baseUrl}/regions`);
  }

  searchAvailability(params: {
    regionId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
  }): Observable<Hotel[]> {
    return this.http.get<Hotel[]>(`${this.baseUrl}/search/availability`, {
      params: {
        regionId: params.regionId,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        guests: String(params.guests)
      }
    });
  }

  getHotel(id: string): Observable<Hotel> {
    return this.http.get<Hotel>(`${this.baseUrl}/hotels/${id}`);
  }

  getHotels(params?: { regionId?: string; q?: string }): Observable<Hotel[]> {
    return this.http.get<Hotel[]>(`${this.baseUrl}/hotels`, {
      params: {
        ...(params?.regionId ? { regionId: params.regionId } : {}),
        ...(params?.q ? { q: params.q } : {}),
      },
    });
  }

  getMyReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.baseUrl}/reservations`);
  }

  register(payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, payload);
  }

  login(payload: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, payload);
  }

  getMe(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.baseUrl}/auth/me`);
  }

}
