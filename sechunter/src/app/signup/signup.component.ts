import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FullscreenService } from '../core/services/fullscreen.service';
import { FullscreenButtonComponent } from '../shared/components/fullscreen-button/fullscreen-button.component';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, FullscreenButtonComponent]
})
export class SignupComponent {
  signupForm: FormGroup;
  isLoading = false;
  error: string | null = null;

  showPassword = false;
  showConfirmPassword = false;

  strengthPercentage = 0;
  passwordStrength = 'weak';
  strengthLevels = [1, 2, 3, 4];
  strengthLevel = 0;

  hasMinLength = false;
  hasUppercase = false;
  hasNumber = false;
  hasSpecialChar = false;

  constructor(
    private fb: FormBuilder,
    private fullscreenService: FullscreenService
  ) {
    this.signupForm = this.fb.group({
      id: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.signupForm.valueChanges.subscribe(() => {
      // Clear any previous error when form changes
      this.error = null;
    });
  }

  private passwordMatchValidator(g: FormGroup): { [key: string]: boolean } | null {
    const password = g.get('password');
    const confirmPassword = g.get('confirmPassword');

    if (!password || !confirmPassword) return null;

    return password.value === confirmPassword.value
      ? null
      : { mismatch: true };
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  updatePasswordStrength(): void {
    const password = this.signupForm.get('password')?.value || '';
    this.hasMinLength = password.length >= 8;
    this.hasUppercase = /[A-Z]/.test(password);
    this.hasNumber = /\d/.test(password);
    this.hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    this.strengthLevel = [this.hasMinLength, this.hasUppercase, this.hasNumber, this.hasSpecialChar]
      .filter(Boolean).length;

    this.strengthPercentage = (this.strengthLevel / 4) * 100;

    switch (this.strengthLevel) {
      case 4:
        this.passwordStrength = 'strong';
        break;
      case 3:
        this.passwordStrength = 'medium';
        break;
      case 2:
        this.passwordStrength = 'weak';
        break;
      default:
        this.passwordStrength = 'very-weak';
    }
  }

  onSubmit() {
    console.log('Form submitted', this.signupForm.value);

    // Get form values even if form is technically invalid
    const id = this.signupForm.get('id')?.value || '';
    const password = this.signupForm.get('password')?.value || '';
    const confirmPassword = this.signupForm.get('confirmPassword')?.value || '';

    console.log('Attempting registration with:', { id, password });

    // Check if passwords match
    if (password !== confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    // For demo purposes, accept any registration with valid format
    if (id && password && password.length >= 6) {
      console.log('Registration successful');

      // Redirect to login page
      setTimeout(() => {
        window.location.href = '/auth?registered=true';
      }, 500);

      return;
    }

    // Show error for invalid credentials
    this.error = 'Registration failed. Please provide a valid email and password.';
    console.error('Registration failed: Invalid credentials');
  }

  /**
   * Handle Google sign-up
   * In a real application, this would integrate with Google OAuth
   */
  signUpWithGoogle() {
    console.log('Attempting to sign up with Google');
    this.isLoading = true;

    // Simulate Google authentication process
    setTimeout(() => {
      this.isLoading = false;
      console.log('Google sign-up successful');

      // Store mock token and redirect to dashboard
      localStorage.setItem('access_token', 'google-user-token-' + Date.now());
      localStorage.setItem('user_role', 'client');

      // Redirect to user dashboard
      window.location.href = '/dashboard/user';
    }, 1000);
  }
}
