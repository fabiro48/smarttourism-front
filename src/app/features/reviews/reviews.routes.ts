import { Routes } from '@angular/router';

export const reviewsRoutes: Routes = [
  { path: '**', redirectTo: '/experiences', pathMatch: 'full' }
];
