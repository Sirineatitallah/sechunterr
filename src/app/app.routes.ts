import { Routes } from '@angular/router';
import { MainDashboardComponent } from './dashboard/main-dashboard/main-dashboard.component';
import { UserDashboardComponent } from './dashboard/user-dashboard/user-dashboard.component';
import { DashboardContainerComponent } from './dashboard/dashboard-container.component';
import { AuthComponent } from './auth/auth.component';
import { SignupComponent } from './auth/signup/signup.component';
import { MfaComponent } from './auth/mfa/mfa.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { ChartsDashboardComponent } from './dashboard/dashboard-charts/charts-dashboard/charts-dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  { path: 'auth', component: AuthComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'mfa', component: MfaComponent },
  {
    path: 'dashboard',
    component: DashboardContainerComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'main',
        pathMatch: 'full'
      },
      {
        path: 'main',
        component: MainDashboardComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin'] }
      },
      {
        path: 'user',
        component: UserDashboardComponent,
        canActivate: [roleGuard],
        data: { roles: ['client'] }
      },
      {
        path: 'asm',
        component: UserDashboardComponent,
        canActivate: [roleGuard],
        data: { roles: ['client'] }
      },
      {
        path: 'vi',
        component: UserDashboardComponent,
        canActivate: [roleGuard],
        data: { roles: ['client'] }
      },
      {
        path: 'cti',
        component: UserDashboardComponent,
        canActivate: [roleGuard],
        data: { roles: ['client'] }
      },
      {
        path: 'soar',
        component: UserDashboardComponent,
        canActivate: [roleGuard],
        data: { roles: ['client'] }
      }
    ]
  },
  {
    path: 'dashboard-charts',
    component: ChartsDashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'cti-plotly',
    loadComponent: () => import('./modules/cti/components/cti-plotly/cti-plotly.component').then(m => m.CtiPlotlyComponent),
    canActivate: [authGuard]
  },
  {
    path: 'cti',
    loadComponent: () => import('./modules/cti/components/cti-plotly/cti-plotly.component').then(m => m.CtiPlotlyComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./modules/user-profile/user-profile.component').then(m => m.UserProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'draggable-demo',
    loadComponent: () => import('./shared/components/draggable-container/draggable-demo.component').then(m => m.DraggableDemoComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/auth' }
];
