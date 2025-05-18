import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-add-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatSlideToggleModule
  ],
  templateUrl: './add-user-dialog.component.html',
  styleUrls: ['./add-user-dialog.component.scss']
})
export class AddUserDialogComponent {
  userForm: FormGroup;
  hidePassword = true;
  availableRoles = [
    { value: 'admin', label: 'Administrateur' },
    { value: 'superuser', label: 'Super Utilisateur' },
    { value: 'analyst', label: 'Analyste' },
    { value: 'client', label: 'Client' }
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      roles: [['analyst'], [Validators.required]],
      mfaEnabled: [true]
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const newUser = {
        id: Date.now().toString(), // Génère un ID temporaire
        ...this.userForm.value,
        lastLogin: new Date()
      };
      this.dialogRef.close(newUser);
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.userForm.controls).forEach(key => {
        const control = this.userForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getEmailErrorMessage(): string {
    const emailControl = this.userForm.get('email');
    if (emailControl?.hasError('required')) {
      return 'L\'email est requis';
    }
    return emailControl?.hasError('email') ? 'Email invalide' : '';
  }

  getPasswordErrorMessage(): string {
    const passwordControl = this.userForm.get('password');
    if (passwordControl?.hasError('required')) {
      return 'Le mot de passe est requis';
    }
    return passwordControl?.hasError('minlength') ? 'Le mot de passe doit contenir au moins 8 caractères' : '';
  }
}
