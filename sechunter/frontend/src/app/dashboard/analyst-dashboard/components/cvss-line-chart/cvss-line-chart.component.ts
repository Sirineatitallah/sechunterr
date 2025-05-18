import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { Vulnerability } from '../../models/vulnerability.model';

interface ChartDataPoint {
  date: string;
  avgCvss: number;
  count: number;
}

@Component({
  selector: 'app-cvss-line-chart',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    FormsModule
  ],
  templateUrl: './cvss-line-chart.component.html',
  styleUrls: ['./cvss-line-chart.component.scss']
})
export class CVSSLineChartComponent implements OnInit, OnChanges {
  @Input() vulnerabilities: Vulnerability[] = [];
  @Input() loading = false;

  // Chart data
  chartData: ChartDataPoint[] = [];

  // Chart dimensions
  readonly chartWidth = 600;
  readonly chartHeight = 300;
  readonly paddingLeft = 40;
  readonly paddingRight = 20;
  readonly paddingTop = 20;
  readonly paddingBottom = 40;

  // Chart options
  timeRange: 'week' | 'month' | 'quarter' | 'year' = 'month';

  // Chart elements
  xAxisLabels: string[] = [];
  yAxisLabels: string[] = [];
  points: { x: number; y: number; value: number; date: string; count: number }[] = [];
  path = '';

  constructor() {}

  ngOnInit(): void {
    this.processChartData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['vulnerabilities']) {
      this.processChartData();
    }
  }

  onTimeRangeChange(): void {
    this.processChartData();
  }

  private processChartData(): void {
    if (!this.vulnerabilities || this.vulnerabilities.length === 0) {
      this.chartData = [];
      this.generateChartElements();
      return;
    }

    // Group vulnerabilities by date
    const groupedByDate = this.groupVulnerabilitiesByDate();

    // Sort by date
    const sortedDates = Object.keys(groupedByDate).sort();

    // Create chart data points
    this.chartData = sortedDates.map(date => {
      const vulns = groupedByDate[date];
      const totalCvss = vulns.reduce((sum, vuln) => sum + vuln.cvssScore, 0);
      const avgCvss = totalCvss / vulns.length;

      return {
        date,
        avgCvss,
        count: vulns.length
      };
    });

    // Generate chart elements
    this.generateChartElements();
  }

  private groupVulnerabilitiesByDate(): { [key: string]: Vulnerability[] } {
    const now = new Date();
    let startDate: Date;

    // Determine start date based on time range
    switch (this.timeRange) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Filter vulnerabilities by date
    const filteredVulns = this.vulnerabilities.filter(vuln => {
      const vulnDate = new Date(vuln.discoveredDate);
      return vulnDate >= startDate && vulnDate <= now;
    });

    // Group by date
    const groupedByDate: { [key: string]: Vulnerability[] } = {};

    filteredVulns.forEach(vuln => {
      const date = new Date(vuln.discoveredDate);
      let dateKey: string;

      // Format date key based on time range
      switch (this.timeRange) {
        case 'week':
          dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
          break;
        case 'month':
          dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
          break;
        case 'quarter':
        case 'year':
          dateKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`; // YYYY-MM
          break;
      }

      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }

      groupedByDate[dateKey].push(vuln);
    });

    return groupedByDate;
  }

  private generateChartElements(): void {
    // Generate X-axis labels
    this.xAxisLabels = this.chartData.map(point => this.formatDateLabel(point.date));

    // Generate Y-axis labels (CVSS score from 0 to 10)
    this.yAxisLabels = ['0', '2', '4', '6', '8', '10'];

    // Calculate chart points
    const innerWidth = this.chartWidth - this.paddingLeft - this.paddingRight;
    const innerHeight = this.chartHeight - this.paddingTop - this.paddingBottom;

    this.points = this.chartData.map((point, index) => {
      const x = this.paddingLeft + (index / (this.chartData.length - 1 || 1)) * innerWidth;
      const y = this.paddingTop + innerHeight - (point.avgCvss / 10) * innerHeight;

      return {
        x,
        y,
        value: point.avgCvss,
        date: point.date,
        count: point.count
      };
    });

    // Generate SVG path for the line
    if (this.points.length > 0) {
      this.path = 'M ' + this.points.map(p => `${p.x},${p.y}`).join(' L ');
    } else {
      this.path = '';
    }
  }

  private formatDateLabel(dateStr: string): string {
    const date = new Date(dateStr);

    switch (this.timeRange) {
      case 'week':
      case 'month':
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      case 'quarter':
      case 'year':
        return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
    }
  }

  refreshChart(): void {
    this.processChartData();
  }

  getSeverityColor(cvss: number): string {
    if (cvss >= 9.0) return '#e74c3c'; // Critical
    if (cvss >= 7.0) return '#f39c12'; // High
    if (cvss >= 4.0) return '#3498db'; // Medium
    return '#2ecc71'; // Low
  }
}
