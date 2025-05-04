import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
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
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value 
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
    if (this.signupForm.invalid) return;

    this.isLoading = true;
    this.error = null;

    const { email, password } = this.signupForm.value;
    
    this.authService.register({ email, password }).subscribe({
      next: () => {
        this.router.navigate(['/auth'], {
          queryParams: { registered: true }
        });
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.error = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
