import { Routes } from '@angular/router';
import { MainDashboardComponent } from './dashboard/main-dashboard/main-dashboard.component';
import { AuthComponent } from './auth/auth.component';
import { SignupComponent } from './auth/signup/signup.component';
import { authGuard } from './core/guards/auth.guard';
import { ChartsDashboardComponent } from './dashboard/dashboard-charts/charts-dashboard/charts-dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  { path: 'auth', component: AuthComponent },
  { path: 'signup', component: SignupComponent },
  {
    path: 'dashboard',
    component: MainDashboardComponent,
    canActivate: [authGuard]
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
  { path: '**', redirectTo: '/auth' }
];
