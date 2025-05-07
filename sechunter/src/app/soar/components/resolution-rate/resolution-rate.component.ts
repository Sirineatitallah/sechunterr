import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgxChartsModule, LegendPosition } from '@swimlane/ngx-charts';
import { VisualizationService } from '../../../shared/services/visualization.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-resolution-rate',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    NgxChartsModule
  ],
  templateUrl: './resolution-rate.component.html',
  styleUrls: ['./resolution-rate.component.scss']
})
export class ResolutionRateComponent implements OnInit, OnDestroy {
  // Chart data
  chartData: any[] = [];

  // Chart options
  view: [number, number] = [500, 300];
  gradient = true;
  showLegend = false;
  showLabels = true;
  isDoughnut = true;
  legendPosition: LegendPosition = LegendPosition.Below;

  // Color scheme
  colorScheme: any;

  // Resolution stats
  totalIncidents = 0;
  resolvedIncidents = 0;
  inProgressIncidents = 0;
  failedIncidents = 0;

  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor(private visualizationService: VisualizationService) {
    this.colorScheme = {
      domain: [
        '#2ed573', // Resolved
        '#ffa502', // In Progress
        '#ff4757'  // Failed
      ]
    };
  }

  ngOnInit(): void {
    // Load initial data
    this.loadData();

    // Subscribe to time range changes
    this.subscriptions.push(
      this.visualizationService.selectedTimeRange$.subscribe(() => {
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

  // Load resolution data
  loadData(): void {
    // In a real application, this would fetch data from an API
    // For demo purposes, we'll use mock data
    this.resolvedIncidents = 85;
    this.inProgressIncidents = 10;
    this.failedIncidents = 5;
    this.totalIncidents = this.resolvedIncidents + this.inProgressIncidents + this.failedIncidents;

    this.chartData = [
      { name: 'Résolus', value: this.resolvedIncidents },
      { name: 'En Cours', value: this.inProgressIncidents },
      { name: 'Échecs', value: this.failedIncidents }
    ];
  }

  // Refresh data
  refreshData(): void {
    this.loadData();
  }

  // Format labels
  formatLabel(data: any): string {
    return `${data.label}: ${data.value}%`;
  }

  // Get percentage for a category
  getPercentage(category: string): number {
    const item = this.chartData.find(d => d.name === category);
    return item ? Math.round((item.value / this.totalIncidents) * 100) : 0;
  }

  // Get count for a category
  getCount(category: string): number {
    const item = this.chartData.find(d => d.name === category);
    return item ? item.value : 0;
  }

  // Get average resolution time
  getAverageResolutionTime(): string {
    // In a real application, this would be calculated from actual data
    return '2h 15m';
  }

  // Get success rate trend
  getSuccessRateTrend(): string {
    // In a real application, this would be calculated from actual data
    return '+5%';
  }

  // Get trend class
  getTrendClass(trend: string): string {
    return trend.startsWith('+') ? 'positive' : 'negative';
  }
}
