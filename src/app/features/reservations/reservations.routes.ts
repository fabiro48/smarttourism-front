import { Routes } from '@angular/router';
import { ReservationsComponent } from './reservations/reservations.component';
import { ReservationFormComponent } from './reservation-form/reservation-form.component';

export const reservationsRoutes: Routes = [
  { path: '', component: ReservationsComponent },
  { path: 'new', component: ReservationFormComponent }
];
