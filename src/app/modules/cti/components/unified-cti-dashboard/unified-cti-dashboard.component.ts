import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';

import { ThreatMapComponent } from '../threat-map/threat-map.component';
import { MitreHeatmapComponent } from '../mitre-heatmap/mitre-heatmap.component';
import { ThreatEvolutionComponent } from '../threat-evolution/threat-evolution.component';
import { MicroserviceConnectorService, MicroserviceType } from '../../../../core/services/microservice-connector.service';

interface ThreatIntelligence {
  id: string;
  name: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  source: string;
  timestamp: Date;
  description: string;
  iocs?: IOC[];
  ttps?: string[];
  affectedSystems?: string[];
  status: 'new' | 'investigating' | 'confirmed' | 'mitigated' | 'resolved';
}

interface IOC {
  type: 'ip' | 'domain' | 'url' | 'file_hash' | 'email';
  value: string;
  confidence: number; // 0-100
}

interface ThreatStats {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  newLast24h: number;
  mitigatedLast7d: number;
}

interface ThreatSource {
  name: string;
  count: number;
  percentage: number;
}

@Component({
  selector: 'app-unified-cti-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    ThreatMapComponent,
    MitreHeatmapComponent,
    ThreatEvolutionComponent
  ],
  templateUrl: './unified-cti-dashboard.component.html',
  styleUrls: ['./unified-cti-dashboard.component.scss']
})
export class UnifiedCtiDashboardComponent implements OnInit, OnDestroy {
  // Data
  threats: ThreatIntelligence[] = [];
  filteredThreats: ThreatIntelligence[] = [];
  threatStats: ThreatStats = {
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    newLast24h: 0,
    mitigatedLast7d: 0
  };
  threatSources: ThreatSource[] = [];
  
  // Filters
  severityFilter: string = 'all';
  typeFilter: string = 'all';
  sourceFilter: string = 'all';
  statusFilter: string = 'all';
  searchTerm: string = '';
  
  // UI state
  isLoading: boolean = true;
  selectedThreat: ThreatIntelligence | null = null;
  
  // Subscriptions
  private subscriptions: Subscription[] = [];
  
  constructor(private microserviceConnector: MicroserviceConnectorService) {}
  
  ngOnInit(): void {
    this.loadThreatData();
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  loadThreatData(): void {
    this.isLoading = true;
    
    this.subscriptions.push(
      this.microserviceConnector.getRealTimeServiceData<any>(MicroserviceType.THREAT_INTEL)
        .subscribe(data => {
          // In a real application, this would be properly typed data from the API
          // For now, we'll use mock data
          this.threats = this.generateMockThreats();
          this.applyFilters();
          this.calculateStats();
          this.calculateSources();
          this.isLoading = false;
        })
    );
  }
  
  applyFilters(): void {
    this.filteredThreats = this.threats.filter(threat => {
      // Apply severity filter
      if (this.severityFilter !== 'all' && threat.severity !== this.severityFilter) {
        return false;
      }
      
      // Apply type filter
      if (this.typeFilter !== 'all' && threat.type !== this.typeFilter) {
        return false;
      }
      
      // Apply source filter
      if (this.sourceFilter !== 'all' && threat.source !== this.sourceFilter) {
        return false;
      }
      
      // Apply status filter
      if (this.statusFilter !== 'all' && threat.status !== this.statusFilter) {
        return false;
      }
      
      // Apply search term
      if (this.searchTerm && !this.matchesSearchTerm(threat, this.searchTerm)) {
        return false;
      }
      
      return true;
    });
  }
  
  calculateStats(): void {
    this.threatStats = {
      total: this.threats.length,
      critical: this.threats.filter(t => t.severity === 'critical').length,
      high: this.threats.filter(t => t.severity === 'high').length,
      medium: this.threats.filter(t => t.severity === 'medium').length,
      low: this.threats.filter(t => t.severity === 'low').length,
      newLast24h: this.threats.filter(t => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return t.timestamp > yesterday;
      }).length,
      mitigatedLast7d: this.threats.filter(t => {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        return t.status === 'mitigated' && t.timestamp > lastWeek;
      }).length
    };
  }
  
  calculateSources(): void {
    const sourceCounts: { [key: string]: number } = {};
    
    // Count occurrences of each source
    this.threats.forEach(threat => {
      if (!sourceCounts[threat.source]) {
        sourceCounts[threat.source] = 0;
      }
      sourceCounts[threat.source]++;
    });
    
    // Convert to array and calculate percentages
    this.threatSources = Object.keys(sourceCounts).map(source => ({
      name: source,
      count: sourceCounts[source],
      percentage: (sourceCounts[source] / this.threats.length) * 100
    })).sort((a, b) => b.count - a.count);
  }
  
