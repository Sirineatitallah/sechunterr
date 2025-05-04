import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { RouterModule } from '@angular/router'; 
@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule,
    RouterModule
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
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      id: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern('^(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).+$')]],
      rememberMe: [false]
    });

    this.loginForm.valueChanges.subscribe(value => {
      console.log('Form value changed:', value);
      console.log('Form valid:', this.loginForm.valid);
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
    if (this.loginForm.invalid) {
      console.log('Form submission blocked: form invalid');
      return;
    }

    this.isLoading = true;
    this.error = null;

    const { id, password } = this.loginForm.value;

    console.log('Submitting login with:', { id, password });

    this.authService.login({ email: id, password }).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.message || 'Authentication failed. Please check your credentials.';
      }
    });
  }
}
