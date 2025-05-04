import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { User } from '../models/user.model'; // Added line

export const roleGuard: CanActivateFn = (route): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRole = route.data['requiredRole'];
  const redirectUrl = route.data['redirect'] || '/dashboard';
  const user = authService.getDecodedToken();

  if (!user || !user.roles) {
    return of(router.createUrlTree(['/auth'], {
      queryParams: { returnUrl: route.url }
    }));
  }

  const hasRequiredRole = requiredRole ? 
    user.roles.includes(requiredRole) : 
    true;

  return hasRequiredRole ? 
    of(true) : 
    of(router.createUrlTree([redirectUrl], {
      queryParams: { error: 'unauthorized' }
    }));
};