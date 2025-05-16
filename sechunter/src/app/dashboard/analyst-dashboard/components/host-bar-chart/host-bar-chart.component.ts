import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Vulnerability } from '../../models/vulnerability.model';

interface HostData {
  host: string;
  count: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

@Component({
  selector: 'app-host-bar-chart',
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
  templateUrl: './host-bar-chart.component.html',
  styleUrls: ['./host-bar-chart.component.scss']
})
export class HostBarChartComponent implements OnInit, OnChanges {
  @Input() vulnerabilities: Vulnerability[] = [];
  @Input() loading = false;

  // Chart data
  hostData: HostData[] = [];

  // Chart dimensions
  readonly chartWidth = 600;
  readonly chartHeight = 300;
  readonly paddingLeft = 120;
  readonly paddingRight = 20;
  readonly paddingTop = 20;
  readonly paddingBottom = 40;

  // Chart elements
  bars: { host: string; x: number; y: number; width: number; height: number; count: number; critical: number; high: number; medium: number; low: number }[] = [];

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
    if (!this.vulnerabilities || this.vulnerabilities.length === 0) {
      this.hostData = [];
      this.generateChartElements();
      return;
    }

    // Group vulnerabilities by host
    const hostMap = new Map<string, HostData>();

    this.vulnerabilities.forEach(vuln => {
      const host = vuln.host_ip;

      if (!hostMap.has(host)) {
        hostMap.set(host, {
          host,
          count: 0,
          critical: 0,
          high: 0,
          medium: 0,
          low: 0
        });
      }

      const hostEntry = hostMap.get(host)!;
      hostEntry.count++;

      // Increment severity count
      switch (vuln.severity.toLowerCase()) {
        case 'critical':
          hostEntry.critical++;
          break;
        case 'high':
          hostEntry.high++;
          break;
        case 'medium':
          hostEntry.medium++;
          break;
        case 'low':
          hostEntry.low++;
          break;
      }
    });

    // Convert to array and sort by count (descending)
    this.hostData = Array.from(hostMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Show top 10 hosts

    // Generate chart elements
    this.generateChartElements();
  }

  private generateChartElements(): void {
    if (this.hostData.length === 0) {
      this.bars = [];
      return;
    }

    const innerWidth = this.chartWidth - this.paddingLeft - this.paddingRight;
    const innerHeight = this.chartHeight - this.paddingTop - this.paddingBottom;

    // Find max count for scaling
    const maxCount = Math.max(...this.hostData.map(host => host.count));

    // Calculate bar height and spacing
    const barHeight = innerHeight / this.hostData.length * 0.7;
    const barSpacing = innerHeight / this.hostData.length * 0.3;

    // Generate bars
    this.bars = this.hostData.map((host, index) => {
      const y = this.paddingTop + index * (barHeight + barSpacing);
      const width = (host.count / maxCount) * innerWidth;

      return {
        host: host.host,
        x: this.paddingLeft,
        y,
        width,
        height: barHeight,
        count: host.count,
        critical: host.critical,
        high: host.high,
        medium: host.medium,
        low: host.low
      };
    });
  }

  refreshChart(): void {
    this.processChartData();
  }
}
