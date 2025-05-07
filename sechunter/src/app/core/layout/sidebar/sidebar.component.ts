import { Component, inject } from '@angular/core';
import { AuthService } from './../../services/auth.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { User } from './../../models/user.model';


interface MenuItem {
  path: string;
  title: string;
  icon: string;
  roles: string[];
  submenus?: MenuItem[];
  notificationCount?: number;
}

interface EnvironmentInstance {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'warning';
}

interface Widget {
  id: string;
  title: string;
  pinned: boolean;
}

interface ActionHistoryItem {
  id: string;
  description: string;
  timestamp: Date;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    MatIconModule,
    RouterLink,
    RouterLinkActive, // Required for routerLinkActiveOptions
    CommonModule       // Provides base directives
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  user: User | null = null;

  focusModeActive = false;
  hoveredMenu: MenuItem | null = null;
  private focusModeTimeoutId: any = null;

  menuItems: MenuItem[] = [
    {
      path: 'asm',
      title: 'Attack Surface',
      icon: 'assets/icons/asm-3d.svg',
      roles: ['admin'],
      submenus: [
        { path: 'asm/scan', title: 'Scan de Vulnérabilités', icon: 'scan', roles: ['admin'] },
        { path: 'asm/new-scan', title: 'Nouveau Scan', icon: 'add', roles: ['admin'] }
      ],
      notificationCount: 0
    },
    {
      path: 'vi',
      title: 'Vulnerability Intel',
      icon: 'assets/icons/vi-3d.svg',
      roles: ['analyst', 'admin'],
      submenus: [],
      notificationCount: 0
    },
    {
      path: 'cti',
      title: 'Threat Intelligence',
      icon: 'assets/icons/cti-3d.svg',
      roles: ['admin'],
      submenus: [],
      notificationCount: 5 // example badge count
    },
    {
      path: 'soar',
      title: 'Incident Response',
      icon: 'assets/icons/soar-3d.svg',
      roles: ['admin'],
      submenus: [],
      notificationCount: 0
    },
    {
      path: 'info',
      title: 'Information & Contact',
      icon: 'assets/icons/info-3d.svg',
      roles: ['admin', 'analyst', 'client'],
      submenus: [],
      notificationCount: 0
    }
  ];

  environmentInstances: EnvironmentInstance[] = [
    { id: '1', name: 'Client A', status: 'online' },
    { id: '2', name: 'Client B', status: 'warning' },
    { id: '3', name: 'Client C', status: 'offline' }
  ];

  widgets: Widget[] = [
    { id: 'w1', title: 'Top 5 Vulnérabilités', pinned: true },
    { id: 'w2', title: 'Menaces Récentes', pinned: false }
  ];

  actionHistory: ActionHistoryItem[] = [
    { id: 'a1', description: 'Scan ASM terminé à 14h30', timestamp: new Date(Date.now() - 3600 * 1000) },
    { id: 'a2', description: 'Nouveau scan CTI lancé', timestamp: new Date(Date.now() - 7200 * 1000) }
  ];

  get currentUser() {
    return this.authService.getDecodedToken();
  }

  showMenuItem(item: MenuItem): boolean {
    if (!this.authService.isLoggedIn() || !this.currentUser || !this.currentUser.roles) {
      return false;
    }
    return item.roles.some(role => this.currentUser.roles.includes(role));
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

  addInstance() {
    // Logic to add a new instance (to be implemented)
    console.log('Add Instance clicked');
  }

  toggleWidgetPin(widget: Widget) {
    widget.pinned = !widget.pinned;
  }

  formatTimestamp(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  activateFocusMode() {
    this.focusModeActive = true;
    if (this.focusModeTimeoutId) {
      clearTimeout(this.focusModeTimeoutId);
    }
  }

  deactivateFocusModeWithDelay(delayMs: number = 3000) {
    if (this.focusModeTimeoutId) {
      clearTimeout(this.focusModeTimeoutId);
    }
    this.focusModeTimeoutId = setTimeout(() => {
      this.focusModeActive = false;
    }, delayMs);
  }
}
