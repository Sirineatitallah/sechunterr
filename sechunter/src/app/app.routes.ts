import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

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
      { path: '', redirectTo: 'asm', pathMatch: 'full' },
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
        path: 'profile',
        loadComponent: () => import('./modules/user-profile/user-profile.component').then(m => m.UserProfileComponent),
        data: { animation: 'profileSlide' },
        title: 'User Security Settings'
      },
      {
        path: 'admin',
        loadComponent: () => import('./modules/admin/admin.component').then(m => m.AdminComponent),
        canActivate: [roleGuard],
        data: { 
          requiredRole: 'admin',
          animation: 'adminSlide' 
        },
        title: 'Administration Panel'
      }
    ]
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth' }
];