import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';

// Shared components
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { NotificationCenterComponent } from '../../shared/components/notification-center/notification-center.component';
import { SecurityEventsComponent } from '../../shared/components/security-events/security-events.component';
import { MicroserviceConnectorService, MicroserviceType } from '../../core/services/microservice-connector.service';
import { NotificationService } from '../../core/services/notification.service';
import { GlobalSearchComponent, SearchResult } from '../../shared/components/global-search/global-search.component';
import { RealTimeStatsComponent, StatItem } from '../../shared/components/real-time-stats/real-time-stats.component';
import { RecentAlertsComponent, Alert } from '../../shared/components/recent-alerts/recent-alerts.component';

// Vulnerability dashboard components
import { VulnerabilitiesTableComponent } from './components/vulnerabilities-table/vulnerabilities-table.component';
import { SeverityChartComponent } from './components/severity-chart/severity-chart.component';
import { CVSSLineChartComponent } from './components/cvss-line-chart/cvss-line-chart.component';
import { HostBarChartComponent } from './components/host-bar-chart/host-bar-chart.component';
import { RecentVulnsComponent } from './components/recent-vulns/recent-vulns.component';
import { VulnerabilityDetailsDialogComponent } from './components/vulnerability-details-dialog/vulnerability-details-dialog.component';

// Services and models
import { VulnerabilityService } from './services/vulnerability.service';
import { Vulnerability } from './models/vulnerability.model';


@Component({
  selector: 'app-analyst-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    MatDialogModule,
    RouterModule,
    SidebarComponent,
    NotificationCenterComponent,
    SecurityEventsComponent,
    GlobalSearchComponent,
    RealTimeStatsComponent,
    RecentAlertsComponent,

    // Vulnerability dashboard components
    VulnerabilitiesTableComponent,
    SeverityChartComponent,
    CVSSLineChartComponent,
    HostBarChartComponent,
    RecentVulnsComponent,
    VulnerabilityDetailsDialogComponent
  ],
  templateUrl: './analyst-dashboard.component.html',
  styleUrls: ['./analyst-dashboard.component.scss'],
  providers: [VulnerabilityService]
})
export class AnalystDashboardComponent implements OnInit, OnDestroy {
  @HostBinding('class.dark-theme') isDarkTheme = true;

  // Active microservice tab
  activeTab: 'vi' | 'cti' | 'asm' = 'vi';
  selectedTabIndex = 0;

  // Loading states
  isLoading = {
    vi: false,
    cti: false,
    asm: false
  };

  // Data for each microservice
  microserviceData: {
    vi: any;
    cti: any;
    asm: any;
  } = {
    vi: null,
    cti: null,
    asm: null
  };

  // Vulnerability data
  vulnerabilities: Vulnerability[] = [];
  loadingVulnerabilities = false;
  selectedVulnerability: Vulnerability | null = null;

  // Analyst info
  analystName = 'John Doe';

  // Subscriptions
  private subscriptions: Subscription[] = [];

  // Real-time stats
  realTimeStats: StatItem[] = [
    {
      id: 'vulnerabilities',
      label: 'Vulnérabilités',
      value: 156,
      icon: 'bug_report',
      color: 'critical',
      trend: 'up',
      percentage: 12
    },
    {
      id: 'threats',
      label: 'Menaces Actives',
      value: 23,
      icon: 'gpp_maybe',
      color: 'high',
      trend: 'up',
      percentage: 8
    },
    {
      id: 'incidents',
      label: 'Incidents',
      value: 12,
      icon: 'warning',
      color: 'medium',
      trend: 'down',
      percentage: 5
    },
    {
      id: 'assets',
      label: 'Actifs Exposés',
      value: 48,
      icon: 'devices',
      color: 'info',
      trend: 'stable',
      percentage: 0
    }
  ];

