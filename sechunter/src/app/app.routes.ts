import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

// app.routes.ts
export const routes: Routes = [
    // Authentication
    { 
      path: 'auth',
      loadComponent: () => import('./auth/auth.component').then(m => m.AuthComponent),
      title: 'Security Authentication'
    },
  
    // Main Dashboard
    { 
      path: 'dashboard',
      loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
      canActivate: [authGuard],
      data: { animation: 'dashboardFade' }
    },
  
    // Vulnerability Intelligence (VI)
    { 
      path: 'vi',
      loadComponent: () => import('./modules/vi/components/vi-page/vi.component').then(m => m.ViComponent),
      canActivate: [authGuard],
      data: { animation: 'cyberSlide' },
      title: 'Threat Intelligence'
    },
  
    // Attack Surface Management (ASM)
    { 
      path: 'asm',
      loadComponent: () => import('./modules/asm/components/asm-page/asm.component').then(m => m.AsmComponent),
      canActivate: [authGuard],
      data: { animation: 'cyberSlide' },
      title: 'Attack Surface Analysis'
    },
  
    // Cyber Threat Intelligence (CTI)
    { 
      path: 'cti',
      loadComponent: () => import('./modules/cti/components/cti-page/cti.component').then(m => m.CtiComponent),
      canActivate: [authGuard],
      data: { animation: 'cyberSlide' },
      title: 'Threat Intelligence'
    },
  
    // Security Orchestration (SOAR)
    { 
      path: 'soar',
      loadComponent: () => import('./modules/soar/components/soar-page/soar.component').then(m => m.SoarComponent),
      canActivate: [authGuard],
      data: { animation: 'cyberSlide' },
      title: 'Incident Response'
    },
  
    // Redirects
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: '**', redirectTo: 'dashboard' }
  ];