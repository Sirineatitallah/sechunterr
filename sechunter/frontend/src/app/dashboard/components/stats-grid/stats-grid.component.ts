// src/app/dashboard/components/stats-grid/stats-grid.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SecurityMetric {
  label: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
}

@Component({
  selector: 'app-stats-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-grid">
      <div *ngFor="let metric of metrics" class="metric-card">
        <div class="metric-value">{{metric.value}}</div>
        <div class="metric-label">{{metric.label}}</div>
        <div class="metric-trend" [ngClass]="metric.trend">
          <span class="trend-icon">
            <i *ngIf="metric.trend === 'up'" class="trend-up"></i>
            <i *ngIf="metric.trend === 'down'" class="trend-down"></i>
          </span>
          <span class="trend-value">{{metric.trendValue}}</span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./stats-grid.component.scss']
})
export class StatsGridComponent {
  @Input() metrics: SecurityMetric[] = [];
}