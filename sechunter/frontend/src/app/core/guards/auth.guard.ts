import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Allow access to user dashboard without authentication
  if (state.url.includes('/dashboard/user')) {
    return true;
  }

  if (authService.isAuthenticated()) {
    return true;
  }

  // Store attempted URL for redirect after login
  authService.redirectUrl = state.url;
  return router.parseUrl('/auth');
};