  // Recent alerts
  recentAlerts: Alert[] = [
    {
      id: 'alert-001',
      title: 'Tentative d\'intrusion détectée',
      description: 'Multiples tentatives d\'authentification échouées sur le serveur principal',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      severity: 'critical',
      source: 'Firewall',
      status: 'new',
      type: 'incident',
      actions: [
        { label: 'Investiguer', icon: 'search', action: 'investigate' },
        { label: 'Bloquer IP', icon: 'block', action: 'block' }
      ]
    },
    {
      id: 'alert-002',
      title: 'Nouvelle vulnérabilité critique',
      description: 'CVE-2023-1234 affecte 5 serveurs dans votre infrastructure',
      timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
      severity: 'high',
      source: 'Scanner de vulnérabilités',
      status: 'new',
      type: 'vulnerability',
      actions: [
        { label: 'Voir détails', icon: 'visibility', action: 'view' },
        { label: 'Corriger', icon: 'build', action: 'remediate' }
      ]
    },
    {
      id: 'alert-003',
      title: 'Activité suspecte détectée',
      description: 'Comportement anormal observé sur le compte utilisateur admin',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      severity: 'medium',
      source: 'SIEM',
      status: 'in-progress',
      type: 'threat',
      actions: [
        { label: 'Analyser', icon: 'analytics', action: 'analyze' },
        { label: 'Isoler', icon: 'security', action: 'isolate' }
      ]
    }
  ];

  constructor(
    private microserviceConnector: MicroserviceConnectorService,
    private notificationService: NotificationService,
    private router: Router,
    private dialog: MatDialog,
    private vulnerabilityService: VulnerabilityService
  ) {}

