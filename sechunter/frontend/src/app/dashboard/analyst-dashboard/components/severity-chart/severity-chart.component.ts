import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Vulnerability } from '../../models/vulnerability.model';

@Component({
  selector: 'app-severity-chart',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './severity-chart.component.html',
  styleUrls: ['./severity-chart.component.scss']
})
export class SeverityChartComponent implements OnInit, OnChanges {
  @Input() vulnerabilities: Vulnerability[] = [];
  @Input() loading = false;

  // Chart data
  chartData: { severity: string; count: number; color: string }[] = [];
  totalVulnerabilities = 0;

  // Chart dimensions
  readonly chartSize = 200;
  readonly chartThickness = 40;
  readonly centerRadius = (this.chartSize / 2) - this.chartThickness;

  // SVG paths for the donut segments
  donutSegments: { path: string; color: string; severity: string; count: number }[] = [];

  constructor() {}

  ngOnInit(): void {
    this.processChartData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['vulnerabilities']) {
      this.processChartData();
    }
  }

  private processChartData(): void {
    // Count vulnerabilities by severity
    const severityCounts: { [key: string]: number } = {
      'critical': 0,
      'high': 0,
      'medium': 0,
      'low': 0
    };

    this.vulnerabilities.forEach(vuln => {
      const severity = vuln.severity.toLowerCase();
      if (severity in severityCounts) {
        severityCounts[severity]++;
      }
    });

    // Create chart data
    this.chartData = [
      { severity: 'Critical', count: severityCounts['critical'], color: '#e74c3c' },
      { severity: 'High', count: severityCounts['high'], color: '#f39c12' },
      { severity: 'Medium', count: severityCounts['medium'], color: '#3498db' },
      { severity: 'Low', count: severityCounts['low'], color: '#2ecc71' }
    ];

    this.totalVulnerabilities = this.chartData.reduce((sum, item) => sum + item.count, 0);

    // Generate SVG paths for the donut chart
    this.generateDonutSegments();
  }

  private generateDonutSegments(): void {
    if (this.totalVulnerabilities === 0) {
      // If no vulnerabilities, show empty chart
      this.donutSegments = [];
      return;
    }

    const center = this.chartSize / 2;
    const radius = center - (this.chartThickness / 2);

    let startAngle = 0;
    this.donutSegments = this.chartData.map(item => {
      const percentage = item.count / this.totalVulnerabilities;
      const angle = percentage * 360;
      const endAngle = startAngle + angle;

      // Calculate SVG arc path
      const path = this.describeArc(center, center, radius, startAngle, endAngle, this.chartThickness);

      // Update start angle for next segment
      startAngle = endAngle;

      return {
        path,
        color: item.color,
        severity: item.severity,
        count: item.count
      };
    });
  }

  private describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number, thickness: number): string {
    const innerRadius = radius - (thickness / 2);
    const outerRadius = radius + (thickness / 2);

    const startRadians = (startAngle - 90) * Math.PI / 180;
    const endRadians = (endAngle - 90) * Math.PI / 180;

    const startX1 = x + innerRadius * Math.cos(startRadians);
    const startY1 = y + innerRadius * Math.sin(startRadians);
    const endX1 = x + innerRadius * Math.cos(endRadians);
    const endY1 = y + innerRadius * Math.sin(endRadians);

    const startX2 = x + outerRadius * Math.cos(startRadians);
    const startY2 = y + outerRadius * Math.sin(startRadians);
    const endX2 = x + outerRadius * Math.cos(endRadians);
    const endY2 = y + outerRadius * Math.sin(endRadians);

    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    // SVG path for the arc
    return [
      `M ${startX2} ${startY2}`, // Move to start of outer arc
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endX2} ${endY2}`, // Draw outer arc
      `L ${endX1} ${endY1}`, // Line to inner arc end
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startX1} ${startY1}`, // Draw inner arc
      'Z' // Close path
    ].join(' ');
  }

  getPercentage(count: number): string {
    if (this.totalVulnerabilities === 0) return '0%';
    return Math.round((count / this.totalVulnerabilities) * 100) + '%';
  }

  refreshChart(): void {
    this.processChartData();
  }
}
