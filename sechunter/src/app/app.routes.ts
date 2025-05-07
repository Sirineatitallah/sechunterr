import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () => import('./auth/auth.component').then(m => m.AuthComponent),
    title: 'Security Authentication'
  },
  {
    path: 'signup',
    loadComponent: () => import('./signup/signup.component').then(m => m.SignupComponent),
    title: 'Security Registration'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    data: { animation: 'dashboardFade' },
    children: [
      { path: '', redirectTo: 'main', pathMatch: 'full' },
      {
        path: 'main',
        loadComponent: () => import('./dashboard/main-dashboard/main-dashboard.component').then(m => m.MainDashboardComponent),
        title: 'Security Operations Dashboard'
      },
      {
        path: 'vi',
        loadComponent: () => import('./modules/vi/components/vi-page/vi.component').then(m => m.ViComponent),
        title: 'Threat Intelligence'
      },
      {
        path: 'asm',
        loadComponent: () => import('./modules/asm/components/asm-page/asm.component').then(m => m.AsmComponent),
        title: 'Attack Surface Analysis'
      },
      {
        path: 'cti',
        loadComponent: () => import('./modules/cti/components/cti-page/cti.component').then(m => m.CtiComponent),
        title: 'Threat Intelligence'
      },
      {
        path: 'soar',
        loadComponent: () => import('./modules/soar/components/soar-page/soar.component').then(m => m.SoarComponent),
        title: 'Incident Response'
      },
      {
        path: 'visualizations',
        loadComponent: () => import('./dashboard/visualization-dashboard/visualization-dashboard.component').then(m => m.VisualizationDashboardComponent),
        title: 'Security Visualizations Dashboard'
      },
      {
        path: 'charts',
        loadComponent: () => import('./dashboard/dashboard-charts/charts-dashboard/charts-dashboard.component').then(m => m.ChartsDashboardComponent),
        title: 'Security Analytics Charts'
      },
      {
        path: 'profile',
        loadComponent: () => import('./modules/user-profile/user-profile.component').then(m => m.UserProfileComponent),
        data: { animation: 'profileSlide' },
        title: 'User Security Settings'
      },
      {
        path: 'admin',
        loadComponent: () => import('./modules/admin/admin.component').then(m => m.AdminComponent),
        canActivate: [RoleGuard],
        data: {
          requiredRole: 'admin',
          animation: 'adminSlide'
        },
        title: 'Administration Panel'
      },
      {
        path: 'info',
        loadComponent: () => import('./shared/components/global-info/global-info.component').then(m => m.GlobalInfoComponent),
        title: 'Information & Contact'
      }
    ]
  },
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth' }
];