import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-mfa-setup-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './mfa-setup-dialog.component.html',
  styleUrls: ['./mfa-setup-dialog.component.scss']
})
export class MfaSetupDialogComponent implements OnInit {
  verificationForm: FormGroup;
  qrCodeUrl = '';
  isLoading = false;
  errorMessage = '';
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public dialogRef: MatDialogRef<MfaSetupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { secret: string, email: string }
  ) {
    this.verificationForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  ngOnInit(): void {
    // Generate QR code URL
    // In a real app, this would be a proper TOTP QR code
    // For demo purposes, we're using a placeholder
    const appName = 'SecHunter VOC';
    const email = this.data.email || 'user@example.com';
    const secret = this.data.secret;
    
    // This is a placeholder URL - in a real app, you would generate a proper TOTP QR code
    this.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/${appName}:${email}?secret=${secret}&issuer=${appName}`;
  }

  onSubmit(): void {
    if (this.verificationForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    const code = this.verificationForm.get('code')?.value;
    const username = this.getUsernameFromEmail(this.data.email);

    // Verify the MFA code
    if (this.authService.verifyMFA(username, code)) {
      this.dialogRef.close({ success: true });
    } else {
      this.errorMessage = 'Invalid verification code';
      this.isLoading = false;
    }
  }

  cancel(): void {
    // Cancel MFA setup
    const username = this.getUsernameFromEmail(this.data.email);
    this.authService.toggleMFAStatus(username); // This will disable MFA since it was just enabled
    this.dialogRef.close({ success: false });
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
