import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/landing-page/landing-page.component').then(
        (c) => c.LandingPageComponent
      ),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(
        (c) => c.DashboardComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'dashboard/resources/:collection_ID',
    loadComponent: () =>
      import('./components/resources-page/resources-page.component').then(
        (c) => c.ResourcesPageComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'upload',
    loadComponent: () =>
      import('./components/profile-upload/profile-upload.component').then(
        (c) => c.ProfileUploadComponent
      ),
  },
];
