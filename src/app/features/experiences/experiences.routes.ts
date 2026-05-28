import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';
import { ExperiencesComponent } from './experiences/experiences.component';
import { ExperienceFormComponent } from './experience-form/experience-form.component';
import { ExperienceDetailComponent } from './experience-detail/experience-detail.component';

export const experiencesRoutes: Routes = [
  {
    path: '',
    component: ExperiencesComponent
  },
  {
    path: 'new',
    component: ExperienceFormComponent,
    canActivate: [adminGuard]
  },
  {
    path: ':id',
    component: ExperienceDetailComponent
  },
  {
    path: ':id/edit',
    component: ExperienceFormComponent,
    canActivate: [adminGuard]
  }
];
