import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevenueBarChartComponent } from '../revenue-bar-chart/revenue-bar-chart.component';
import { SatisfactionLineChartComponent } from '../satisfaction-line-chart/satisfaction-line-chart.component';
import { CountryMapComponent } from '../country-map/country-map.component';
import { TargetRealityChartComponent } from '../target-reality-chart/target-reality-chart.component';
import { TopProductsChartComponent } from '../top-products-chart/top-products-chart.component';
import { VolumeServiceChartComponent } from '../volume-service-chart/volume-service-chart.component';

type ChartType = 'revenue' | 'satisfaction' | 'target' | 'volume' | 'geography' | 'products' | null;
type SecuritySeverity = 'critical' | 'warning' | 'info' | 'success';

interface SecurityChartInfo {
  id: ChartType;
  title: string;
  description: string;
  securityTitle: string;
  securityDescription: string;
  severity: SecuritySeverity;
  status: string;
  icon: string;
}

@Component({
  selector: 'app-charts-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RevenueBarChartComponent,
    SatisfactionLineChartComponent,
    CountryMapComponent,
    TargetRealityChartComponent,
    TopProductsChartComponent,
    VolumeServiceChartComponent
  ],
  templateUrl: './charts-dashboard.component.html',
  styleUrl: './charts-dashboard.component.css'
})
export class ChartsDashboardComponent implements OnInit {
  isLoading = false;
  error: string | null = null;
  selectedChart: ChartType = null;
  securityScore = 94;
  activeThreats = 3;
  monitoredAssets = 128;
  resolvedIssues = 27;

  // Security-focused chart information
  chartInfo: Record<string, SecurityChartInfo> = {
    'revenue': {
      id: 'revenue',
      title: 'Revenue Analysis',
      description: 'Monthly revenue breakdown by product category',
      securityTitle: 'Vulnerability Trends',
      securityDescription: 'Monthly vulnerability distribution by severity',
      severity: 'warning',
      status: 'Critical',
      icon: 'security'
    },
    'satisfaction': {
      id: 'satisfaction',
      title: 'Satisfaction Trends',
      description: 'Customer satisfaction metrics over time',
      securityTitle: 'Security Posture',
      securityDescription: 'Security rating trends over time',
      severity: 'success',
      status: 'Stable',
      icon: 'verified_user'
    },
    'target': {
      id: 'target',
      title: 'Target vs Reality',
      description: 'Comparison of targets and actual performance',
      securityTitle: 'Compliance Status',
      securityDescription: 'Compliance targets vs. current state',
      severity: 'info',
      status: 'Monitoring',
      icon: 'gpp_maybe'
    },
    'volume': {
      id: 'volume',
      title: 'Service Volume',
      description: 'Distribution of service usage across departments',
      securityTitle: 'Incident Distribution',
      securityDescription: 'Security incidents by category and severity',
      severity: 'info',
      status: 'Active',
      icon: 'admin_panel_settings'
    },
    'geography': {
      id: 'geography',
      title: 'Geographic Distribution',
      description: 'User distribution by country and region',
      securityTitle: 'Threat Intelligence Map',
      securityDescription: 'Global threat activity in real-time',
      severity: 'critical',
      status: 'Active Threats',
      icon: 'public'
    },
    'products': {
      id: 'products',
      title: 'Top Products',
      description: 'Best performing products by revenue and growth',
      securityTitle: 'Critical Vulnerabilities',
      securityDescription: 'Top vulnerabilities by risk score',
      severity: 'warning',
      status: 'High Priority',
      icon: 'bug_report'
    }
  };

  constructor() { }

  @HostListener('document:keydown.escape')
  handleEscapeKey() {
    this.closeModal();
  }

  @HostListener('document:keydown.tab', ['$event'])
  handleTabKey(event: KeyboardEvent) {
    // Improve keyboard navigation
    if (this.selectedChart) {
      // Keep focus within modal when it's open
      const modal = document.querySelector('.modal-content');
      if (modal) {
        const focusableElements = modal.querySelectorAll('button, [tabindex="0"]');
        if (focusableElements.length > 0) {
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (event.shiftKey && document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          } else if (!event.shiftKey && document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    }
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * Load security dashboard data
   */
  loadDashboardData(): void {
    this.isLoading = true;
    this.error = null;

    // Simulate security API call with timeout
    setTimeout(() => {
      try {
        // Simulate successful security data loading
        this.isLoading = false;
        console.log('Security dashboard data loaded successfully');

        // Simulate random security metrics
        this.securityScore = Math.floor(Math.random() * 15) + 85; // 85-99
        this.activeThreats = Math.floor(Math.random() * 5) + 1; // 1-5
        this.monitoredAssets = Math.floor(Math.random() * 50) + 100; // 100-149
        this.resolvedIssues = Math.floor(Math.random() * 20) + 20; // 20-39
      } catch (err) {
        this.error = 'Security scan failed. Unable to retrieve security metrics.';
        this.isLoading = false;
        console.error('Error loading security dashboard data:', err);
      }
    }, 2000); // Longer loading time for security scan effect
  }

  /**
   * Refresh security data
   */
  refreshData(): void {
    console.log('Initiating security scan...');
    this.loadDashboardData();
  }

  /**
   * Handle security chart click
   */
  onChartClick(chartType: ChartType): void {
    console.log(`Security chart clicked: ${chartType}`);
    this.selectedChart = chartType;

    // Set focus to close button for accessibility
    setTimeout(() => {
      const closeButton = document.querySelector('.close-button') as HTMLElement;
      if (closeButton) {
        closeButton.focus();
      }
    }, 100);
  }

  /**
   * Close the security modal
   */
  closeModal(): void {
    this.selectedChart = null;
  }

  /**
   * Get the title for the selected security chart
   */
  getChartTitle(): string {
    return this.selectedChart ? this.chartInfo[this.selectedChart].securityTitle : '';
  }

  /**
   * Get the severity class for the selected chart
   */
  getChartSeverity(): string {
    return this.selectedChart ? this.chartInfo[this.selectedChart].severity : 'info';
  }

  /**
   * Get the status text for the selected chart
   */
  getChartStatus(): string {
    return this.selectedChart ? this.chartInfo[this.selectedChart].status : '';
  }

  /**
   * Get the icon for the selected chart
   */
  getChartIcon(): string {
    return this.selectedChart ? this.chartInfo[this.selectedChart].icon : 'security';
  }

  /**
   * Handle keyboard events for security chart items
   */
  onChartKeyDown(event: KeyboardEvent, chartType: ChartType): void {
    // Handle Enter or Space key to activate chart
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onChartClick(chartType);
    }
  }

  /**
   * Export security report data
   */
  exportSecurityReport(): void {
    console.log('Exporting security report...');
    // Implementation would go here
  }

  /**
   * Share security report
   */
  shareSecurityReport(): void {
    console.log('Sharing security report...');
    // Implementation would go here
  }

  /**
   * Run dedicated security scan
   */
  runSecurityScan(): void {
    console.log('Running dedicated security scan...');
    this.refreshData();
  }
}
