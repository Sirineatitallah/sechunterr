import { Component, OnInit, OnDestroy, HostBinding, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule, MatTabChangeEvent } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTableModule } from '@angular/material/table';
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
import { Alert } from '../../shared/components/recent-alerts/recent-alerts.component';

// Vulnerability dashboard components
import { VulnerabilitiesTableComponent } from './components/vulnerabilities-table/vulnerabilities-table.component';
import { SeverityChartComponent } from './components/severity-chart/severity-chart.component';
import { CVSSLineChartComponent } from './components/cvss-line-chart/cvss-line-chart.component';
import { HostBarChartComponent } from './components/host-bar-chart/host-bar-chart.component';

import { VulnerabilityDetailsDialogComponent } from './components/vulnerability-details-dialog/vulnerability-details-dialog.component';

// CTI components
import { ThreatMapComponent } from '../../cti/components/threat-map/threat-map.component';
import { MitreHeatmapComponent } from '../../cti/components/mitre-heatmap/mitre-heatmap.component';

// ASM components
import { AttackSurfaceComponent } from '../../asm/components/attack-surface/attack-surface.component';

// Services and models
import { VulnerabilityService } from './services/vulnerability.service';
import { Vulnerability } from './models/vulnerability.model';

// Interfaces for task management
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: Date;
  completedDate?: Date;
  assignedBy: string;
  comments: TaskComment[];
}

interface TaskComment {
  id: string;
  author: string;
  content: string;
  date: Date;
}

// Interface for reports
interface Report {
  id: string;
  title: string;
  type: string;
  date: Date;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  content?: string;
  fileUrl?: string;
}


@Component({
  selector: 'app-analyst-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatTableModule,
    RouterModule,
    SidebarComponent,
    NotificationCenterComponent,
    SecurityEventsComponent,
    GlobalSearchComponent,
    RealTimeStatsComponent,

    // Vulnerability dashboard components
    VulnerabilitiesTableComponent,
    SeverityChartComponent,
    CVSSLineChartComponent,
    HostBarChartComponent,
    // VulnerabilityDetailsDialogComponent is needed for the dialog opened in onViewVulnerabilityDetails method
    // It's not directly used in the template, but it's required for the dialog to work
    VulnerabilityDetailsDialogComponent,

    // CTI components
    ThreatMapComponent,
    MitreHeatmapComponent,

    // ASM components
    AttackSurfaceComponent
  ],
  templateUrl: './analyst-dashboard.component.html',
  styleUrls: ['./analyst-dashboard.component.scss'],
  providers: [VulnerabilityService]
})
export class AnalystDashboardComponent implements OnInit, OnDestroy {
  @HostBinding('class.dark-theme') isDarkTheme = true;
  @ViewChild('taskDetailTemplate') taskDetailTemplate!: TemplateRef<any>;

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
  filteredVulnerabilities: Vulnerability[] = [];
  loadingVulnerabilities = false;
  selectedVulnerability: Vulnerability | null = null;

  // Microservice-specific vulnerability data
  viVulnerabilities: Vulnerability[] = [];

  // Filter states
  selectedDateRange: string = 'month';
  selectedSeverity: string[] = ['critical', 'high', 'medium', 'low'];
  selectedService: string = 'all';
  selectedMicroservice: 'vi' | 'cti' | 'asm' = 'vi';

  // Task management
  tasks: Task[] = [];
  selectedTaskStatus: string = 'all';
  selectedTask: Task | null = null;
  newComment: string = '';

  // Reports
  reportsHistory: Report[] = [];

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

    // Initialize mock tasks
    this.initMockTasks();

    // Initialize mock reports
    this.initMockReports();

