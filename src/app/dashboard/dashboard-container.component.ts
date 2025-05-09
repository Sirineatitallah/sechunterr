import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-dashboard-container',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  template: `
    <div class="dashboard-container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .dashboard-container {
      width: 100%;
      height: 100vh;
      overflow: hidden;
    }
  `]
})
export class DashboardContainerComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      // If not authenticated, redirect to login
      window.location.href = '/auth';
    }
  }
}
