import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { VisualizationService } from '../../shared/services/visualization.service';
import { FilterOptions } from '../../shared/components/visualization-filter/visualization-filter.component';
// Import interfaces for widget suggestions
export interface WidgetSuggestion {
  id: string;
  title: string;
  type: string;
  confidence: number;
  reason: string;
}
import { Subscription } from 'rxjs';

// VI Components
import { TopVulnerabilitiesComponent } from '../../vi/components/top-vulnerabilities/top-vulnerabilities.component';
import { SeverityDistributionComponent } from '../../vi/components/severity-distribution/severity-distribution.component';
import { MonthlyTrendsComponent } from '../../vi/components/monthly-trends/monthly-trends.component';

// CTI Components
import { ThreatMapComponent } from './../../cti/components/threat-map/threat-map.component';
import { MitreHeatmapComponent } from './../../cti/components/mitre-heatmap/mitre-heatmap.component';
import { ThreatEvolutionComponent } from './../../cti/components/threat-evolution/threat-evolution.component';
// These components will be implemented later
// import { EventTimelineComponent } from '../../cti/components/event-timeline/event-timeline.component';
// import { OsintTreemapComponent } from '../../cti/components/osint-treemap/osint-treemap.component';

// ASM Components
import { AttackSurfaceComponent } from '../../asm/components/attack-surface/attack-surface.component';
import { ExternalRisksComponent } from '../../asm/components/external-risks/external-risks.component';
import { RiskScoreComponent } from '../../asm/components/risk-score/risk-score.component';

// SOAR Components
import { IncidentTimelineComponent } from '../../soar/components/incident-timeline/incident-timeline.component';
import { ResolutionRateComponent } from '../../soar/components/resolution-rate/resolution-rate.component';
import { ActivePlaybooksComponent } from '../../soar/components/active-playbooks/active-playbooks.component';
// This component will be implemented later
// import { SoarWorkflowComponent } from '../../soar/components/soar-workflow/soar-workflow.component';

import { VisualizationSelectionService } from '../../shared/services/visualization-selection.service';

@Component({
  selector: 'app-visualization-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,

    // VI Components
    TopVulnerabilitiesComponent,
    SeverityDistributionComponent,
    MonthlyTrendsComponent,

    // CTI Components
    ThreatMapComponent,
    MitreHeatmapComponent,
    ThreatEvolutionComponent,
    // EventTimelineComponent, // Will be implemented later
    // OsintTreemapComponent, // Will be implemented later

    // ASM Components
    AttackSurfaceComponent,
    ExternalRisksComponent,
    RiskScoreComponent,

    // SOAR Components
    IncidentTimelineComponent,
    ResolutionRateComponent,
    ActivePlaybooksComponent
    // SoarWorkflowComponent // Will be implemented later
  ],
  templateUrl: 'visualization-dashboard.component.html',
  styleUrls: ['./visualization-dashboard.component.scss']
})
export class VisualizationDashboardComponent implements OnInit, OnDestroy {
  // Widget suggestions
  widgetSuggestions: WidgetSuggestion[] = [];

  getSelectedTabIndex(): number {
    switch (this.selectedTab) {
      case 'Vulnérabilités':
        return 0;
      case 'Menaces':
        return 1;
      case "Surface d'Attaque":
        return 2;
      case 'SOAR':
        return 3;
      default:
        return 0;
    }
  }

  // Subscriptions
  private subscriptions: Subscription[] = [];
  // Time range options
  timeRanges = [
    { id: '7d', label: '7 jours' },
    { id: '30d', label: '30 jours' },
    { id: '6m', label: '6 mois' },
    { id: '1y', label: '1 an' }
  ];

  // Selected time range
  selectedTimeRange = '7d';

  // Selected severities
  selectedSeverities: string[] = [];

  // Search term
  searchTerm: string = '';

  selectedTab: string = 'Vulnérabilités';

  constructor(
    private visualizationService: VisualizationService,
    private visualizationSelectionService: VisualizationSelectionService
  ) { }

  ngOnInit(): void {
    // Set initial time range
    this.setTimeRange(this.selectedTimeRange);

    this.subscriptions.push(
      this.visualizationSelectionService.selectedTab$.subscribe(tab => {
        this.selectedTab = tab;
      })
    );

    // Mock widget suggestions for demo
    this.widgetSuggestions = [
      {
        id: 'suggested-threat-map',
        title: 'Carte des Menaces',
        type: 'threat',
        confidence: 0.85,
        reason: 'Vous utilisez fréquemment ce widget (42 interactions)'
      },
      {
        id: 'suggested-top-vulnerabilities',
        title: 'Top 5 Vulnérabilités',
        type: 'vulnerability',
        confidence: 0.75,
        reason: 'Vous utilisez fréquemment ce widget (35 interactions)'
      }
    ];
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Set time range
  setTimeRange(rangeId: string): void {
    this.selectedTimeRange = rangeId;
    this.visualizationService.setTimeRange(rangeId);
  }

  // Refresh all visualizations
  refreshAll(): void {
    this.visualizationService.triggerRefresh();
  }

  // Check if a severity is selected
  isSeveritySelected(severity: string): boolean {
    return this.selectedSeverities.includes(severity);
  }

  // Toggle severity selection
  toggleSeverity(severity: string): void {
    if (this.isSeveritySelected(severity)) {
      this.selectedSeverities = this.selectedSeverities.filter(s => s !== severity);
    } else {
      this.selectedSeverities.push(severity);
    }
    this.applyFilters();
  }

  // Apply filters
  applyFilters(): void {
    const filters: FilterOptions = {
      severities: this.selectedSeverities,
      dateRange: {
        start: null,
        end: null
      },
      searchTerm: this.searchTerm,
      sortBy: 'value',
      sortDirection: 'desc'
    };

    // Update the visualization service with the new filters
    this.visualizationService.setFilters(filters);
  }

  // Reset filters
  resetFilters(): void {
    this.selectedSeverities = [];
    this.searchTerm = '';
    this.applyFilters();
  }

  // Get icon for suggestion based on widget type
  getSuggestionIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'vulnerability': 'security',
      'threat': 'gps_fixed',
      'asm': 'radar',
      'soar': 'autorenew',
      'vi': 'bug_report',
      'cti': 'public',
      'timeline': 'timeline',
      'treemap': 'grid_view',
      'workflow': 'account_tree'
    };

    return iconMap[type] || 'widgets';
  }
}
