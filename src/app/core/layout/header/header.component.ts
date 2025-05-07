import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

interface Instance {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical';
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  // Instance selector
  selectedInstance: string | null = null;
  showInstanceDropdown = false;
  instanceSearchTerm = '';
  instances: Instance[] = [
    { id: 'inst1', name: 'Client Instance 1', status: 'healthy' },
    { id: 'inst2', name: 'Client Instance 2', status: 'warning' },
    { id: 'inst3', name: 'Client Instance 3', status: 'critical' },
    { id: 'inst4', name: 'Client Instance 4', status: 'healthy' },
    { id: 'inst5', name: 'Client Instance 5', status: 'healthy' }
  ];
  
  // Search
  searchQuery = '';
  showSearchPredictions = false;
  searchPredictions: string[] = [];
  filters = {
    vi: true,
    asm: true,
    cti: true,
    soar: true
  };
  
  // Notifications
  showNotifications = false;
  alertCount = 5;
  
  // User menu
  showUserMenu = false;
  userAvatar = 'assets/icons/user-avatar.svg';
  
  // System status
  systemStatus = 85;
  
  // UI effects
  hoverNewReport = false;
  
  // Theme
  darkMode = false;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    // Subscribe to theme changes
    this.themeService.theme$.subscribe(theme => {
      this.darkMode = theme === 'dark';
    });
    
    // Initialize with mock data
    this.selectedInstance = this.instances[0].id;
  }
  
  get filteredInstances(): Instance[] {
    if (!this.instanceSearchTerm) {
      return this.instances;
    }
    
    const searchTerm = this.instanceSearchTerm.toLowerCase();
    return this.instances.filter(instance => 
      instance.name.toLowerCase().includes(searchTerm)
    );
  }
  
  // Instance selector methods
  toggleInstanceDropdown(): void {
    this.showInstanceDropdown = !this.showInstanceDropdown;
  }
  
  selectInstance(instanceId: string): void {
    this.selectedInstance = instanceId;
    this.showInstanceDropdown = false;
  }
  
  // Search methods
  onSearchInput(): void {
    if (this.searchQuery.length > 2) {
      // Simulate predictive search
      this.searchPredictions = [
        `${this.searchQuery} in vulnerabilities`,
        `Recent ${this.searchQuery} threats`,
        `${this.searchQuery} in incident reports`
      ];
    } else {
      this.searchPredictions = [];
    }
  }
  
  onSearchBlur(): void {
    // Delay hiding predictions to allow for clicking on them
    setTimeout(() => {
      this.showSearchPredictions = false;
    }, 200);
  }
  
  selectPrediction(prediction: string): void {
    this.searchQuery = prediction;
    this.showSearchPredictions = false;
    // Implement search functionality
  }
  
  toggleFilter(filter: 'vi' | 'asm' | 'cti' | 'soar'): void {
    this.filters[filter] = !this.filters[filter];
  }
  
  // Notification methods
  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    if (this.showUserMenu) {
      this.showUserMenu = false;
    }
  }
  
  // User menu methods
  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    if (this.showNotifications) {
      this.showNotifications = false;
    }
  }
  
  toggleDarkMode(event: Event): void {
    event.stopPropagation();
    this.darkMode = !this.darkMode;
    this.themeService.setTheme(this.darkMode ? 'dark' : 'light');
  }
}
