import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
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
      if (this.authService.login(username, password)) {
        // Show success message briefly before redirecting
        this.isLoading = false;
        this.errorMessage = ''; // Clear any previous errors
        this.successMessage = 'Login successful! Redirecting...';

        // Add a small delay before redirecting for better UX
        setTimeout(() => {
          this.router.navigate(['/dashboard-charts']); // Redirect to the charts dashboard
        }, 1000);
      } else {
        this.errorMessage = 'Invalid username or password. Try admin/Admin1!/ or client/Client1!/';
        this.isLoading = false;
      }
    }, 800); // Simulate network delay
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
