import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });

    // Check if user just registered
    this.route.queryParams.subscribe(params => {
      if (params['registered'] === 'success') {
        this.successMessage = 'Inscription réussie ! Vous pouvez maintenant vous connecter.';

        // Pre-fill username if available
        if (params['username']) {
          this.loginForm.get('username')?.setValue(params['username']);
        }
      }
    });
  }

  onSubmit(): void {
    // Prevent multiple submissions
    if (this.loginForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const username = this.loginForm.get('username')?.value;
    const password = this.loginForm.get('password')?.value;

    console.log('Login attempt with:', username);

    // Add a slight delay to simulate network request
    setTimeout(() => {
      const loginResult = this.authService.login(username, password);

      if (loginResult.success) {
        if (loginResult.requireMfa) {
          // MFA is required, redirect to MFA verification page
          this.router.navigate(['/mfa']);
          return;
        }

        // Show success message briefly before redirecting
        this.isLoading = false;
        this.errorMessage = ''; // Clear any previous errors
        this.successMessage = 'Login successful! Redirecting...';

        // Add a small delay before redirecting for better UX
        setTimeout(() => {
          // Redirect based on user role
          const userRole = this.authService.getUserRole();
          if (userRole === 'admin') {
            this.router.navigate(['/dashboard/main']);
          } else {
            this.router.navigate(['/dashboard/user']);
          }
        }, 1000);
      } else {
        // Display the specific error message from the login result
        this.errorMessage = loginResult.error || 'Invalid username or password. Try admin/Admin1!/ or client/Client1!/';
        this.isLoading = false;
      }
    }, 800); // Simulate network delay
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
