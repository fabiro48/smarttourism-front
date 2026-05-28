import { Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { AdminReservationsComponent } from './admin-reservations/admin-reservations.component';

export const adminRoutes: Routes = [
  { path: '', component: AdminComponent },
  { path: 'reservations', component: AdminReservationsComponent }
];
