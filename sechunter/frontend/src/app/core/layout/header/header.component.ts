import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatDividerModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  selectedInstance: string | null = null;
  instances = [
    { id: 'inst1', name: 'Client Instance 1' },
    { id: 'inst2', name: 'Client Instance 2' },
    { id: 'inst3', name: 'Client Instance 3' }
  ];

  searchQuery: string = '';
  filters = {
    asm: true,
    vi: true,
    cti: true,
    soar: true
  };
  searchPredictions: string[] = [];

  hoverNewReport: boolean = false;
  alertCount: number = 5;

  systemStatus: number = 75; // example percentage for progress bar

  userAvatar: string = '/assets/icons/holographic-plus.svg';
  darkMode: boolean = false;

  constructor(private themeService: ThemeService) {
    this.themeService.theme$.subscribe(theme => {
      this.darkMode = theme === 'dark';
    });
  }

  onSearchInput(): void {
    if (this.searchQuery.length > 3) {
      this.searchPredictions = [
        this.searchQuery + ' CVE-2024-001',
        this.searchQuery + ' CVE-2024-002',
        this.searchQuery + ' CVE-2024-003'
      ];
    } else {
      this.searchPredictions = [];
    }
  }

  selectPrediction(prediction: string): void {
    this.searchQuery = prediction;
    this.searchPredictions = [];
  }

  openAlerts(): void {
    alert('Opening real-time alerts panel...');
  }

  toggleDarkMode(): void {
    this.themeService.toggleTheme();
  }

  openSettings(): void {
    alert('Opening settings...');
  }

  logout(): void {
    alert('Logging out...');
  }
}
