import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { VisualizationService, TimeRange } from '../../../shared/services/visualization.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-threat-evolution',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatButtonToggleModule,
    NgxChartsModule
  ],
  templateUrl: './threat-evolution.component.html',
  styleUrls: ['./threat-evolution.component.scss']
})
export class ThreatEvolutionComponent implements OnInit, OnDestroy {
  // Chart data
  chartData: any[] = [];

  // Chart options
  view: [number, number] = [700, 300];
  showXAxis = true;
  showYAxis = true;
  gradient = true;
  showLegend = true;
  showXAxisLabel = true;
  showYAxisLabel = true;
  xAxisLabel = 'Date';
  yAxisLabel = 'Menaces';
  timeline = false;

  // Color scheme
  colorScheme: any = {
    domain: [
      '#ff4757', // Malware
      '#ffa502', // Phishing
      '#00f3ff', // DDoS
      '#bc13fe'  // Ransomware
    ],
    name: 'Threat Colors',
    selectable: true,
    group: ScaleType.Ordinal
  };

  // Time ranges
  timeRanges: TimeRange[] = [];
  selectedTimeRange: TimeRange | null = null;

  // Threat categories
  categories = [
    { id: 'malware', name: 'Malware', enabled: true },
    { id: 'phishing', name: 'Phishing', enabled: true },
    { id: 'ddos', name: 'DDoS', enabled: true },
    { id: 'ransomware', name: 'Ransomware', enabled: true }
  ];

  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor(private visualizationService: VisualizationService) {
    this.timeRanges = this.visualizationService.getTimeRanges();
    this.selectedTimeRange = this.timeRanges[0];
  }

  ngOnInit(): void {
    // Load initial data
    this.loadData();

    // Subscribe to time range changes
    this.subscriptions.push(
      this.visualizationService.selectedTimeRange$.subscribe(range => {
        this.selectedTimeRange = range;
        this.loadData();
      })
    );

    // Subscribe to refresh trigger
    this.subscriptions.push(
      this.visualizationService.refreshTrigger$.subscribe(trigger => {
        if (trigger) {
          this.loadData();
        }
      })
    );
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Load threat data
  loadData(): void {
    // In a real application, this would fetch data from an API
    // For demo purposes, we'll use generated data
    const days = this.selectedTimeRange ? this.selectedTimeRange.days : 30;
    const enabledCategories = this.categories
      .filter(cat => cat.enabled)
      .map(cat => cat.name);

    this.chartData = this.visualizationService.generateTimeSeriesData(
      days,
      enabledCategories
    );
  }

  // Set time range
  setTimeRange(rangeId: string): void {
    this.visualizationService.setTimeRange(rangeId);
  }

  // Toggle category visibility
  toggleCategory(category: any): void {
    category.enabled = !category.enabled;
    this.loadData();
  }

  // Refresh data
  refreshData(): void {
    this.loadData();
  }

  // Format dates on x-axis
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit'
    });
  }

  // Get category color
  getCategoryColor(categoryId: string): string {
    switch (categoryId) {
      case 'malware':
        return '#ff4757';
      case 'phishing':
        return '#ffa502';
      case 'ddos':
        return '#00f3ff';
      case 'ransomware':
        return '#bc13fe';
      default:
        return '#ffffff';
    }
  }
}