  ngOnInit(): void {
    // Load initial data for the default tab
    this.loadTabData(this.activeTab);

    // Load vulnerability data
    this.loadVulnerabilityData();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Load vulnerability data from the API
   */
  private loadVulnerabilityData(): void {
    this.loadingVulnerabilities = true;

    const subscription = this.vulnerabilityService.loadVulnerabilities().subscribe({
      next: (data) => {
        this.vulnerabilities = data;
        this.loadingVulnerabilities = false;

        // Update real-time stats based on vulnerability data
        this.updateRealTimeStats();

        // Update recent alerts based on critical vulnerabilities
        this.updateRecentAlerts();

        // Log the loaded data
        console.log('Loaded vulnerability data:', this.vulnerabilities.length, 'items');
        if (this.vulnerabilities.length > 0) {
          console.log('Sample vulnerability:', this.vulnerabilities[0]);
        }
      },
      error: (error) => {
        console.error('Error loading vulnerability data:', error);
        this.notificationService.showError('Failed to load vulnerability data');
        this.loadingVulnerabilities = false;
      }
    });

    this.subscriptions.push(subscription);
  }

  /**
   * Update recent alerts based on critical vulnerabilities
   */
  private updateRecentAlerts(): void {
    if (this.vulnerabilities.length === 0) return;

    // Get critical and high vulnerabilities
    const criticalVulns = this.vulnerabilities
      .filter(v => v.severity.toLowerCase() === 'critical' || v.severity.toLowerCase() === 'high')
      .slice(0, 3); // Take top 3

    // Create alerts from vulnerabilities
    const newAlerts = criticalVulns.map(vuln => {
      // Map severity to the expected type
      let alertSeverity: 'critical' | 'high' | 'medium' | 'low';
      switch (vuln.severity.toLowerCase()) {
        case 'critical':
          alertSeverity = 'critical';
          break;
        case 'high':
          alertSeverity = 'high';
          break;
        case 'medium':
          alertSeverity = 'medium';
          break;
        default:
          alertSeverity = 'low';
      }

      return {
        id: vuln.id || `alert-${Math.random().toString(36).substring(2, 9)}`,
        title: `${vuln.severity} Vulnerability Detected`,
        description: `${vuln.vulnerabilityName} on host ${vuln.host_ip}`,
        timestamp: new Date(vuln.discoveredDate),
        severity: alertSeverity,
        source: 'Vulnerability Scanner',
        status: 'new' as 'new' | 'in-progress' | 'resolved' | 'dismissed',
        type: 'vulnerability' as 'vulnerability' | 'threat' | 'incident' | 'system',
        actions: [
          { label: 'View Details', icon: 'visibility', action: 'view' },
          { label: 'Remediate', icon: 'build', action: 'remediate' }
        ]
      };
    });

    // Update recent alerts
    if (newAlerts.length > 0) {
      this.recentAlerts = [...newAlerts, ...this.recentAlerts].slice(0, 5);
    }
  }

  /**
   * Update real-time stats based on vulnerability data
   */
  private updateRealTimeStats(): void {
    if (this.vulnerabilities.length === 0) return;

    // Count vulnerabilities by severity
    const criticalCount = this.vulnerabilities.filter(v => v.severity.toLowerCase() === 'critical').length;
    const highCount = this.vulnerabilities.filter(v => v.severity.toLowerCase() === 'high').length;

    // Update vulnerability count in real-time stats
    const vulnStat = this.realTimeStats.find(stat => stat.id === 'vulnerabilities');
    if (vulnStat) {
      const oldValue = vulnStat.value;
      vulnStat.value = this.vulnerabilities.length;
      vulnStat.trend = vulnStat.value > oldValue ? 'up' : vulnStat.value < oldValue ? 'down' : 'stable';
      vulnStat.percentage = oldValue > 0 ? Math.round(((vulnStat.value - oldValue) / oldValue) * 100) : 0;
    }

    // Update threats stat based on critical and high vulnerabilities
    const threatStat = this.realTimeStats.find(stat => stat.id === 'threats');
    if (threatStat) {
      const oldValue = threatStat.value;
      threatStat.value = criticalCount + highCount;
      threatStat.trend = threatStat.value > oldValue ? 'up' : threatStat.value < oldValue ? 'down' : 'stable';
      threatStat.percentage = oldValue > 0 ? Math.round(((threatStat.value - oldValue) / oldValue) * 100) : 0;
    }

    // Update assets stat based on unique hosts
    const assetStat = this.realTimeStats.find(stat => stat.id === 'assets');
    if (assetStat) {
      const uniqueHosts = new Set(this.vulnerabilities.map(v => v.host_ip)).size;
      const oldValue = assetStat.value;
      assetStat.value = uniqueHosts;
      assetStat.trend = assetStat.value > oldValue ? 'up' : assetStat.value < oldValue ? 'down' : 'stable';
      assetStat.percentage = oldValue > 0 ? Math.round(((assetStat.value - oldValue) / oldValue) * 100) : 0;
    }

    // Update incidents stat based on exploitable vulnerabilities
    const incidentStat = this.realTimeStats.find(stat => stat.id === 'incidents');
    if (incidentStat) {
      const exploitableVulns = this.vulnerabilities.filter(v => v.exploitAvailable).length;
      const oldValue = incidentStat.value;
      incidentStat.value = exploitableVulns;
      incidentStat.trend = incidentStat.value > oldValue ? 'up' : incidentStat.value < oldValue ? 'down' : 'stable';
      incidentStat.percentage = oldValue > 0 ? Math.round(((incidentStat.value - oldValue) / oldValue) * 100) : 0;
    }
  }

  /**
   * Handle vulnerability details view
   */
  onViewVulnerabilityDetails(vulnerability: Vulnerability): void {
    this.selectedVulnerability = vulnerability;
    this.dialog.open(VulnerabilityDetailsDialogComponent, {
      width: '800px',
      data: vulnerability,
      panelClass: 'dark-theme-dialog'
    });
  }

  /**
   * Export vulnerability data
   */
  onExportVulnerabilityData(format: string): void {
    if (this.vulnerabilities.length === 0) {
      this.notificationService.showWarning('No vulnerability data to export');
      return;
    }

    this.notificationService.showInfo(`Exporting vulnerability data as ${format.toUpperCase()}...`);

    // In a real application, this would call a service to export the data
    setTimeout(() => {
      this.notificationService.showSuccess(`Vulnerability data exported as ${format.toUpperCase()}`);
    }, 1500);
  }

  /**
   * Set the active tab and load its data
   */
  setActiveTab(tab: string): void {
    // Convert menu title to tab name
    let tabName: 'vi' | 'cti' | 'asm' = 'vi';

    if (tab.toLowerCase().includes('vulnerability') || tab.toLowerCase().includes('vi')) {
      tabName = 'vi';
      this.selectedTabIndex = 0;
    } else if (tab.toLowerCase().includes('cyber') || tab.toLowerCase().includes('threat') || tab.toLowerCase().includes('cti')) {
      tabName = 'cti';
      this.selectedTabIndex = 1;
    } else if (tab.toLowerCase().includes('attack') || tab.toLowerCase().includes('surface') || tab.toLowerCase().includes('asm')) {
      tabName = 'asm';
      this.selectedTabIndex = 2;
    }

    this.activeTab = tabName;
    this.loadTabData(tabName);

    // Add animation effect when changing tabs
    const contentElement = document.querySelector('.dashboard-content');
    if (contentElement) {
      contentElement.classList.add('tab-changing');

      // Scroll to top when changing tabs
      contentElement.scrollTop = 0;

      // Remove animation class after animation completes
      setTimeout(() => {
        contentElement.classList.remove('tab-changing');
      }, 500);
    }
  }

  /**
   * Handle tab change from mat-tab-group
   */
  onTabChange(index: number): void {
    const tabs: ('vi' | 'cti' | 'asm')[] = ['vi', 'cti', 'asm'];
    this.activeTab = tabs[index];
    this.loadTabData(this.activeTab);

    // Add animation effect when changing tabs
    const contentElement = document.querySelector('.dashboard-content');
    if (contentElement) {
      contentElement.classList.add('tab-changing');

      // Scroll to top when changing tabs
      contentElement.scrollTop = 0;

      // Remove animation class after animation completes
      setTimeout(() => {
        contentElement.classList.remove('tab-changing');
      }, 500);
    }
  }

  /**
   * Load data for the specified microservice tab
   */
  loadTabData(tab: 'vi' | 'cti' | 'asm'): void {

    // Skip if data is already loaded
    if (this.microserviceData[tab]) {
      return;
    }

    // Set loading state
    this.isLoading[tab] = true;

    // Map tab to microservice type
    const microserviceType = this.getMicroserviceType(tab);

    // Load data from microservice
    this.microserviceConnector.getServiceData(microserviceType).subscribe({
      next: (data: any) => {
        this.microserviceData[tab] = data;
        this.isLoading[tab] = false;
      },
      error: (error) => {
        console.error(`Error loading ${tab} data:`, error);
        this.isLoading[tab] = false;
        // Load mock data as fallback
        this.loadMockData(tab);
      }
    });
  }

  /**
   * Map tab name to microservice type
   */
  private getMicroserviceType(tab: string): MicroserviceType {
    switch (tab) {
      case 'vi':
        return MicroserviceType.VULNERABILITY_SCANNER; // Utiliser VULNERABILITY_SCANNER pour VI
      case 'cti':
        return MicroserviceType.THREAT_INTEL;
      case 'asm':
        return MicroserviceType.VULNERABILITY_SCANNER;

      default:
        return MicroserviceType.VULNERABILITY_SCANNER; // Valeur par défaut
    }
  }

  /**
   * Handle search result selection
   */
  onSearchResultSelected(result: SearchResult): void {
    // Navigate to the appropriate page based on the result type
    this.router.navigate([result.link]);

    // Show notification
    this.notificationService.showSuccess(`Navigating to ${result.title}`);
  }

  /**
   * Handle alert actions
   */
  onAlertAction(event: {alert: Alert, action: string}): void {
    const { alert, action } = event;

    // Handle different actions
    switch (action) {
      case 'view':
        if (alert.type === 'vulnerability') {
          // Find the corresponding vulnerability
          const vuln = this.vulnerabilities.find(v =>
            v.vulnerabilityName.includes(alert.description.split(' on host ')[0])
          );

          if (vuln) {
            this.onViewVulnerabilityDetails(vuln);
            return;
          }
        }
        this.notificationService.showInfo(`Viewing details for alert: ${alert.title}`);
        break;
      case 'acknowledge':
        this.notificationService.showSuccess(`Alert acknowledged: ${alert.title}`);
        break;
      case 'investigate':
        this.notificationService.showInfo(`Investigating alert: ${alert.title}`);
        break;
      case 'resolve':
        this.notificationService.showSuccess(`Alert resolved: ${alert.title}`);
        break;
      case 'dismiss':
        this.notificationService.showWarning(`Alert dismissed: ${alert.title}`);
        break;
      case 'delete':
        this.notificationService.showWarning(`Alert deleted: ${alert.title}`);
        // Remove from the list
        this.recentAlerts = this.recentAlerts.filter(a => a.id !== alert.id);
        break;
      case 'block':
        this.notificationService.showSuccess(`IP blocked for alert: ${alert.title}`);
        break;
      case 'remediate':
        this.notificationService.showInfo(`Remediation started for: ${alert.title}`);
        break;
      case 'analyze':
        this.notificationService.showInfo(`Analysis started for: ${alert.title}`);
        break;
      case 'isolate':
        this.notificationService.showSuccess(`System isolated for alert: ${alert.title}`);
        break;
      default:
        this.notificationService.showInfo(`Action ${action} performed on alert: ${alert.title}`);
    }
  }

  /**
   * Navigate to alerts page
   */
  navigateToAlerts(): void {
    this.router.navigate(['/dashboard/alerts']);
  }

  /**
   * Navigate to tasks page
   */
  navigateToTasks(): void {
    this.router.navigate(['/dashboard/tasks']);
  }

  /**
   * Navigate to reports page
   */
  navigateToReports(): void {
    this.router.navigate(['/dashboard/reports']);
  }

  /**
   * Toggle between dark and light theme
   */
  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    document.body.classList.toggle('dark-theme', this.isDarkTheme);
    document.body.classList.toggle('light-theme', !this.isDarkTheme);

    // Show notification
    if (this.isDarkTheme) {
      this.notificationService.showInfo('Thème sombre activé');
    } else {
      this.notificationService.showInfo('Thème clair activé');
    }
  }

