import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'experiences', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: 'experiences',
    canActivate: [authGuard],
    loadChildren: () => import('./features/experiences/experiences.routes').then(m => m.experiencesRoutes)
  },
  {
    path: 'reservations',
    canActivate: [authGuard],
    loadChildren: () => import('./features/reservations/reservations.routes').then(m => m.reservationsRoutes)
  },
  {
    path: 'payments',
    canActivate: [authGuard],
    loadChildren: () => import('./features/payments/payments.routes').then(m => m.paymentsRoutes)
  },
  {
    path: 'reviews',
    canActivate: [authGuard],
    loadChildren: () => import('./features/reviews/reviews.routes').then(m => m.reviewsRoutes)
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes)
  },
  { path: '**', redirectTo: 'experiences' }
];
