import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { GlobalDataService, SecurityThreat, SecurityVulnerability } from '../../../../core/services/global-data.service';

// Import CTI visualization components
import { ThreatMapComponent } from '../../../../cti/components/threat-map/threat-map.component';
import { MitreHeatmapComponent } from '../../../../cti/components/mitre-heatmap/mitre-heatmap.component';
import { ThreatEvolutionComponent } from '../../../../cti/components/threat-evolution/threat-evolution.component';

// Interfaces
interface TimeRange {
  id: string;
  label: string;
}

interface Threat {
  id: string;
  title: string;
  type: string;
  severity: string;
  source: string;
  timestamp: Date;
}

interface Vulnerability {
  id: string;
  title: string;
  cve: string;
  cvss: number;
  severity: string;
}

interface ThreatActor {
  id: string;
  name: string;
  type: string;
  activityLevel: string;
  confidence: number;
  color: string;
}

interface IocStats {
  ipAddresses: number;
  domains: number;
  hashes: number;
  urls: number;
}

@Component({
  selector: 'app-cti',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    RouterModule,
    DatePipe,
    ThreatMapComponent,
    MitreHeatmapComponent,
    ThreatEvolutionComponent
  ],
  templateUrl: './cti.component.html',
  styleUrl: './cti.component.scss'
})
export class CtiComponent implements OnInit {
  // Time ranges
  timeRanges: TimeRange[] = [
    { id: '7d', label: '7 jours' },
    { id: '30d', label: '30 jours' },
    { id: '6m', label: '6 mois' },
    { id: '1y', label: '1 an' }
  ];
  selectedTimeRange: string = '7d';

  // Recent threats
  recentThreats: SecurityThreat[] = [];

  // Top vulnerabilities
  topVulnerabilities: SecurityVulnerability[] = [];

  // Threat actors
  threatActors: ThreatActor[] = [];

  // IOC stats
  iocStats: IocStats = {
    ipAddresses: 0,
    domains: 0,
    hashes: 0,
    urls: 0
  };

  constructor(private globalDataService: GlobalDataService) { }

  ngOnInit(): void {
    // Subscribe to global data service
    this.globalDataService.threats$.subscribe(threats => {
      this.recentThreats = threats;
    });

    this.globalDataService.vulnerabilities$.subscribe(vulnerabilities => {
      this.topVulnerabilities = vulnerabilities;
    });

    // Initialize other data
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

  // Get icon for threat type
  getThreatIcon(threatType: string): string {
    const iconMap: { [key: string]: string } = {
      'malware': 'bug_report',
      'phishing': 'email',
      'ransomware': 'lock',
      'ddos': 'wifi_tethering_off',
      'apt': 'security',
      'default': 'warning'
    };

    return iconMap[threatType.toLowerCase()] || iconMap['default'];
  }

  // Initialize mock data for demo
  private initMockData(): void {
    // We no longer need to mock threats and vulnerabilities as they come from the global service
    // Only initialize data that's specific to this component

    // Mock threat actors
    this.threatActors = [
      {
        id: 'a1',
        name: 'APT29',
        type: 'Nation-state',
        activityLevel: 'Haute',
        confidence: 85,
        color: '#e74c3c'
      },
      {
        id: 'a2',
        name: 'Lazarus Group',
        type: 'Nation-state',
        activityLevel: 'Moyenne',
        confidence: 90,
        color: '#3498db'
      },
      {
        id: 'a3',
        name: 'FIN7',
        type: 'Cybercriminel',
        activityLevel: 'Haute',
        confidence: 75,
        color: '#2ecc71'
      },
      {
        id: 'a4',
        name: 'Sandworm',
        type: 'Nation-state',
        activityLevel: 'Haute',
        confidence: 80,
        color: '#f39c12'
      }
    ];

    // Mock IOC stats
    this.iocStats = {
      ipAddresses: 1247,
      domains: 863,
      hashes: 2156,
      urls: 1589
    };
  }
}
