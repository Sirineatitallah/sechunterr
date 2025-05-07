import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { User, UserRole } from '../models/user.model';

export const RoleGuard: CanActivateFn = (route): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Get required roles from route data
  const requiredRoles = route.data['roles'] as UserRole[];
  const redirectUrl = route.data['redirect'] || '/dashboard';
  const user = authService.getDecodedToken();

  if (!user || !user.roles) {
    return of(router.createUrlTree(['/auth'], {
      queryParams: { returnUrl: route.url }
    }));
  }

  // Check if user has any of the required roles
  const hasRequiredRole = requiredRoles ?
    requiredRoles.some(role => user.roles.includes(role)) :
    true;

  // If user is admin but trying to access client route, allow it
  if (user.roles.includes(UserRole.ADMIN) && requiredRoles.includes(UserRole.CLIENT)) {
    return of(true);
  }

  // If user is client but trying to access admin route, redirect to client dashboard
  if (user.roles.includes(UserRole.CLIENT) &&
      (requiredRoles.includes(UserRole.ADMIN) || requiredRoles.includes(UserRole.SUPERUSER))) {
    return of(router.createUrlTree(['/dashboard/client']));
  }

  return hasRequiredRole ?
    of(true) :
    of(router.createUrlTree([redirectUrl], {
      queryParams: { error: 'unauthorized' }
    }));
};