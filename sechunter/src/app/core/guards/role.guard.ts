import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const requiredRoles = route.data['roles'] as string[] || [];
  
  return authService.currentUser.pipe(
    map(user => {
      const hasRole = requiredRoles.some((role: string) => 
        user?.roles?.includes(role)
      );
      
      if (!hasRole) {
        authService.logout();
        return false;
      }
      
      return true;
    })
  );
};