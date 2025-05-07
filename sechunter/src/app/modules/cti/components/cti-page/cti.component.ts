import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

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
  recentThreats: Threat[] = [];

  // Top vulnerabilities
  topVulnerabilities: Vulnerability[] = [];

  // Threat actors
  threatActors: ThreatActor[] = [];

  // IOC stats
  iocStats: IocStats = {
    ipAddresses: 0,
    domains: 0,
    hashes: 0,
    urls: 0
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
    // Mock recent threats
    this.recentThreats = [
      {
        id: 't1',
        title: 'Campagne de phishing ciblant le secteur financier',
        type: 'phishing',
        severity: 'high',
        source: 'OSINT',
        timestamp: new Date(2023, 4, 15, 9, 30)
      },
      {
        id: 't2',
        title: 'Nouvelle variante de ransomware détectée',
        type: 'ransomware',
        severity: 'critical',
        source: 'Darkweb',
        timestamp: new Date(2023, 4, 14, 14, 45)
      },
      {
        id: 't3',
        title: 'Attaque DDoS contre infrastructure cloud',
        type: 'ddos',
        severity: 'medium',
        source: 'Partenaire',
        timestamp: new Date(2023, 4, 13, 11, 20)
      },
      {
        id: 't4',
        title: 'Malware ciblant les systèmes industriels',
        type: 'malware',
        severity: 'high',
        source: 'Analyse interne',
        timestamp: new Date(2023, 4, 12, 16, 10)
      },
      {
        id: 't5',
        title: 'Activité APT détectée dans le secteur énergétique',
        type: 'apt',
        severity: 'critical',
        source: 'Renseignement',
        timestamp: new Date(2023, 4, 11, 8, 15)
      }
    ];

    // Mock top vulnerabilities
    this.topVulnerabilities = [
      {
        id: 'v1',
        title: 'Exécution de code à distance dans Microsoft Exchange',
        cve: 'CVE-2023-23397',
        cvss: 9.8,
        severity: 'critical'
      },
      {
        id: 'v2',
        title: 'Vulnérabilité d\'élévation de privilèges dans Linux Kernel',
        cve: 'CVE-2023-0386',
        cvss: 8.4,
        severity: 'high'
      },
      {
        id: 'v3',
        title: 'Faille de sécurité dans Apache Log4j',
        cve: 'CVE-2021-44228',
        cvss: 10.0,
        severity: 'critical'
      },
      {
        id: 'v4',
        title: 'Vulnérabilité dans OpenSSL',
        cve: 'CVE-2022-3786',
        cvss: 7.5,
        severity: 'high'
      },
      {
        id: 'v5',
        title: 'Faille dans VMware vCenter Server',
        cve: 'CVE-2023-20887',
        cvss: 9.1,
        severity: 'critical'
      }
    ];

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
