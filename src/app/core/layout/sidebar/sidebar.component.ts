import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { VisualizationSelectionService } from '../../../shared/services/visualization-selection.service';

interface MenuItem {
  path: string;
  title: string;
  icon: string;
  mobileIcon: string;
  roles: string[];
  submenus?: MenuItem[];
  notificationCount?: number;
  expanded?: boolean;
  action?: () => void; // Optional action to execute when clicked
}

interface WidgetItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  pinned: boolean;
}

interface Instance {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  // Navigation
  menuItems: MenuItem[] = [
    {
      path: '/dashboard',
      title: 'Dashboard',
      icon: 'assets/icons/dashboard-3d.svg',
      mobileIcon: 'dashboard',
      roles: ['admin', 'client'],
      expanded: false
    },
    {
      path: '/draggable-demo',
      title: 'Widgets Draggables',
      icon: 'assets/icons/dashboard-3d.svg',
      mobileIcon: 'drag_indicator',
      roles: ['admin', 'client'],
      expanded: false
    },
    {
      path: '/asm',
      title: 'Attack Surface',
      icon: 'assets/icons/asm-3d.svg',
      mobileIcon: 'security',
      roles: ['admin', 'client'],
      submenus: [
        { path: '/asm/scan', title: 'Scan de Vulnérabilités', icon: 'radar', mobileIcon: 'radar', roles: ['admin', 'client'] },
        { path: '/asm/new-scan', title: 'Nouveau Scan', icon: 'add', mobileIcon: 'add', roles: ['admin'] }
      ],
      expanded: false
    },
    {
      path: '/vi',
      title: 'Vulnerability Intel',
      icon: 'assets/icons/vi-3d.svg',
      mobileIcon: 'bug_report',
      roles: ['admin', 'client'],
      expanded: false
    },
    {
      path: '/dashboard/visualizations',
      title: 'Cyber Threat Intel',
      icon: 'assets/icons/cti-3d.svg',
      mobileIcon: 'gpp_maybe',
      roles: ['admin'],
      notificationCount: 5,
      expanded: false,
      action: () => {
        this.visualizationSelectionService.setSelectedTab('Menaces');
        this.router.navigate(['/dashboard/visualizations']);
      }
    },
    {
      path: '/soar',
      title: 'Incident Response',
      icon: 'assets/icons/soar-3d.svg',
      mobileIcon: 'healing',
      roles: ['admin'],
      expanded: false
    },
    {
      path: '/visualizations',
      title: 'Visualizations',
      icon: 'assets/icons/visualizations-3d.svg',
      mobileIcon: 'insights',
      roles: ['admin', 'client'],
      expanded: false
    }
  ];

  // Widgets
  pinnedWidgets: WidgetItem[] = [
    {
      id: 'widget1',
      name: 'Vulnérabilités Critiques',
      description: 'Affiche les vulnérabilités critiques',
      icon: 'warning',
      pinned: true
    },
    {
      id: 'widget2',
      name: 'Menaces Actives',
      description: 'Affiche les menaces actives',
      icon: 'security',
      pinned: true
    },
    {
      id: 'widget3',
      name: 'Incidents Récents',
      description: 'Affiche les incidents récents',
      icon: 'notification_important',
      pinned: false
    }
  ];

  // Instances
  instances: Instance[] = [
    { id: 'inst1', name: 'Client Instance 1', status: 'healthy' },
    { id: 'inst2', name: 'Client Instance 2', status: 'warning' },
    { id: 'inst3', name: 'Client Instance 3', status: 'critical' },
    { id: 'inst4', name: 'Client Instance 4', status: 'offline' }
  ];

  // UI State
  collapsed = false;
  darkMode = false;
  mobileNavOpen = false;
  isAdmin = true; // This would normally be determined by auth service
  userRole = 'admin'; // This would normally be determined by auth service

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private visualizationSelectionService: VisualizationSelectionService
  ) {}

  ngOnInit(): void {
    // Subscribe to theme changes
    this.themeService.theme$.subscribe(theme => {
      this.darkMode = theme === 'dark';
    });

    // Check screen size on init
    this.checkScreenSize();

    // Listen for window resize
    window.addEventListener('resize', () => {
      this.checkScreenSize();
    });
  }

  // Check if menu item should be shown based on user role
  showMenuItem(item: MenuItem): boolean {
    return item.roles.includes(this.userRole);
  }

  // Toggle sidebar collapse
  toggleSidebar(): void {
    this.collapsed = !this.collapsed;
  }

  // Toggle submenu expansion
  toggleSubmenu(item: MenuItem, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    item.expanded = !item.expanded;
  }

  // Toggle widget pin
  toggleWidgetPin(widget: WidgetItem): void {
    widget.pinned = !widget.pinned;
  }

  // Open widget gallery
  openWidgetGallery(): void {
    console.log('Opening widget gallery');
    // Implementation for opening widget gallery
  }

  // Manage instance
  manageInstance(instance: Instance): void {
    console.log('Managing instance', instance);
    // Implementation for managing instance
  }

  // Add new instance
  addInstance(): void {
    console.log('Adding new instance');
    // Implementation for adding a new instance
  }

  // Open help
  openHelp(): void {
    console.log('Opening help');
    // Implementation for opening help
  }

  // Open settings
  openSettings(): void {
    console.log('Opening settings');
    // Implementation for opening settings
  }

  // Toggle dark mode
  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    this.themeService.setTheme(this.darkMode ? 'dark' : 'light');
  }

  // Mobile navigation
  openMobileNav(): void {
    this.mobileNavOpen = true;
  }

  closeMobileNav(): void {
    this.mobileNavOpen = false;
  }

  navigateAndClose(path: string): void {
    this.router.navigate([path]);
    this.closeMobileNav();
  }

  // Navigate to Vulnerabilities Dashboard
  navigateToVulnerabilities(): void {
    // Naviguer directement vers le composant VI
    this.router.navigate(['/dashboard/vi']);
  }

  // Navigate to Threats Dashboard
  navigateToThreats(): void {
    // Naviguer directement vers le composant CTI
    this.router.navigate(['/dashboard/cti']);
  }

  // Navigate to Automation Dashboard
  navigateToAutomation(): void {
    // Naviguer directement vers le composant SOAR
    this.router.navigate(['/dashboard/soar']);
  }

  // Logout
  logout(): void {
    console.log('Logging out');
    // Implementation for logout
    this.router.navigate(['/auth']);
  }

  // Check screen size and adjust sidebar accordingly
  private checkScreenSize(): void {
    if (window.innerWidth < 768) {
      this.collapsed = true;
    }
  }
}
