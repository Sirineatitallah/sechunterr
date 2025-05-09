import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Get the required roles from the route data
  const requiredRoles = route.data['roles'] as string[];
  
  // Get the user's role
  const userRole = authService.getUserRole();
  
  // Check if the user has the required role
  if (requiredRoles.includes(userRole)) {
    return true;
  }
  
  // If user is admin, allow access to client routes
  if (userRole === 'admin' && requiredRoles.includes('client')) {
    return true;
  }
  
  // If user is client, redirect to user dashboard
  if (userRole === 'client') {
    return router.parseUrl('/dashboard/user');
  }
  
  // If user is admin, redirect to admin dashboard
  if (userRole === 'admin') {
    return router.parseUrl('/dashboard/main');
  }
  
  // Default fallback - redirect to auth
  return router.parseUrl('/auth');
};
