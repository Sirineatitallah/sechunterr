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

  console.log('RoleGuard - Required roles:', requiredRoles);
  console.log('RoleGuard - User:', user);

  if (!user || !user.roles) {
    console.log('RoleGuard - No user or roles, redirecting to auth');
    return of(router.createUrlTree(['/auth'], {
      queryParams: { returnUrl: route.url }
    }));
  }

  // Check if user has any of the required roles
  const hasRequiredRole = requiredRoles ?
    requiredRoles.some(role => user.roles.includes(role)) :
    true;

  console.log('RoleGuard - Has required role:', hasRequiredRole);

  // If user is admin but trying to access client route, allow it
  if (user.roles.includes(UserRole.ADMIN) && requiredRoles.includes(UserRole.CLIENT)) {
    console.log('RoleGuard - Admin accessing client route, allowing');
    return of(true);
  }

  // If user is client but trying to access admin route, redirect to user dashboard
  if (user.roles.includes(UserRole.CLIENT) &&
      (requiredRoles.includes(UserRole.ADMIN) || requiredRoles.includes(UserRole.SUPERUSER))) {
    console.log('RoleGuard - Client accessing admin route, redirecting to user dashboard');
    return of(router.createUrlTree(['/dashboard/user']));
  }

  // Check for analyst role specifically
  const userRole = localStorage.getItem('user_role');
  if (userRole === 'analyst' || user.roles.includes(UserRole.ANALYST)) {
    console.log('RoleGuard - Analyst role detected');
    // If trying to access a non-analyst route, redirect to analyst dashboard
    if (!requiredRoles.includes(UserRole.ANALYST)) {
      console.log('RoleGuard - Analyst accessing non-analyst route, redirecting to analyst dashboard');
      return of(router.createUrlTree(['/dashboard/analyst']));
    }
    // Otherwise allow access to the analyst route
    console.log('RoleGuard - Analyst accessing analyst route, allowing');
    return of(true);
  }

  return hasRequiredRole ?
    of(true) :
    of(router.createUrlTree([redirectUrl], {
      queryParams: { error: 'unauthorized' }
    }));
};