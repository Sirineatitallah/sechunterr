// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformServer } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  
  // Permettre l'accès sur le serveur pour éviter les blocages en SSR
  if (isPlatformServer(platformId)) {
    return true;
  }
  
  return auth.isAuthenticated() || router.parseUrl('/auth');
};