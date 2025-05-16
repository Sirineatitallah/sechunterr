import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { DashboardFilterComponent } from '../components/dashboard-filter/dashboard-filter.component';
import { DrillDownViewComponent } from '../components/drill-down-view/drill-down-view.component';
import { DashboardDataService, VulnerabilityData, SecurityDomain, ThreatAlert } from '../services/dashboard-data.service';

@Component({
  selector: 'app-main-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatMenuModule,
    MatProgressBarModule,
    RouterModule,
    SidebarComponent,
    DashboardFilterComponent,
    DrillDownViewComponent
  ],
  templateUrl: './main-dashboard.component.html',
  styleUrls: ['./main-dashboard.component.scss']
})
export class MainDashboardComponent implements OnInit {
  // Instance data
  instances = [
    { id: '1', name: 'Client A', status: 'online', lastScan: '2023-05-04T14:30:00Z' },
    { id: '2', name: 'Client B', status: 'warning', lastScan: '2023-05-03T10:15:00Z' },
    { id: '3', name: 'Client C', status: 'offline', lastScan: '2023-05-01T08:45:00Z' }
  ];

  // Quick widgets data
  quickWidgets = [
    {
      id: 'w1',
      title: 'Top 5 Vulnerabilities',
      value: '28',
      trend: '+12%',
      trendDirection: 'negative',
      icon: 'security'
    },
    {
      id: 'w2',
      title: 'Menaces Récentes',
      value: '5',
      trend: '-3%',
      trendDirection: 'positive',
      icon: 'warning'
    },
    {
      id: 'w3',
      title: 'ASM Coverage',
      value: '86%',
      trend: '+4%',
      trendDirection: 'positive',
      icon: 'visibility'
    },
    {
      id: 'w4',
      title: 'CTI Alerts',
      value: '12',
      trend: '+2%',
      trendDirection: 'negative',
      icon: 'notifications'
    }
  ];

  // Recent activity data
  recentActivities = [
    {
      id: 'a1',
      title: 'Scan ASM terminé à 14h30',
      time: '2h ago',
      icon: 'security_update_good',
      type: 'scan'
    },
    {
      id: 'a2',
      title: 'Nouveau scan CTI lancé',
      time: '4h ago',
      icon: 'search',
      type: 'scan'
    },
    {
      id: 'a3',
      title: 'Secure Sign Out',
      time: '5h ago',
      icon: 'logout',
      type: 'auth'
    }
  ];

  // Dashboard data from service
  vulnerabilities: VulnerabilityData[] = [];
  securityDomains: SecurityDomain[] = [];
  threatAlerts: ThreatAlert[] = [];

  // Drill-down state
  isDrillDownActive = false;

  // Flag to show back button
  showBackButton = false;

  // Source module (asm, cti, vi)
  sourceModule = '';

  constructor(
    private dashboardDataService: DashboardDataService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Check query parameters for source flag
    this.route.queryParams.subscribe(params => {
      // Get the source module
      this.sourceModule = params['from'];

      // Show back button if coming from a specific module
      this.showBackButton = !!this.sourceModule;
    });

    // Subscribe to dashboard data
    this.dashboardDataService.vulnerabilities$.subscribe(data => {
      this.vulnerabilities = data;
    });

    this.dashboardDataService.securityDomains$.subscribe(data => {
      this.securityDomains = data;
    });

    this.dashboardDataService.threatAlerts$.subscribe(data => {
      this.threatAlerts = data;
    });

    this.dashboardDataService.isDrillDownActive$.subscribe(active => {
      this.isDrillDownActive = active;
    });
  }

  addInstance(): void {
    console.log('Adding new instance');
    // Implementation for adding a new instance
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  // Helper method for severity class
  getSeverityClass(severity: string): string {
    return severity.toLowerCase();
  }

  // Helper method to get critical count
  getCriticalCount(): number {
    if (!this.threatAlerts || this.threatAlerts.length === 0) {
      return 42; // Default value
    }

    const criticalCount = this.threatAlerts.filter(t => t.severity === 'critical').length;
    return criticalCount * 10 + 12;
  }

  // Click handlers for visualizations
  onVulnerabilityClick(severity: string): void {
    // Find the first vulnerability of this severity for demo purposes
    const vulnerabilityCategory = this.vulnerabilities.find(v => v.severity === severity);
    if (vulnerabilityCategory && vulnerabilityCategory.details && vulnerabilityCategory.details.length > 0) {
      this.dashboardDataService.selectVulnerability(vulnerabilityCategory.details[0].id);
    }
  }

  onSecurityDomainClick(domainName: string): void {
    this.dashboardDataService.selectDomain(domainName);
  }

  onThreatAlertClick(alertId: string): void {
    this.dashboardDataService.selectThreat(alertId);
  }

  refreshData(): void {
    this.dashboardDataService.refreshData();
  }

  // Get display name for the source module
  getModuleDisplayName(): string {
    const moduleNames: { [key: string]: string } = {
      'asm': 'ASM',
      'cti': 'CTI',
      'vi': 'VI'
    };

    return moduleNames[this.sourceModule] || this.sourceModule.toUpperCase();
  }
}
