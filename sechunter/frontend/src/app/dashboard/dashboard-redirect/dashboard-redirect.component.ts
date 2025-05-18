import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-dashboard-redirect',
  template: '<div>Redirecting...</div>',
  standalone: true
})
export class DashboardRedirectComponent implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get user role from auth service
    const user = this.authService.getDecodedToken();
    console.log('DashboardRedirect - User:', user);

    // Redirect based on role
    if (user && user.roles) {
      if (user.roles.includes(UserRole.ANALYST)) {
        console.log('DashboardRedirect - Redirecting to analyst dashboard');
        this.router.navigate(['/dashboard/analyst']);
      } else if (user.roles.includes(UserRole.ADMIN)) {
        console.log('DashboardRedirect - Redirecting to admin dashboard');
        this.router.navigate(['/dashboard/main']);
      } else if (user.roles.includes(UserRole.CLIENT)) {
        console.log('DashboardRedirect - Redirecting to user dashboard');
        this.router.navigate(['/dashboard/user']);
      } else {
        console.log('DashboardRedirect - No specific role, redirecting to main dashboard');
        this.router.navigate(['/dashboard/main']);
      }
    } else {
      console.log('DashboardRedirect - No user or roles, redirecting to auth');
      this.router.navigate(['/auth']);
    }
  }
}
