import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Search } from './pages/search/search';
import { Results } from './pages/results/results';
import { HotelDetail } from './pages/hotel-detail/hotel-detail';
import { MyReservations } from './pages/my-reservations/my-reservations';
import { AuthGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'search' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'search', component: Search },
  { path: 'results', component: Results },
  { path: 'hotel/:id', component: HotelDetail },
  { path: 'my-reservations', component: MyReservations, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'search' }
];