  /**
   * Ouvre un aperçu d'action
   */
  openActionPreview(type: string, title: string): void {
    this.notificationService.showInfo(`Aperçu "${title}" en cours de développement`);

    // Afficher un message différent selon le type d'action
    switch (type) {
      case 'alert':
        this.notificationService.showSuccess('Alerte créée avec succès');
        break;
      case 'scan':
        this.notificationService.showSuccess('Scan lancé avec succès');
        break;
      case 'incident':
        this.notificationService.showSuccess('Incident signalé avec succès');
        break;
      case 'report':
        this.notificationService.showSuccess('Rapport généré avec succès');
        break;
    }
  }

  /**
   * Ouvre l'aperçu pour créer une alerte
   */
  openCreateAlertPreview(): void {
    this.openActionPreview('alert', 'Créer une alerte');
  }

  /**
   * Ouvre l'aperçu pour lancer un scan
   */
  openLaunchScanPreview(): void {
    this.openActionPreview('scan', 'Lancer un scan');
  }

  /**
   * Ouvre l'aperçu pour signaler un incident
   */
  openReportIncidentPreview(): void {
    this.openActionPreview('incident', 'Signaler un incident');
  }

  /**
   * Ouvre l'aperçu pour générer un rapport
   */
  openGenerateReportPreview(): void {
    this.openActionPreview('report', 'Générer un rapport');
  }

