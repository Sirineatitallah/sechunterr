//vi.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';

// Import VI visualization components
import { SeverityDistributionComponent } from '../../../../vi/components/severity-distribution/severity-distribution.component';
import { MonthlyTrendsComponent } from '../../../../vi/components/monthly-trends/monthly-trends.component';
import { TopVulnerabilitiesComponent } from '../../../../vi/components/top-vulnerabilities/top-vulnerabilities.component';
import { VulnerabilityDetailComponent } from '../../../../vi/components/vulnerability-detail/vulnerability-detail.component';

// Interfaces
interface TimeRange {
  id: string;
  label: string;
}

interface VulnerabilitySummary {
  totalVulnerabilities: number;
  criticalVulnerabilities: number;
  highVulnerabilities: number;
  patchedVulnerabilities: number;
  trend: number;
}

interface Vulnerability {
  id: string;
  cve: string;
  title: string;
  severity: string;
  cvss: number;
  status: string;
  affectedSystems: number;
}

interface VulnerabilityCategory {
  id: string;
  name: string;
  count: number;
  color: string;
}

interface MetricData {
  value: number;
  trend: number;
  history: number[];
}

interface SystemVulnerability {
  name: string;
  count: number;
  color: string;
}

interface RemediationStatus {
  name: string;
  percentage: number;
  color: string;
}

interface RemediationMetrics {
  patchRate: MetricData;
  meanTimeToRemediate: MetricData;
  vulnerabilitiesBySystem: SystemVulnerability[];
  remediationStatus: RemediationStatus[];
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    RouterModule,
    SeverityDistributionComponent,
    MonthlyTrendsComponent,
    TopVulnerabilitiesComponent,
    VulnerabilityDetailComponent
  ],
  templateUrl: './vi.component.html',
  styleUrls: ['./vi.component.scss']
})
export class ViComponent implements OnInit {
  // Time ranges
  timeRanges: TimeRange[] = [
    { id: '7d', label: '7 jours' },
    { id: '30d', label: '30 jours' },
    { id: '6m', label: '6 mois' },
    { id: '1y', label: '1 an' }
  ];
  selectedTimeRange: string = '7d';

  // Vulnerability summary
  vulnerabilitySummary: VulnerabilitySummary = {
    totalVulnerabilities: 0,
    criticalVulnerabilities: 0,
    highVulnerabilities: 0,
    patchedVulnerabilities: 0,
    trend: 0
  };

  // Top vulnerabilities
  topVulnerabilities: Vulnerability[] = [];

  // Vulnerability categories
  vulnerabilityCategories: VulnerabilityCategory[] = [];

  // Remediation metrics
  remediationMetrics: RemediationMetrics = {
    patchRate: { value: 0, trend: 0, history: [] },
    meanTimeToRemediate: { value: 0, trend: 0, history: [] },
    vulnerabilitiesBySystem: [],
    remediationStatus: []
  };

  constructor() { }

  ngOnInit(): void {
    // Initialize mock data
    this.initMockData();
  }

  // Set time range
  setTimeRange(rangeId: string): void {
    this.selectedTimeRange = rangeId;
    // Refresh data based on new time range
    this.refreshAll();
  }

  // Refresh all data
  refreshAll(): void {
    // In a real application, this would call APIs to refresh data
    console.log('Refreshing all data for time range:', this.selectedTimeRange);
    this.initMockData(); // For demo, just reinitialize mock data
  }

  // Get CVSS class based on score
  getCvssClass(cvss: number): string {
    if (cvss >= 9.0) return 'critical';
    if (cvss >= 7.0) return 'high';
    if (cvss >= 4.0) return 'medium';
    return 'low';
  }

  // Get total category count
  getTotalCategoryCount(): number {
    return this.vulnerabilityCategories.reduce((total, category) => total + category.count, 0);
  }

  // Get segment rotation for donut chart
  getSegmentRotation(index: number): number {
    if (index === 0) return 0;

    let totalAngle = 0;
    const total = this.getTotalCategoryCount();

    for (let i = 0; i < index; i++) {
      totalAngle += (this.vulnerabilityCategories[i].count / total) * 360;
    }

    return totalAngle;
  }

  // Get segment path for donut chart
  getSegmentPath(index: number): string {
    const total = this.getTotalCategoryCount();
    const percentage = this.vulnerabilityCategories[index].count / total;
    const angle = percentage * 360;

    // For simplicity, we're just returning a basic path
    // In a real implementation, this would calculate the actual SVG path
    if (angle <= 90) {
      return '100% 0%';
    } else if (angle <= 180) {
      return '100% 100%';
    } else if (angle <= 270) {
      return '0% 100%';
    } else {
      return '0% 0%';
    }
  }

