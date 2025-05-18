import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { DashboardDataService, VulnerabilityDetail, SecurityDomain, ThreatAlert } from '../../services/dashboard-data.service';

@Component({
  selector: 'app-drill-down-view',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatDividerModule,
    MatChipsModule,
    MatBadgeModule
  ],
  templateUrl: './drill-down-view.component.html',
  styleUrls: ['./drill-down-view.component.scss']
})
export class DrillDownViewComponent implements OnInit {
  selectedVulnerability: VulnerabilityDetail | null = null;
  selectedDomain: SecurityDomain | null = null;
  selectedThreat: ThreatAlert | null = null;

  activeViewType: 'vulnerability' | 'domain' | 'threat' | null = null;

  constructor(private dashboardDataService: DashboardDataService) { }

  ngOnInit(): void {
    this.dashboardDataService.selectedVulnerability$.subscribe(vulnerability => {
      this.selectedVulnerability = vulnerability;
      if (vulnerability) {
        this.activeViewType = 'vulnerability';
      } else if (!this.selectedDomain && !this.selectedThreat) {
        this.activeViewType = null;
      }
    });

    this.dashboardDataService.selectedDomain$.subscribe(domain => {
      this.selectedDomain = domain;
      if (domain) {
        this.activeViewType = 'domain';
      } else if (!this.selectedVulnerability && !this.selectedThreat) {
        this.activeViewType = null;
      }
    });

    this.dashboardDataService.selectedThreat$.subscribe(threat => {
      this.selectedThreat = threat;
      if (threat) {
        this.activeViewType = 'threat';
      } else if (!this.selectedVulnerability && !this.selectedDomain) {
        this.activeViewType = null;
      }
    });
  }

  closeDrillDown(): void {
    this.dashboardDataService.closeDrillDown();
  }

  getSeverityClass(severity: string): string {
    return severity.toLowerCase();
  }

  getStatusClass(status: string): string {
    return status.replace('_', '-');
  }

  getImpactClass(impact: string): string {
    return impact.toLowerCase();
  }

  getEffortClass(effort: string): string {
    switch (effort) {
      case 'easy': return 'low';
      case 'medium': return 'medium';
      case 'complex': return 'high';
      default: return '';
    }
  }

  getDomainTrendClass(): string {
    if (!this.selectedDomain) return '';
    return this.selectedDomain.score > this.selectedDomain.previousScore ? 'positive' : 'negative';
  }

  getDomainTrendIcon(): string {
    if (!this.selectedDomain) return 'trending_flat';
    return this.selectedDomain.score > this.selectedDomain.previousScore ? 'trending_up' : 'trending_down';
  }

  getDomainTrendValue(): number {
    if (!this.selectedDomain || this.selectedDomain.previousScore === undefined) return 0;
    return this.selectedDomain.score - this.selectedDomain.previousScore;
  }

  getDomainTrendDirection(): string {
    if (!this.selectedDomain) return '';
    return this.selectedDomain.score > this.selectedDomain.previousScore ? 'Improvement' : 'Decline';
  }

  hasRelatedAlerts(): boolean {
    return !!this.selectedThreat &&
           !!this.selectedThreat.relatedAlerts &&
           this.selectedThreat.relatedAlerts.length > 0;
  }

  getRelatedAlerts(): string[] {
    if (!this.selectedThreat || !this.selectedThreat.relatedAlerts) {
      return [];
    }
    return this.selectedThreat.relatedAlerts;
  }
}