  private loadMockData(tab: 'vi' | 'cti' | 'asm'): void {
    // Mock data for each microservice
    const mockData = {
      vi: {
        vulnerabilities: [
          { id: 'CVE-2023-1234', severity: 'Critical', title: 'Remote Code Execution in Apache Log4j' },
          { id: 'CVE-2023-5678', severity: 'High', title: 'SQL Injection in MySQL' },
          { id: 'CVE-2023-9012', severity: 'Medium', title: 'Cross-Site Scripting in jQuery' }
        ],
        stats: {
          critical: 12,
          high: 34,
          medium: 56,
          low: 78
        }
      },
      cti: {
        threats: [
          { id: 'APT-29', name: 'Cozy Bear', origin: 'Russia', activity: 'Active' },
          { id: 'APT-41', name: 'Wicked Panda', origin: 'China', activity: 'Active' },
          { id: 'Lazarus', name: 'Hidden Cobra', origin: 'North Korea', activity: 'Active' }
        ],
        stats: {
          activeCampaigns: 8,
          newIOCs: 156,
          affectedSectors: ['Finance', 'Healthcare', 'Government']
        }
      },
      asm: {
        assets: [
          { id: 'SRV-001', type: 'Server', vulnerabilities: 5, exposure: 'High' },
          { id: 'APP-002', type: 'Web Application', vulnerabilities: 3, exposure: 'Medium' },
          { id: 'NET-003', type: 'Network Device', vulnerabilities: 1, exposure: 'Low' }
        ],
        stats: {
          totalAssets: 128,
          exposedAssets: 23,
          criticalAssets: 15
        }
      }
    };

    // Utiliser une assertion de type pour indiquer à TypeScript que l'accès est sûr
    this.microserviceData[tab] = mockData[tab];
  }
}

