//vi.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { VulnerabilityService, Vulnerability as ApiVulnerability } from '../../services/vulnerability.service';

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

// Nouvelles interfaces pour les graphiques VI
interface TopCVE {
  id: string;
  count: number;
  severity: string;
}

interface SeverityLevel {
  name: string;
  count: number;
  color: string;
}

interface OsintSource {
  name: string;
  dailyVolume: number[];
  totalVolume: number;
}

interface DailyVulnerability {
  date: string;
  count: number;
}

interface Keyword {
  text: string;
  frequency: number;
}

interface NewsItem {
  date: string;
  source: string;
  sourceType: string;
  title: string;
}

interface SoftwareVulnerability {
  name: string;
  count: number;
  color: string;
}

interface CountryVulnerability {
  name: string;
  count: number;
  position: {
    x: number;
    y: number;
  };
}

interface LegendLevel {
  value: number;
  label: string;
}

interface BotStatusInfo {
  name: string;
  type: string;
  activity: number;
  status: string;
  lastRun: string;
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    RouterModule,
    HttpClientModule
  ],
  templateUrl: './vi.component.html',
  styleUrls: ['./vi.component.scss']
})
export class ViComponent implements OnInit, OnDestroy {
  // Subscription to manage API calls
  private subscriptions: Subscription[] = [];

  // API data
  apiVulnerabilities: ApiVulnerability[] = [];
  isLoading = false;
  apiError: string | null = null;
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

  // 1. Top CVEs détectées
  topCVEs: TopCVE[] = [];

  // 2. Vulnérabilités par criticité
  vulnerabilitiesBySeverity: SeverityLevel[] = [];

  // 3. Source OSINT vs Volume de données
  osintSources: OsintSource[] = [];
  lastSevenDays: string[] = [];

  // 4. Vulnérabilités détectées / jour
  dailyVulnerabilities: DailyVulnerability[] = [];

  // 6. Mots-clés fréquents
  frequentKeywords: Keyword[] = [];

  // 7. News par source
  latestNews: NewsItem[] = [];

  // 8. Vulnérabilités par logiciel cible
  vulnerabilitiesBySoftware: SoftwareVulnerability[] = [];

  // 9. Vulnérabilités par pays
  vulnerabilitiesByCountry: CountryVulnerability[] = [];
  countryLegendLevels: LegendLevel[] = [
    { value: 10, label: '< 10' },
    { value: 50, label: '10-50' },
    { value: 100, label: '50-100' },
    { value: 200, label: '> 100' }
  ];

  // 10. État des bots
  botStatus: BotStatusInfo[] = [];

  constructor(private vulnerabilityService: VulnerabilityService) { }