    // Apply initial filters
    this.applyFilters();
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
  onTabChange(event: MatTabChangeEvent): void {
    const tabs: ('vi' | 'cti' | 'asm')[] = ['vi', 'cti', 'asm'];
    this.selectedTabIndex = event.index;
    this.activeTab = tabs[event.index];
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
   * Apply filters to vulnerability data
   */
  applyFilters(): void {
    if (!this.vulnerabilities || this.vulnerabilities.length === 0) {
      this.filteredVulnerabilities = [];
      return;
    }

    // Start with all vulnerabilities
    let filtered = [...this.vulnerabilities];

    // Filter by date range
    if (this.selectedDateRange) {
      const now = new Date();
      let startDate: Date;

      switch (this.selectedDateRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(now);
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate = new Date(now);
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        default:
          startDate = new Date(0); // Beginning of time
      }

      filtered = filtered.filter(v => new Date(v.discoveredDate) >= startDate);
    }

    // Filter by severity
    if (this.selectedSeverity && this.selectedSeverity.length > 0) {
      filtered = filtered.filter(v =>
        this.selectedSeverity.includes(v.severity.toLowerCase())
      );
    }

    // Filter by service (microservice)
    if (this.selectedService && this.selectedService !== 'all') {
      // In a real application, this would filter based on the source microservice
      // For now, we'll just simulate it with a random subset
      if (this.selectedService === 'vi') {
        filtered = filtered.filter(v => v.cve_ids && v.cve_ids.length > 0);
      } else if (this.selectedService === 'cti') {
        filtered = filtered.filter(v => v.exploitAvailable);
      } else if (this.selectedService === 'asm') {
        filtered = filtered.filter(v => v.host_ip.startsWith('192.168'));
      }
    }

    this.filteredVulnerabilities = filtered;
  }

  /**
   * Export data in specified format
   */
  exportData(format: string): void {
    if (this.filteredVulnerabilities.length === 0) {
      this.notificationService.showWarning('Aucune donnée à exporter');
      return;
    }

    this.notificationService.showInfo(`Exportation des données au format ${format.toUpperCase()}...`);

    // In a real application, this would call a service to export the data
    setTimeout(() => {
      this.notificationService.showSuccess(`Données exportées au format ${format.toUpperCase()}`);
    }, 1500);
  }

  /**
   * Handle microservice change in the second tab
   */
  onMicroserviceChange(_event: any): void {
    // Load data for the selected microservice
    this.loadTabData(this.selectedMicroservice);

    // In a real application, this would load specific data for the selected microservice
    if (this.selectedMicroservice === 'vi') {
      this.viVulnerabilities = this.vulnerabilities.filter(v => v.cve_ids && v.cve_ids.length > 0);
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
   * Initialize mock tasks for demonstration
   */
  private initMockTasks(): void {
    this.tasks = [
      {
        id: '1',
        title: 'Analyser la vulnérabilité CVE-2023-1234',
        description: 'Évaluer l\'impact de la vulnérabilité Log4j sur nos systèmes et proposer des mesures de remédiation.',
        status: 'todo',
        priority: 'high',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        assignedBy: 'Admin',
        comments: []
      },
      {
        id: '2',
        title: 'Vérifier les alertes de sécurité du firewall',
        description: 'Examiner les alertes récentes du firewall et déterminer s\'il y a des tentatives d\'intrusion légitimes.',
        status: 'in-progress',
        priority: 'medium',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        assignedBy: 'Admin',
        comments: [
          {
            id: '1',
            author: 'John Doe',
            content: 'J\'ai commencé à analyser les logs. Plusieurs tentatives suspectes détectées.',
            date: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
          }
        ]
      },
      {
        id: '3',
        title: 'Mettre à jour la base de signatures IDS',
        description: 'Télécharger et installer les dernières signatures pour notre système de détection d\'intrusion.',
        status: 'done',
        priority: 'low',
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        completedDate: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        assignedBy: 'Admin',
        comments: [
          {
            id: '1',
            author: 'John Doe',
            content: 'Mise à jour effectuée avec succès. 250 nouvelles signatures ajoutées.',
            date: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
          }
        ]
      },
      {
        id: '4',
        title: 'Analyser la campagne de phishing récente',
        description: 'Examiner les emails de phishing récents et identifier les indicateurs de compromission (IOCs).',
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        assignedBy: 'Admin',
        comments: []
      },
      {
        id: '5',
        title: 'Vérifier les correctifs de sécurité Windows',
        description: 'S\'assurer que tous les serveurs Windows ont les derniers correctifs de sécurité installés.',
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        assignedBy: 'Admin',
        comments: []
      }
    ];
  }

  /**
   * Initialize mock reports for demonstration
   */
  private initMockReports(): void {
    this.reportsHistory = [
      {
        id: '1',
        title: 'Rapport mensuel de vulnérabilités - Janvier 2024',
        type: 'Mensuel',
        date: new Date(2024, 0, 31), // January 31, 2024
        status: 'approved',
        fileUrl: '/reports/monthly-2024-01.pdf'
      },
      {
        id: '2',
        title: 'Analyse de la campagne de phishing Q1 2024',
        type: 'Analyse',
        date: new Date(2024, 2, 15), // March 15, 2024
        status: 'submitted',
        fileUrl: '/reports/phishing-q1-2024.pdf'
      },
      {
        id: '3',
        title: 'Évaluation de sécurité - Infrastructure Cloud',
        type: 'Évaluation',
        date: new Date(2024, 1, 20), // February 20, 2024
        status: 'approved',
        fileUrl: '/reports/cloud-security-assessment.pdf'
      },
      {
        id: '4',
        title: 'Rapport d\'incident - Tentative d\'intrusion',
        type: 'Incident',
        date: new Date(2024, 2, 5), // March 5, 2024
        status: 'draft',
        fileUrl: '/reports/incident-report-draft.pdf'
      }
    ];
  }

  /**
   * Get tasks filtered by status
   */
  getTasksByStatus(status: string): Task[] {
    if (status === 'all' || !status) {
      return this.tasks;
    }
    return this.tasks.filter(task => task.status === status);
  }

  /**
   * Get count of tasks by status
   */
  getTaskCountByStatus(status: string): number {
    return this.getTasksByStatus(status).length;
  }

  /**
   * Filter tasks based on selected status
   */
  filterTasks(): void {
    // This method is called when the task filter dropdown changes
    // The filtering is handled by getTasksByStatus
  }

  /**
   * Update task status
   */
  updateTaskStatus(task: Task, newStatus: 'todo' | 'in-progress' | 'done'): void {
    const taskIndex = this.tasks.findIndex(t => t.id === task.id);
    if (taskIndex !== -1) {
      this.tasks[taskIndex].status = newStatus;

      // If task is marked as done, set completed date
      if (newStatus === 'done') {
        this.tasks[taskIndex].completedDate = new Date();
      } else {
        // Remove completed date if task is moved back to in-progress or todo
        delete this.tasks[taskIndex].completedDate;
      }

      this.notificationService.showSuccess(`Statut de la tâche mis à jour: ${task.title}`);
    }
  }

  /**
   * Open task details dialog
   */
  openTaskDetails(task: Task): void {
    this.selectedTask = { ...task };
    this.dialog.open(this.taskDetailTemplate, {
      width: '700px',
      panelClass: 'dark-theme-dialog'
    });
  }

  /**
   * Add comment to selected task
   */
  addComment(): void {
    if (!this.selectedTask || !this.newComment) {
      return;
    }

    const comment: TaskComment = {
      id: Date.now().toString(),
      author: this.analystName,
      content: this.newComment,
      date: new Date()
    };

    // Add to selected task (dialog view)
    this.selectedTask.comments.push(comment);

    // Clear comment input
    this.newComment = '';
  }

  /**
   * Save task changes
   */
  saveTaskChanges(): void {
    if (!this.selectedTask) {
      return;
    }

    // Find and update the task in the main array
    const taskIndex = this.tasks.findIndex(t => t.id === this.selectedTask!.id);
    if (taskIndex !== -1) {
      this.tasks[taskIndex] = { ...this.selectedTask };
      this.notificationService.showSuccess('Tâche mise à jour avec succès');
    }

    // Close dialog
    this.dialog.closeAll();
  }

  /**
   * Create new task
   */
  createNewTask(): void {
    const newTask: Task = {
      id: Date.now().toString(),
      title: 'Nouvelle tâche',
      description: 'Description de la tâche',
      status: 'todo',
      priority: 'medium',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      assignedBy: 'Admin',
      comments: []
    };

    this.tasks.push(newTask);
    this.openTaskDetails(newTask);
  }

  /**
   * Get priority label
   */
  getPriorityLabel(priority: string | undefined): string {
    if (!priority) return '';

    switch (priority) {
      case 'high': return 'Haute';
      case 'medium': return 'Moyenne';
      case 'low': return 'Faible';
      default: return priority;
    }
  }

  /**
   * Get status label
   */
  getStatusLabel(status: string | undefined): string {
    if (!status) return '';

    switch (status) {
      case 'todo': return 'À faire';
      case 'in-progress': return 'En cours';
      case 'done': return 'Fait';
      default: return status;
    }
  }

  /**
   * Get report status label
   */
  getReportStatusLabel(status: string): string {
    switch (status) {
      case 'draft': return 'Brouillon';
      case 'submitted': return 'Soumis';
      case 'approved': return 'Approuvé';
      case 'rejected': return 'Rejeté';
      default: return status;
    }
  }

  /**
   * Launch integrated tool
   */
  launchTool(toolName: string): void {
    this.notificationService.showInfo(`Lancement de l'outil: ${toolName}`);
    // In a real application, this would launch the tool
  }

  /**
   * Open resource
   */
  openResource(resourceType: string): void {
    this.notificationService.showInfo(`Ouverture de la ressource: ${resourceType}`);
    // In a real application, this would open the resource
  }

  /**
   * Generate report
   */
  generateReport(): void {
    this.notificationService.showInfo('Génération du rapport en cours...');

    // In a real application, this would call a service to generate a report
    setTimeout(() => {
      const newReport: Report = {
        id: Date.now().toString(),
        title: `Rapport de vulnérabilités - ${new Date().toLocaleDateString()}`,
        type: 'Automatique',
        date: new Date(),
        status: 'draft'
      };

      this.reportsHistory.unshift(newReport);
      this.notificationService.showSuccess('Rapport généré avec succès');
    }, 2000);
  }

  /**
   * Report critical vulnerability
   */
  reportCriticalVulnerability(): void {
    this.notificationService.showInfo('Préparation du formulaire de signalement...');

    // In a real application, this would open a form to report a critical vulnerability
    setTimeout(() => {
      this.notificationService.showSuccess('Vulnérabilité critique signalée avec succès');
    }, 1500);
  }

  /**
   * View report
   */
  viewReport(report: Report): void {
    this.notificationService.showInfo(`Affichage du rapport: ${report.title}`);
    // In a real application, this would open the report
  }

  /**
   * Download report
   */
  downloadReport(report: Report): void {
    this.notificationService.showInfo(`Téléchargement du rapport: ${report.title}`);
    // In a real application, this would download the report
  }

  /**
   * Share report
   */
  shareReport(report: Report): void {
    this.notificationService.showInfo(`Partage du rapport: ${report.title}`);
    // In a real application, this would open a sharing dialog
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

