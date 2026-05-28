import { Routes } from '@angular/router';
import { adminGuard } from '../../../core/guards/admin.guard';
import { ScheduleListComponent } from './schedule-list/schedule-list.component';
import { ScheduleFormComponent } from './schedule-form/schedule-form.component';

export const schedulesRoutes: Routes = [
  {
    path: '',
    component: ScheduleListComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'new',
    component: ScheduleFormComponent,
    canActivate: [adminGuard]
  },
  {
    path: ':scheduleId/edit',
    component: ScheduleFormComponent,
    canActivate: [adminGuard]
  }
];