  ngOnInit(): void {
    // Initialize mock data
    this.initMockData();

    // Load data from API
    this.loadVulnerabilityData();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Load vulnerability data from the API
   */
  loadVulnerabilityData(): void {
    this.isLoading = true;
    this.apiError = null;

    const subscription = this.vulnerabilityService.getVulnerabilities().subscribe({
      next: (data) => {
        this.apiVulnerabilities = data;
        this.isLoading = false;

        // Update UI with API data if available
        if (data.length > 0) {
          this.updateUIWithAPIData();
        }

        console.log('Loaded vulnerability data from API:', data.length, 'items');
      },
      error: (error) => {
        console.error('Error loading vulnerability data from API:', error);
        this.apiError = 'Failed to load vulnerability data from API';
        this.isLoading = false;
      }
    });

    this.subscriptions.push(subscription);
  }

  /**
   * Update UI components with API data
   */
  private updateUIWithAPIData(): void {
    if (this.apiVulnerabilities.length === 0) return;

    // Update vulnerability summary
    const criticalCount = this.apiVulnerabilities.filter(v => v.severity.toLowerCase() === 'critical').length;
    const highCount = this.apiVulnerabilities.filter(v => v.severity.toLowerCase() === 'high').length;
    const patchedCount = this.apiVulnerabilities.filter(v => v.patchAvailable).length;

    this.vulnerabilitySummary = {
      totalVulnerabilities: this.apiVulnerabilities.length,
      criticalVulnerabilities: criticalCount,
      highVulnerabilities: highCount,
      patchedVulnerabilities: patchedCount,
      trend: -5 // Mock trend for now
    };

    // Update top vulnerabilities
    this.topVulnerabilities = this.apiVulnerabilities
      .filter(v => v.severity.toLowerCase() === 'critical' || v.severity.toLowerCase() === 'high')
      .slice(0, 5)
      .map(v => ({
        id: v.id,
        cve: v.cve_ids[0] || 'Unknown',
        title: v.vulnerabilityName,
        severity: v.severity.toLowerCase(),
        cvss: v.cvssScore,
        status: v.status,
        affectedSystems: Math.floor(Math.random() * 50) + 1 // Mock affected systems count
      }));

    // Update other UI components as needed
    console.log('UI updated with API data');
  }

  // Set time range
  setTimeRange(rangeId: string): void {
    this.selectedTimeRange = rangeId;
    // Refresh data based on new time range
    this.refreshAll();
  }

  // Refresh all data
  refreshAll(): void {
    console.log('Refreshing all data for time range:', this.selectedTimeRange);

    // Show loading state
    this.isLoading = true;

    // Load data from API
    this.loadVulnerabilityData();

    // Also refresh mock data for components not yet connected to API
    this.initMockData();

    // Show notification to user
    this.showNotification('Données rafraîchies depuis l\'API');
  }

  /**
   * Show a notification to the user
   */
  private showNotification(message: string): void {
    // Create a notification element
    const notification = document.createElement('div');
    notification.className = 'api-notification';
    notification.textContent = message;

    // Add it to the document
    document.body.appendChild(notification);

    // Remove it after a delay
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 3000);
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

  // Méthodes pour les nouveaux graphiques
  // 1. Top CVEs détectées
  getMaxCVECount(): number {
    return Math.max(...this.topCVEs.map(cve => cve.count), 1);
  }

  getCVESeverityColor(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'critical': return '#d0021b';
      case 'high': return '#f5a623';
      case 'medium': return '#f8e71c';
      case 'low': return '#7ed321';
      default: return '#4a90e2';
    }
  }

  // 2. Vulnérabilités par criticité
  getTotalVulnerabilities(): number {
    return this.vulnerabilitiesBySeverity.reduce((total, severity) => total + severity.count, 0);
  }

  getSeverityRotation(index: number): number {
    if (index === 0) return 0;

    let totalAngle = 0;
    const total = this.getTotalVulnerabilities();

    for (let i = 0; i < index; i++) {
      totalAngle += (this.vulnerabilitiesBySeverity[i].count / total) * 360;
    }

    return totalAngle;
  }

