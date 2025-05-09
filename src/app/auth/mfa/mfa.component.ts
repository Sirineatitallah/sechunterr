import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-mfa',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './mfa.component.html',
  styleUrls: ['./mfa.component.scss']
})
export class MfaComponent implements OnInit {
  mfaForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  username = '';
  remainingTime = 30; // TOTP codes typically refresh every 30 seconds
  timerInterval: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.mfaForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  ngOnInit(): void {
    // Get the pending user from session storage
    this.username = sessionStorage.getItem('mfa_pending_user') || '';
    
    if (!this.username) {
      // No pending MFA verification, redirect to login
      this.router.navigate(['/auth']);
      return;
    }

    // Start the countdown timer
    this.startTimer();
  }

  ngOnDestroy(): void {
    // Clear the timer when component is destroyed
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      this.remainingTime--;
      if (this.remainingTime <= 0) {
        // Reset timer when it reaches 0
        this.remainingTime = 30;
      }
    }, 1000);
  }

  onSubmit(): void {
    if (this.mfaForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    const code = this.mfaForm.get('code')?.value;

    // Verify the MFA code
    if (this.authService.verifyMFA(this.username, code)) {
      // Complete the login process
      if (this.authService.completeMFALogin(this.username)) {
        // Redirect to dashboard
        this.router.navigate(['/dashboard-charts']);
      } else {
        this.errorMessage = 'Failed to complete authentication';
        this.isLoading = false;
      }
    } else {
      this.errorMessage = 'Invalid verification code';
      this.isLoading = false;
    }
  }

  cancel(): void {
    // Clear the pending MFA verification
    sessionStorage.removeItem('mfa_pending_user');
    // Redirect to login
    this.router.navigate(['/auth']);
  }
}
