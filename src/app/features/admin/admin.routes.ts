import { Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { AdminReservationsComponent } from './admin-reservations/admin-reservations.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';

export const adminRoutes: Routes = [
  { path: '', component: AdminComponent },
  { path: 'reservations', component: AdminReservationsComponent },
  { path: 'users', component: AdminUsersComponent },
];
