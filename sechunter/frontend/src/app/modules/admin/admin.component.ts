import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from './../../core/services/auth.service';

interface User {
  id: string;
  email: string;
  role: string;
  lastLogin: Date;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
  private authService = inject(AuthService);
  
  displayedColumns: string[] = ['email', 'role', 'actions'];
  users: User[] = [
    { id: '1', email: 'admin@voc.com', role: 'admin', lastLogin: new Date() },
    { id: '2', email: 'analyst@voc.com', role: 'analyst', lastLogin: new Date() }
  ];

  refreshData() {
    // Implémenter l'actualisation des données
  }

  editUser(user: User) {
    // Logique d'édition
  }

  deleteUser(user: User) {
    // Logique de suppression
  }
}