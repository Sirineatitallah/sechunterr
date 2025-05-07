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
    console.log('Form submitted', this.loginForm.value);

    // Get form values even if form is technically invalid
    const id = this.loginForm.get('id')?.value || '';
    const password = this.loginForm.get('password')?.value || '';

    console.log('Attempting login with:', { id, password });

    // Special case for admin login
    if (id === 'admin' && password === 'Admin1!/') {
      console.log('Admin login detected');
      localStorage.setItem('access_token', 'admin-token');
      localStorage.setItem('user_role', 'admin');
      window.location.href = '/dashboard/main';
      return;
    }

    // For demo purposes, accept any login with valid format
    if (id && password && password.length >= 6) {
      console.log('Regular login accepted');
      localStorage.setItem('access_token', 'user-token-' + Date.now());
      localStorage.setItem('user_role', 'client');
      window.location.href = '/dashboard/main';
      return;
    }

    // Show error for invalid credentials
    this.error = 'Invalid credentials. Please check your email and password.';
    console.error('Login failed: Invalid credentials');
  }
}