  setSeverityFilter(severity: string): void {
    this.severityFilter = severity;
    this.applyFilters();
  }
  
  setTypeFilter(type: string): void {
    this.typeFilter = type;
    this.applyFilters();
  }
  
  setSourceFilter(source: string): void {
    this.sourceFilter = source;
    this.applyFilters();
  }
  
  setStatusFilter(status: string): void {
    this.statusFilter = status;
    this.applyFilters();
  }
  
  setSearchTerm(term: string): void {
    this.searchTerm = term;
    this.applyFilters();
  }
  
  selectThreat(threat: ThreatIntelligence): void {
    this.selectedThreat = threat;
  }
  
  clearSelection(): void {
    this.selectedThreat = null;
  }
  
  refreshData(): void {
    this.loadThreatData();
  }
  
  private matchesSearchTerm(threat: ThreatIntelligence, term: string): boolean {
    const lowerTerm = term.toLowerCase();
    
    // Check if term matches any of the threat's text fields
    return (
      threat.name.toLowerCase().includes(lowerTerm) ||
      threat.description.toLowerCase().includes(lowerTerm) ||
      threat.source.toLowerCase().includes(lowerTerm) ||
      threat.type.toLowerCase().includes(lowerTerm) ||
      (threat.iocs && threat.iocs.some(ioc => ioc.value.toLowerCase().includes(lowerTerm))) ||
      (threat.ttps && threat.ttps.some(ttp => ttp.toLowerCase().includes(lowerTerm))) ||
      (threat.affectedSystems && threat.affectedSystems.some(system => system.toLowerCase().includes(lowerTerm)))
    );
  }
  
  private generateMockThreats(): ThreatIntelligence[] {
    // This would be replaced by actual API data in a real application
    const mockThreats: ThreatIntelligence[] = [];
    const threatTypes = ['Malware', 'Phishing', 'Ransomware', 'APT', 'DDoS', 'Zero-day', 'Supply Chain'];
    const sources = ['OSINT', 'Dark Web', 'Threat Feed', 'Internal', 'Partner', 'CERT'];
    const statuses = ['new', 'investigating', 'confirmed', 'mitigated', 'resolved'];
    const severities = ['critical', 'high', 'medium', 'low'];
    
    // Generate 20 mock threats
    for (let i = 0; i < 20; i++) {
      const type = threatTypes[Math.floor(Math.random() * threatTypes.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)] as any;
      const source = sources[Math.floor(Math.random() * sources.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)] as any;
      
      // Generate random date in the last 30 days
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      mockThreats.push({
        id: `threat-${i + 1}`,
        name: `${type} Threat ${i + 1}`,
        type,
        severity,
        source,
        timestamp: date,
        description: `This is a ${severity} ${type.toLowerCase()} threat detected from ${source}.`,
        iocs: this.generateMockIOCs(Math.floor(Math.random() * 3) + 1),
        ttps: this.generateMockTTPs(Math.floor(Math.random() * 3) + 1),
        affectedSystems: this.generateMockSystems(Math.floor(Math.random() * 3) + 1),
        status
      });
    }
    
    return mockThreats;
  }
  
  private generateMockIOCs(count: number): IOC[] {
    const iocs: IOC[] = [];
    const types = ['ip', 'domain', 'url', 'file_hash', 'email'];
    
    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)] as any;
      let value = '';
      
      switch (type) {
        case 'ip':
          value = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
          break;
        case 'domain':
          value = `malicious-domain-${Math.floor(Math.random() * 100)}.com`;
          break;
        case 'url':
          value = `https://malicious-site-${Math.floor(Math.random() * 100)}.com/path`;
          break;
        case 'file_hash':
          value = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
          break;
        case 'email':
          value = `malicious-${Math.floor(Math.random() * 100)}@threat.com`;
          break;
      }
      
      iocs.push({
        type,
        value,
        confidence: Math.floor(Math.random() * 40) + 60 // 60-100
      });
    }
    
    return iocs;
  }
  
  private generateMockTTPs(count: number): string[] {
    const ttps: string[] = [];
    const mitreTactics = ['T1566', 'T1190', 'T1133', 'T1078', 'T1059', 'T1053', 'T1486', 'T1565'];
    
    for (let i = 0; i < count; i++) {
      ttps.push(mitreTactics[Math.floor(Math.random() * mitreTactics.length)]);
    }
    
    return ttps;
  }
  
  private generateMockSystems(count: number): string[] {
    const systems: string[] = [];
    const systemTypes = ['Web Server', 'Database', 'Email Server', 'File Server', 'Domain Controller', 'Workstation', 'Network Device'];
    
    for (let i = 0; i < count; i++) {
      systems.push(`${systemTypes[Math.floor(Math.random() * systemTypes.length)]}-${Math.floor(Math.random() * 10) + 1}`);
    }
    
    return systems;
  }
}