  getSeverityPath(index: number): string {
    const total = this.getTotalVulnerabilities();
    const percentage = this.vulnerabilitiesBySeverity[index].count / total;
    const angle = percentage * 360;

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

  // 3. Source OSINT vs Volume de données
  getMaxDailyVolume(): number {
    return Math.max(...this.osintSources.flatMap(source => source.dailyVolume), 1);
  }

  getHeatmapColor(value: number, max: number): string {
    const intensity = Math.min(value / max, 1);
    // Gradient from light blue to dark blue
    return `rgba(0, 123, 255, ${0.1 + intensity * 0.9})`;
  }

  // 4. Vulnérabilités détectées / jour
  getMaxDailyVulnerabilityCount(): number {
    return Math.max(...this.dailyVulnerabilities.map(day => day.count), 1);
  }

  getTimeSeriesPoints(data: DailyVulnerability[]): string {
    if (!data || data.length === 0) return '';

    const maxCount = this.getMaxDailyVulnerabilityCount();
    return data.map((point, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (point.count / maxCount * 80);
      return `${x},${y}`;
    }).join(' ');
  }

  // 6. Mots-clés fréquents
  getKeywordSize(frequency: number): number {
    const minSize = 12;
    const maxSize = 32;
    const maxFrequency = Math.max(...this.frequentKeywords.map(k => k.frequency), 1);
    return minSize + (frequency / maxFrequency) * (maxSize - minSize);
  }

  getKeywordColor(frequency: number): string {
    const maxFrequency = Math.max(...this.frequentKeywords.map(k => k.frequency), 1);
    const intensity = frequency / maxFrequency;

    // Gradient from light blue to dark blue
    if (intensity < 0.33) {
      return '#4a90e2'; // Light blue
    } else if (intensity < 0.66) {
      return '#0066cc'; // Medium blue
    } else {
      return '#003399'; // Dark blue
    }
  }

  // 7. News par source
  getSourceIcon(sourceType: string): string {
    switch (sourceType.toLowerCase()) {
      case 'rss': return 'rss_feed';
      case 'twitter': return 'twitter';
      case 'github': return 'code';
      case 'blog': return 'article';
      case 'news': return 'newspaper';
      default: return 'public';
    }
  }

  // 8. Vulnérabilités par logiciel cible
  getMaxSoftwareVulnerabilityCount(): number {
    return Math.max(...this.vulnerabilitiesBySoftware.map(software => software.count), 1);
  }

  // 9. Vulnérabilités par pays
  getMarkerSize(count: number): number {
    const minSize = 8;
    const maxSize = 24;
    const maxCount = Math.max(...this.vulnerabilitiesByCountry.map(country => country.count), 1);
    return minSize + (count / maxCount) * (maxSize - minSize);
  }

  getMarkerColor(count: number): string {
    if (count < 10) {
      return '#4a90e2'; // Light blue
    } else if (count < 50) {
      return '#f5a623'; // Orange
    } else if (count < 100) {
      return '#f8e71c'; // Yellow
    } else {
      return '#d0021b'; // Red
    }
  }

  // 10. État des bots
  getBotIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'crawler': return 'travel_explore';
      case 'analyzer': return 'analytics';
      case 'collector': return 'download';
      case 'scanner': return 'security';
      default: return 'smart_toy';
    }
  }

  getBotActivityClass(activity: number): string {
    if (activity < 30) {
      return 'activity-low';
    } else if (activity < 70) {
      return 'activity-medium';
    } else {
      return 'activity-high';
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

    // 1. Top CVEs détectées
    this.topCVEs = [
      { id: 'CVE-2023-32315', count: 156, severity: 'critical' },
      { id: 'CVE-2023-28432', count: 124, severity: 'high' },
      { id: 'CVE-2023-41991', count: 98, severity: 'critical' },
      { id: 'CVE-2023-36025', count: 78, severity: 'high' },
      { id: 'CVE-2023-38831', count: 65, severity: 'medium' },
      { id: 'CVE-2023-29336', count: 52, severity: 'high' },
      { id: 'CVE-2023-35674', count: 43, severity: 'medium' },
      { id: 'CVE-2023-42793', count: 38, severity: 'low' }
    ];

    // 2. Vulnérabilités par criticité
    this.vulnerabilitiesBySeverity = [
      { name: 'Critique', count: 186, color: '#d0021b' },
      { name: 'Élevée', count: 342, color: '#f5a623' },
      { name: 'Moyenne', count: 485, color: '#f8e71c' },
      { name: 'Faible', count: 234, color: '#7ed321' }
    ];

    // 3. Source OSINT vs Volume de données
    const today = new Date();
    this.lastSevenDays = Array(7).fill(0).map((_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    });

    this.osintSources = [
      {
        name: 'NVD',
        dailyVolume: [45, 38, 52, 63, 47, 55, 61],
        totalVolume: 361
      },
      {
        name: 'GitHub Security',
        dailyVolume: [32, 28, 35, 42, 38, 45, 40],
        totalVolume: 260
      },
      {
        name: 'ExploitDB',
        dailyVolume: [18, 15, 22, 19, 24, 20, 25],
        totalVolume: 143
      },
      {
        name: 'Twitter/X',
        dailyVolume: [65, 58, 72, 68, 75, 82, 78],
        totalVolume: 498
      },
      {
        name: 'Security Blogs',
        dailyVolume: [28, 32, 25, 30, 35, 29, 33],
        totalVolume: 212
      }
    ];

    // 4. Vulnérabilités détectées / jour
    this.dailyVulnerabilities = Array(14).fill(0).map((_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (13 - i));
      const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      // Generate random count with some trend
      const baseCount = 30 + Math.floor(i * 1.5);
      const randomVariation = Math.floor(Math.random() * 15) - 7;
      return { date: dateStr, count: baseCount + randomVariation };
    });

    // 6. Mots-clés fréquents
    this.frequentKeywords = [
      { text: 'RCE', frequency: 85 },
      { text: 'SQLi', frequency: 72 },
      { text: 'XSS', frequency: 68 },
      { text: 'CSRF', frequency: 45 },
      { text: 'Buffer Overflow', frequency: 42 },
      { text: 'Authentication', frequency: 38 },
      { text: 'Privilege Escalation', frequency: 35 },
      { text: 'Zero-day', frequency: 32 },
      { text: 'Patch', frequency: 30 },
      { text: 'Exploit', frequency: 28 },
      { text: 'Malware', frequency: 25 },
      { text: 'Ransomware', frequency: 22 },
      { text: 'CVE', frequency: 20 },
      { text: 'CVSS', frequency: 18 },
      { text: 'Vulnerability', frequency: 15 },
      { text: 'Security', frequency: 12 },
      { text: 'Threat', frequency: 10 },
      { text: 'Attack', frequency: 8 }
    ];

    // 7. News par source
    this.latestNews = [
      {
        date: '15/05/2023',
        source: 'CVE Details',
        sourceType: 'rss',
        title: 'Nouvelle vulnérabilité critique dans Apache Struts'
      },
      {
        date: '14/05/2023',
        source: 'Security Focus',
        sourceType: 'blog',
        title: 'Analyse de la vulnérabilité CVE-2023-32315'
      },
      {
        date: '14/05/2023',
        source: '@SecurityResearcher',
        sourceType: 'twitter',
        title: 'Découverte d\'un exploit zero-day dans Windows 11'
      },
      {
        date: '13/05/2023',
        source: 'GitHub Security',
        sourceType: 'github',
        title: 'Correctif pour la vulnérabilité dans React'
      },
      {
        date: '12/05/2023',
        source: 'Krebs on Security',
        sourceType: 'blog',
        title: 'Nouvelle campagne de ransomware ciblant le secteur financier'
      },
      {
        date: '11/05/2023',
        source: 'The Hacker News',
        sourceType: 'news',
        title: 'Vulnérabilité critique dans OpenSSL affectant des millions de serveurs'
      },
      {
        date: '10/05/2023',
        source: 'CERT-FR',
        sourceType: 'rss',
        title: 'Alerte sur une nouvelle vulnérabilité dans Microsoft Exchange'
      }
    ];

    // 8. Vulnérabilités par logiciel cible
    this.vulnerabilitiesBySoftware = [
      { name: 'Windows', count: 187, color: '#4a90e2' },
      { name: 'Apache', count: 156, color: '#50e3c2' },
      { name: 'Nginx', count: 124, color: '#f5a623' },
      { name: 'MySQL', count: 98, color: '#9013fe' },
      { name: 'WordPress', count: 87, color: '#b8e986' },
      { name: 'PHP', count: 76, color: '#d0021b' },
      { name: 'OpenSSL', count: 65, color: '#7ed321' },
      { name: 'Linux Kernel', count: 54, color: '#bd10e0' }
    ];

    // 9. Vulnérabilités par pays
    this.vulnerabilitiesByCountry = [
      { name: 'États-Unis', count: 245, position: { x: 25, y: 35 } },
      { name: 'Chine', count: 187, position: { x: 75, y: 40 } },
      { name: 'Russie', count: 156, position: { x: 65, y: 25 } },
      { name: 'Allemagne', count: 98, position: { x: 48, y: 30 } },
      { name: 'Royaume-Uni', count: 87, position: { x: 45, y: 28 } },
      { name: 'France', count: 76, position: { x: 47, y: 32 } },
      { name: 'Inde', count: 65, position: { x: 68, y: 45 } },
      { name: 'Brésil', count: 54, position: { x: 35, y: 60 } },
      { name: 'Japon', count: 43, position: { x: 82, y: 38 } },
      { name: 'Canada', count: 32, position: { x: 22, y: 28 } },
      { name: 'Australie', count: 28, position: { x: 85, y: 70 } },
      { name: 'Corée du Sud', count: 25, position: { x: 80, y: 40 } }
    ];

    // 10. État des bots
    this.botStatus = [
      {
        name: 'CVE Collector',
        type: 'Collector',
        activity: 92,
        status: 'active',
        lastRun: '15/05/2023 14:32'
      },
      {
        name: 'OSINT Crawler',
        type: 'Crawler',
        activity: 85,
        status: 'active',
        lastRun: '15/05/2023 13:45'
      },
      {
        name: 'Threat Analyzer',
        type: 'Analyzer',
        activity: 78,
        status: 'active',
        lastRun: '15/05/2023 12:15'
      },
      {
        name: 'Vulnerability Scanner',
        type: 'Scanner',
        activity: 65,
        status: 'active',
        lastRun: '15/05/2023 10:30'
      },
      {
        name: 'Exploit Detector',
        type: 'Analyzer',
        activity: 45,
        status: 'warning',
        lastRun: '14/05/2023 23:45'
      },
      {
        name: 'Patch Verifier',
        type: 'Scanner',
        activity: 0,
        status: 'inactive',
        lastRun: '13/05/2023 08:15'
      }
    ];
  }
}