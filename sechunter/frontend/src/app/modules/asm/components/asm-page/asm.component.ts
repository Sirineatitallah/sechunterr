import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { GlobalDataService, SecurityAsset } from '../../../../core/services/global-data.service';

// Import ASM visualization components
import { AttackSurfaceComponent } from '../../../../asm/components/attack-surface/attack-surface.component';
import { RiskScoreComponent } from '../../../../asm/components/risk-score/risk-score.component';
import { ExternalRisksComponent } from '../../../../asm/components/external-risks/external-risks.component';

// Interfaces
interface TimeRange {
  id: string;
  label: string;
}

interface AssetSummary {
  totalAssets: number;
  criticalAssets: number;
  shadowIT: number;
  securedAssets: number;
  trend: number;
}

interface Discovery {
  id: string;
  title: string;
  type: string;
  riskLevel: string;
  timestamp: Date;
}

interface AssetCategory {
  id: string;
  name: string;
  count: number;
  color: string;
}

interface ExposureMetric {
  value: number;
  trend: number;
  history: number[];
}

interface ExposureMetrics {
  openPorts: ExposureMetric;
  exposedServices: ExposureMetric;
  unsecuredDomains: ExposureMetric;
  expiredCertificates: ExposureMetric;
}

@Component({
  selector: 'app-asm',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    RouterModule,
    DatePipe,
    AttackSurfaceComponent,
    RiskScoreComponent,
    ExternalRisksComponent
  ],
  templateUrl: './asm.component.html',
  styleUrl: './asm.component.scss'
})
export class AsmComponent implements OnInit {
  // Time ranges
  timeRanges: TimeRange[] = [
    { id: '7d', label: '7 jours' },
    { id: '30d', label: '30 jours' },
    { id: '6m', label: '6 mois' },
    { id: '1y', label: '1 an' }
  ];
  selectedTimeRange: string = '7d';

  // Asset summary
  assetSummary: AssetSummary = {
    totalAssets: 0,
    criticalAssets: 0,
    shadowIT: 0,
    securedAssets: 0,
    trend: 0
  };

  // Recent discoveries
  recentDiscoveries: Discovery[] = [];

  // Asset categories
  assetCategories: AssetCategory[] = [];

  // Exposure metrics
  exposureMetrics: ExposureMetrics = {
    openPorts: { value: 0, trend: 0, history: [] },
    exposedServices: { value: 0, trend: 0, history: [] },
    unsecuredDomains: { value: 0, trend: 0, history: [] },
    expiredCertificates: { value: 0, trend: 0, history: [] }
  };

  constructor(private globalDataService: GlobalDataService) { }

  ngOnInit(): void {
    // Subscribe to global data service for assets
    this.globalDataService.assets$.subscribe(assets => {
      // Update asset categories based on asset types
      this.updateAssetCategories(assets);

      // Update asset summary
      this.updateAssetSummary(assets);
    });

    // Initialize other mock data
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
    // Refresh global data
    this.globalDataService.refreshAllData();

    // Refresh local data
    console.log('Refreshing all data for time range:', this.selectedTimeRange);
    this.initMockData(); // For demo, just reinitialize mock data for non-global data
  }

  // Update asset categories based on assets
  private updateAssetCategories(assets: SecurityAsset[]): void {
    // Count assets by type
    const typeCounts: { [key: string]: number } = {};
    const typeColors: { [key: string]: string } = {
      'server': '#4a90e2',
      'application': '#50e3c2',
      'endpoint': '#f5a623',
      'cloud': '#9013fe',
      'network': '#b8e986'
    };

    assets.forEach(asset => {
      typeCounts[asset.type] = (typeCounts[asset.type] || 0) + 1;
    });

    // Convert to asset categories
    this.assetCategories = Object.keys(typeCounts).map((type, index) => ({
      id: `c${index + 1}`,
      name: type.charAt(0).toUpperCase() + type.slice(1) + 's',
      count: typeCounts[type],
      color: typeColors[type] || `hsl(${index * 60}, 70%, 60%)`
    }));
  }

  // Update asset summary based on assets
  private updateAssetSummary(assets: SecurityAsset[]): void {
    const totalAssets = assets.length;
    const criticalAssets = assets.filter(a => a.status === 'vulnerable').length;
    const securedAssets = assets.filter(a => a.status === 'secure').length;
    const shadowIT = assets.filter(a => a.status === 'at-risk').length;

    this.assetSummary = {
      totalAssets,
      criticalAssets,
      shadowIT,
      securedAssets,
      trend: 5.2 // Mock trend for demo
    };
  }

  // Get icon for discovery type
  getDiscoveryIcon(discoveryType: string): string {
    const iconMap: { [key: string]: string } = {
      'domain': 'language',
      'server': 'dns',
      'application': 'apps',
      'cloud': 'cloud',
      'network': 'router',
      'default': 'devices'
    };

    return iconMap[discoveryType.toLowerCase()] || iconMap['default'];
  }

  // Get total asset count
  getTotalAssetCount(): number {
    return this.assetCategories.reduce((total, category) => total + category.count, 0);
  }

  // Get segment rotation for donut chart
  getSegmentRotation(index: number): number {
    if (index === 0) return 0;

    let totalAngle = 0;
    const total = this.getTotalAssetCount();

    for (let i = 0; i < index; i++) {
      totalAngle += (this.assetCategories[i].count / total) * 360;
    }

    return totalAngle;
  }

  // Get segment path for donut chart
  getSegmentPath(index: number): string {
    const total = this.getTotalAssetCount();
    const percentage = this.assetCategories[index].count / total;
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

  // Get max value from history array for bar charts
  getMaxHistoryValue(history: number[]): number {
    return Math.max(...history, 1); // Ensure we don't divide by zero
  }

  // Initialize mock data for demo
  private initMockData(): void {
    // We no longer need to mock asset summary and categories as they come from the global service

    // Mock recent discoveries
    this.recentDiscoveries = [
      {
        id: 'd1',
        title: 'Nouveau serveur non autorisé détecté',
        type: 'server',
        riskLevel: 'high',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60000) // 2 days ago
      },
      {
        id: 'd2',
        title: 'Domaine expiré exposé',
        type: 'domain',
        riskLevel: 'critical',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60000) // 3 days ago
      },
      {
        id: 'd3',
        title: 'Application cloud non sécurisée',
        type: 'cloud',
        riskLevel: 'medium',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60000) // 4 days ago
      },
      {
        id: 'd4',
        title: 'Ports ouverts sur serveur de production',
        type: 'network',
        riskLevel: 'high',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60000) // 5 days ago
      },
      {
        id: 'd5',
        title: 'Application avec informations d\'identification exposées',
        type: 'application',
        riskLevel: 'critical',
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60000) // 6 days ago
      }
    ];

    // Mock exposure metrics
    this.exposureMetrics = {
      openPorts: {
        value: 342,
        trend: 12,
        history: [280, 310, 290, 320, 330, 342]
      },
      exposedServices: {
        value: 156,
        trend: -8,
        history: [180, 175, 168, 162, 159, 156]
      },
      unsecuredDomains: {
        value: 23,
        trend: -15,
        history: [45, 38, 32, 28, 25, 23]
      },
      expiredCertificates: {
        value: 7,
        trend: -30,
        history: [18, 15, 12, 10, 8, 7]
      }
    };
  }
}