  // Get max value from history array for charts
  getMaxHistoryValue(history: number[]): number {
    return Math.max(...history, 1); // Ensure we don't divide by zero
  }

  // Get max system count for bar charts
  getMaxSystemCount(): number {
    return Math.max(...this.remediationMetrics.vulnerabilitiesBySystem.map(system => system.count), 1);
  }

  // Get status rotation for donut chart
  getStatusRotation(index: number): number {
    if (index === 0) return 0;

    let totalAngle = 0;
    const total = this.remediationMetrics.remediationStatus.reduce((sum, status) => sum + status.percentage, 0);

    for (let i = 0; i < index; i++) {
      totalAngle += (this.remediationMetrics.remediationStatus[i].percentage / total) * 360;
    }

    return totalAngle;
  }

  // Get status path for donut chart
  getStatusPath(index: number): string {
    const total = this.remediationMetrics.remediationStatus.reduce((sum, status) => sum + status.percentage, 0);
    const percentage = this.remediationMetrics.remediationStatus[index].percentage / total;
    const angle = percentage * 360;

    // For simplicity, we're just returning a basic path
    // In a real implementation, this would calculate the actual SVG path
    if (angle <= 90) {
      return '100% 0%';
    } else if (angle <= 180) {
      return '100% 100%';
    } else if (angle <= 270) {
      return '0% 100%';
    } else {
      return '0% 0%';
    }
  }

  // Initialize mock data for demo
  private initMockData(): void {
    // Mock vulnerability summary
    this.vulnerabilitySummary = {
      totalVulnerabilities: 1247,
      criticalVulnerabilities: 186,
      highVulnerabilities: 342,
      patchedVulnerabilities: 719,
      trend: -8.5
    };

    // Mock top vulnerabilities
    this.topVulnerabilities = [
      {
        id: 'v1',
        cve: 'CVE-2023-1234',
        title: 'Exécution de code à distance dans Apache Log4j',
        severity: 'critical',
        cvss: 9.8,
        status: 'open',
        affectedSystems: 42
      },
      {
        id: 'v2',
        cve: 'CVE-2023-5678',
        title: 'Vulnérabilité d\'injection SQL dans MySQL',
        severity: 'high',
        cvss: 8.2,
        status: 'in-progress',
        affectedSystems: 28
      },
      {
        id: 'v3',
        cve: 'CVE-2023-9012',
        title: 'Déni de service dans Nginx',
        severity: 'critical',
        cvss: 9.1,
        status: 'open',
        affectedSystems: 35
      },
      {
        id: 'v4',
        cve: 'CVE-2023-3456',
        title: 'Élévation de privilèges dans Windows Server',
        severity: 'high',
        cvss: 7.8,
        status: 'in-progress',
        affectedSystems: 18
      },
      {
        id: 'v5',
        cve: 'CVE-2023-7890',
        title: 'Fuite d\'informations dans OpenSSL',
        severity: 'critical',
        cvss: 9.4,
        status: 'open',
        affectedSystems: 31
      }
    ];

    // Mock vulnerability categories
    this.vulnerabilityCategories = [
      {
        id: 'c1',
        name: 'Injection',
        count: 342,
        color: '#4a90e2'
      },
      {
        id: 'c2',
        name: 'Authentification',
        count: 256,
        color: '#50e3c2'
      },
      {
        id: 'c3',
        name: 'Exposition de données',
        count: 198,
        color: '#f5a623'
      },
      {
        id: 'c4',
        name: 'XSS',
        count: 175,
        color: '#9013fe'
      },
      {
        id: 'c5',
        name: 'Accès',
        count: 147,
        color: '#b8e986'
      },
      {
        id: 'c6',
        name: 'Autres',
        count: 129,
        color: '#d0021b'
      }
    ];

    // Mock remediation metrics
    this.remediationMetrics = {
      patchRate: {
        value: 68,
        trend: 12,
        history: []
      },
      meanTimeToRemediate: {
        value: 12.5,
        trend: -18,
        history: [22, 19, 17, 15, 13.5, 12.5]
      },
      vulnerabilitiesBySystem: [
        { name: 'Serveurs Web', count: 156, color: '#4a90e2' },
        { name: 'Bases de données', count: 124, color: '#50e3c2' },
        { name: 'Applications', count: 98, color: '#f5a623' },
        { name: 'Endpoints', count: 78, color: '#9013fe' },
        { name: 'Réseau', count: 45, color: '#b8e986' }
      ],
      remediationStatus: [
        { name: 'Corrigé', percentage: 58, color: '#4a90e2' },
        { name: 'En cours', percentage: 22, color: '#f5a623' },
        { name: 'Planifié', percentage: 15, color: '#50e3c2' },
        { name: 'Non traité', percentage: 5, color: '#d0021b' }
      ]
    };
  }
}