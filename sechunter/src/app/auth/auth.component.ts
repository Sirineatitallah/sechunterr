import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import { RouterModule } from '@angular/router';
import { FullscreenService } from '../core/services/fullscreen.service';
import { FullscreenButtonComponent } from '../shared/components/fullscreen-button/fullscreen-button.component';
@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    FullscreenButtonComponent
  ],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-5px)' }),
        animate('150ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class AuthComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  showPassword = false;
  currentYear = new Date().getFullYear();

  // Password strength properties
  strengthLevel = 0;
  strengthLevels = [1, 2, 3, 4];
  passwordStrength: 'weak' | 'medium' | 'strong' = 'weak';
  strengthPercentage = 0;
  hasMinLength = false;
  hasUppercase = false;
  hasNumber = false;
  hasSpecialChar = false;

  constructor(
    private fb: FormBuilder,
    private fullscreenService: FullscreenService
  ) {
    this.loginForm = this.fb.group({
      id: ['', [Validators.required]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });

    this.loginForm.valueChanges.subscribe(() => {
      // Clear any previous error when form changes
      this.error = null;
    });

    this.loginForm.get('password')?.valueChanges.subscribe(() => {
      this.updatePasswordStrength();
    });
  }

  ngOnInit(): void {
    // No auto redirect here; handled by authGuard and routing
  }

  updatePasswordStrength(): void {
    const password = this.password.value;

    if (!password) {
      this.strengthPercentage = 0;
      this.passwordStrength = 'weak';
      this.strengthLevel = 0;
      return;
    }

    this.hasMinLength = password.length >= 8;
    this.hasUppercase = /[A-Z]/.test(password);
    this.hasNumber = /[0-9]/.test(password);
    this.hasSpecialChar = /[^A-Za-z0-9]/.test(password);

    const criteriaMet = [
      this.hasMinLength,
      this.hasUppercase,
      this.hasNumber,
      this.hasSpecialChar
    ].filter(Boolean).length;

    this.strengthLevel = criteriaMet;
    this.strengthPercentage = (criteriaMet / 4) * 100;

    this.passwordStrength = criteriaMet <= 1 ? 'weak' :
      criteriaMet <= 3 ? 'medium' :
      'strong';
  }

  get id() {
    return this.loginForm.get('id')!;
  }

  get password() {
    return this.loginForm.get('password')!;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    // Get form values even if form is technically invalid
    const id = this.loginForm.get('id')?.value || '';
    const password = this.loginForm.get('password')?.value || '';

    // Special case for admin login
    if (id === 'admin' && password === 'Admin1!/') {
      localStorage.setItem('access_token', 'admin-token');
      localStorage.setItem('user_role', 'admin');
      window.location.href = '/dashboard/main'; // Admin dashboard
      return;
    }

    // Special case for analyst login
    if ((id === 'analyst' && password === 'Analyst1!/') || (id === 'idanalyste' && password === 'Analyste1!/')) {
      console.log('Analyst login detected');
      localStorage.clear(); // Clear any existing tokens/roles
      localStorage.setItem('access_token', 'analyst-token');
      localStorage.setItem('user_role', 'analyst');
      console.log('Stored token:', localStorage.getItem('access_token'));
      console.log('Stored role:', localStorage.getItem('user_role'));
      console.log('Redirecting to analyst dashboard...');

      // Force redirect to analyst dashboard with a delay to ensure localStorage is updated
      setTimeout(() => {
        window.location.href = '/dashboard/analyst'; // Analyst dashboard
      }, 100);
      return;
    }

    // Special case for user login
    if (id === 'user' && password === 'userA1!/') {
      localStorage.setItem('access_token', 'user-token');
      localStorage.setItem('user_role', 'user');
      window.location.href = '/dashboard/user'; // User dashboard
      return;
    }

    // Special case for test user login - using trim to remove any accidental whitespace
    if (id.trim() === 'test@gmail.com' && password.trim() === 'testTEST1!/') {
      console.log('Test user login detected');
      localStorage.setItem('access_token', 'user-token-test');
      localStorage.setItem('user_role', 'client');
      window.location.href = '/dashboard/user'; // User dashboard
      return;
    }

    // Alternative check for test user with less strict comparison
    if (id.includes('test@gmail.com') && password.includes('testTEST1!/')) {
      console.log('Test user login detected (alternative check)');
      localStorage.setItem('access_token', 'user-token-test');
      localStorage.setItem('user_role', 'client');
      window.location.href = '/dashboard/user'; // User dashboard
      return;
    }

    // For demo purposes, accept any login with valid format
    if (id && password && password.length >= 6) {
      console.log('Regular login accepted');
      localStorage.setItem('access_token', 'user-token-' + Date.now());
      localStorage.setItem('user_role', 'client');
      window.location.href = '/dashboard/user'; // User dashboard
      return;
    }

    // Show error for invalid credentials
    this.error = 'Invalid credentials. Please check your email and password.';
    console.error('Login failed: Invalid credentials');
  }

  /**
   * Handle Google sign-in
   * In a real application, this would integrate with Google OAuth
   */
  signInWithGoogle(): void {
    console.log('Attempting to sign in with Google');
    this.isLoading = true;

    // Simulate Google authentication process
    setTimeout(() => {
      this.isLoading = false;
      console.log('Google sign-in successful');

      // Store mock token and redirect to dashboard
      localStorage.setItem('access_token', 'google-user-token-' + Date.now());
      localStorage.setItem('user_role', 'client');

      // Redirect to user dashboard
      window.location.href = '/dashboard/user';
    }, 1000);
  }
}
