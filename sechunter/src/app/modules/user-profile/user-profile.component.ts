import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../core/models/user.model';
import { lastValueFrom } from 'rxjs'; // Replaces toPromise()

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, MatSlideToggleModule, MatIconModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent {
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  
  loading = false;
  user: User | null = this.authService.getDecodedToken();

  async toggleMFA() {
    if (!this.user) {
      this.snackBar.open('User not authenticated', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;
    try {
      const response = await lastValueFrom(this.authService.toggleMFA());
      
      // Update user state immutably
      this.user = { 
        ...this.user,
        mfaEnabled: !this.user.mfaEnabled 
      };

      if (response.qrCode) {
        this.showQRCode(response.qrCode);
      }

      this.snackBar.open('2FA settings updated', 'Close', { duration: 3000 });
    } catch (error) {
      this.snackBar.open('Failed to update 2FA settings', 'Close', { duration: 3000 });
      console.error('MFA toggle error:', error);
    } finally {
      this.loading = false;
    }
  }

  private showQRCode(qrData: string) {
    // Implement your QR code display logic here
    console.log('QR Code Data:', qrData);
  }
}