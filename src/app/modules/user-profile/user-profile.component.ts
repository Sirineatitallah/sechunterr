import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { MfaSetupDialogComponent } from './mfa-setup-dialog/mfa-setup-dialog.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  loading = false;

  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.user = this.authService.getCurrentUser();
  }

  toggleMFA(): void {
    if (!this.user) {
      this.snackBar.open('User not authenticated', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;

    if (this.user.mfaEnabled) {
      // Disable MFA
      if (this.authService.toggleMFAStatus(this.getUsernameFromEmail(this.user.email))) {
        this.user.mfaEnabled = false;
        this.snackBar.open('Two-factor authentication disabled', 'Close', { duration: 3000 });
      } else {
        this.snackBar.open('Failed to disable two-factor authentication', 'Close', { duration: 3000 });
      }
      this.loading = false;
    } else {
      // Enable MFA - show setup dialog
      const username = this.getUsernameFromEmail(this.user.email);
      const result = this.authService.enableMFA(username);
      
      if (result.success && result.secret) {
        this.loading = false;
        this.openMfaSetupDialog(result.secret);
      } else {
        this.loading = false;
        this.snackBar.open(result.error || 'Failed to enable two-factor authentication', 'Close', { duration: 3000 });
      }
    }
  }

  openMfaSetupDialog(secret: string): void {
    const dialogRef = this.dialog.open(MfaSetupDialogComponent, {
      width: '400px',
      data: { 
        secret: secret,
        email: this.user?.email
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        // Update user state
        if (this.user) {
          this.user.mfaEnabled = true;
          this.user.mfaVerified = true;
        }
        this.snackBar.open('Two-factor authentication enabled', 'Close', { duration: 3000 });
      } else if (result && !result.success) {
        // MFA setup was canceled or failed
        if (this.user) {
          this.user.mfaEnabled = false;
        }
        this.snackBar.open('Two-factor authentication setup canceled', 'Close', { duration: 3000 });
      }
    });
  }

  private getUsernameFromEmail(email: string): string {
    // For demo purposes, just return 'admin' or 'client' based on the email
    if (email.includes('admin')) {
      return 'admin';
    } else if (email.includes('client')) {
      return 'client';
    }
    return email.split('@')[0];
  }
}
