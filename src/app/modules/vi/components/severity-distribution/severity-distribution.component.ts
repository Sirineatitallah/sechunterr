import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SeverityData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
  }[];
  total: number;
  remediated: number;
  open: number;
  trend: {
    critical: string;
    high: string;
    medium: string;
    low: string;
    info: string;
  };
}

@Component({
  selector: 'app-severity-distribution',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="visualization-container">
      <div class="chart-placeholder">
        <h3>Distribution par Sévérité</h3>

        <!-- No data state -->
        <div class="no-data-message" *ngIf="!severityData || severityData.length === 0">
          Aucune donnée disponible
        </div>

        <!-- Data available -->
        <div class="chart-area" *ngIf="severityData && severityData.length > 0">
          <div class="pie-chart">
            <div
              *ngFor="let label of severityLabels; let i = index"
              class="pie-segment"
              [ngClass]="getSeverityClass(i)"
              [style.transform]="'rotate(' + getRotation(i) + ')'"
              [style.clip-path]="getClipPath(i)"
              [title]="label + ': ' + getPercentage(i).toFixed(1) + '%'"
            ></div>
            <div class="pie-center">
              <div class="pie-total">{{ totalVulnerabilities }}</div>
              <div class="pie-label">Total</div>
            </div>
          </div>

          <div class="stats-container">
            <div class="stat-item">
              <div class="stat-value">{{ remediatedVulnerabilities }}</div>
              <div class="stat-label">Corrigées</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ openVulnerabilities }}</div>
              <div class="stat-label">Ouvertes</div>
            </div>
          </div>

          <div class="legend">
            <div class="legend-item" *ngFor="let label of severityLabels; let i = index">
              <div class="legend-color" [ngClass]="getSeverityClass(i)" [style.background-color]="severityColors[i]"></div>
              <div class="legend-label">
                {{ label }} ({{ getPercentage(i).toFixed(0) }}%)
                <span class="trend" *ngIf="severityTrends[label.toLowerCase()]" [ngClass]="getTrendClass(severityTrends[label.toLowerCase()])">
                  {{ severityTrends[label.toLowerCase()] }}
                  <i class="material-icons trend-icon">{{ getTrendIcon(severityTrends[label.toLowerCase()]) }}</i>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .visualization-container {
      height: 100%;
      padding: 16px;
      overflow: hidden;
    }

    .chart-placeholder {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    h3 {
      margin-top: 0;
      margin-bottom: 16px;
      font-size: 18px;
      font-weight: 600;
    }

    .no-data-message {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
      font-style: italic;
    }

    .chart-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      overflow-y: auto;
    }

    .pie-chart {
      position: relative;
      width: 140px;
      height: 140px;
      border-radius: 50%;
      background: #f0f0f0;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .pie-segment {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      clip: rect(0, 140px, 140px, 70px);
      transition: transform 0.3s ease;
    }

    .pie-segment:hover {
      transform: scale(1.05) !important;
    }

    .pie-segment.critical {
      background-color: #ff4444;
    }

    .pie-segment.high {
      background-color: #ffbb33;
    }

    .pie-segment.medium {
      background-color: #00C851;
    }

    .pie-segment.low {
      background-color: #33b5e5;
    }

    .pie-segment.info {
      background-color: #2196F3;
    }

    .pie-center {
      position: absolute;
      width: 70px;
      height: 70px;
      background: white;
      border-radius: 50%;
      top: 35px;
      left: 35px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
    }

    .pie-total {
      font-size: 20px;
      font-weight: bold;
      color: #333;
    }

    .pie-label {
      font-size: 12px;
      color: #666;
    }

    .stats-container {
      display: flex;
      gap: 24px;
      margin: 8px 0;
    }

    .stat-item {
      text-align: center;
    }

    .stat-value {
      font-size: 18px;
      font-weight: bold;
      color: #333;
    }

    .stat-label {
      font-size: 12px;
      color: #666;
    }

    .legend {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }

    .legend-color.critical {
      background-color: #ff4444;
    }

    .legend-color.high {
      background-color: #ffbb33;
    }

    .legend-color.medium {
      background-color: #00C851;
    }

    .legend-color.low {
      background-color: #33b5e5;
    }

    .legend-color.info {
      background-color: #2196F3;
    }

    .legend-label {
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .trend {
      display: inline-flex;
      align-items: center;
      font-size: 11px;
      margin-left: 4px;
    }

    .trend-icon {
      font-size: 14px;
      margin-left: 2px;
    }

    .trend-up {
      color: #ff4444;
    }

    .trend-down {
      color: #00C851;
    }

    .trend-flat {
      color: #999;
    }
  `]
})
export class SeverityDistributionComponent implements OnChanges {
  @Input() data: SeverityData;

  severityLabels: string[] = [];
  severityData: number[] = [];
  severityColors: string[] = [];
  totalVulnerabilities: number = 0;
  remediatedVulnerabilities: number = 0;
  openVulnerabilities: number = 0;
  severityTrends: { [key: string]: string } = {};

  // Calculate cumulative percentages for pie chart segments
  cumulativePercentages: number[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && changes['data'].currentValue) {
      this.processData(changes['data'].currentValue);
    }
  }

  private processData(data: SeverityData): void {
    if (!data) return;

    this.severityLabels = data.labels || [];
    this.severityColors = data.datasets[0]?.backgroundColor || [];
    this.severityData = data.datasets[0]?.data || [];
    this.totalVulnerabilities = data.total || 0;
    this.remediatedVulnerabilities = data.remediated || 0;
    this.openVulnerabilities = data.open || 0;
    this.severityTrends = data.trend || {};

    // Calculate percentages and cumulative percentages
    this.calculatePercentages();
  }

  private calculatePercentages(): void {
    const total = this.severityData.reduce((sum, value) => sum + value, 0);

    // Reset cumulative percentages
    this.cumulativePercentages = [];

    // Calculate cumulative percentages for pie chart segments
    let cumulative = 0;
    this.severityData.forEach((value) => {
      const percentage = (value / total) * 100;
      cumulative += percentage;
      this.cumulativePercentages.push(cumulative);
    });
  }

  getPercentage(index: number): number {
    if (!this.severityData.length) return 0;

    const total = this.severityData.reduce((sum, value) => sum + value, 0);
    return (this.severityData[index] / total) * 100;
  }

  getRotation(index: number): string {
    if (index === 0) return '0';

    // Get the cumulative percentage of the previous segments
    const prevCumulative = this.cumulativePercentages[index - 1];
    return `calc(3.6deg * ${prevCumulative})`;
  }

  getClipPath(index: number): string {
    const percentage = this.getPercentage(index);
    return `polygon(60px 60px, 60px 0, calc(60px + 60px * ${percentage} * 3.6 / 100) 0)`;
  }

  getSeverityClass(index: number): string {
    if (index >= this.severityLabels.length) return '';

    const label = this.severityLabels[index].toLowerCase();
    if (label.includes('critique') || label.includes('critical')) return 'critical';
    if (label.includes('élevée') || label.includes('high')) return 'high';
    if (label.includes('moyenne') || label.includes('medium')) return 'medium';
    if (label.includes('faible') || label.includes('low')) return 'low';
    if (label.includes('info')) return 'info';

    return '';
  }

  getTrendIcon(trend: string): string {
    if (!trend) return '';

    if (trend.startsWith('+')) return 'trending_up';
    if (trend.startsWith('-')) return 'trending_down';
    return 'trending_flat';
  }

  getTrendClass(trend: string): string {
    if (!trend) return '';

    if (trend.startsWith('+')) return 'trend-up';
    if (trend.startsWith('-')) return 'trend-down';
    return 'trend-flat';
  }
}
