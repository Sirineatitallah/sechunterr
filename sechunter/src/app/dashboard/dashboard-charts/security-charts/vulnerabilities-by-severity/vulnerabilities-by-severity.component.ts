import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule, LegendPosition } from '@swimlane/ngx-charts';
import { GlobalDataService, SecurityVulnerability } from '../../../../core/services/global-data.service';

@Component({
  selector: 'app-vulnerabilities-by-severity',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  template: `
    <div class="chart-container">
      <h3>Vulnérabilités par Sévérité</h3>
      <ngx-charts-pie-chart
        [view]="view"
        [scheme]="colorScheme"
        [results]="chartData"
        [gradient]="gradient"
        [legend]="showLegend"
        [legendPosition]="legendPosition"
        [labels]="showLabels"
        [doughnut]="isDoughnut"
        [arcWidth]="arcWidth"
        (select)="onSelect($event)">
      </ngx-charts-pie-chart>
    </div>
  `,
  styles: [`
    .chart-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 1rem;
    }

    h3 {
      margin-top: 0;
      margin-bottom: 1rem;
      color: #e0e0e0;
      font-size: 1.2rem;
      font-weight: 500;
    }

    ::ng-deep .ngx-charts {
      float: none;
      margin: 0 auto;
    }

    ::ng-deep .ngx-charts .pie-label {
      fill: #f0f0f0;
    }

    ::ng-deep .ngx-charts .legend-labels {
      background: rgba(0, 0, 0, 0.2) !important;
    }

    ::ng-deep .ngx-charts .legend-label-text {
      color: #e0e0e0 !important;
    }
  `]
})
export class VulnerabilitiesBySeverityComponent implements OnInit {
  // Chart options
  view: [number, number] = [500, 300];
  gradient = true;
  showLegend = true;
  showLabels = true;
  isDoughnut = false;
  arcWidth = 0.25;
  legendPosition: LegendPosition = LegendPosition.Below;

  colorScheme: any = {
    domain: ['#ff4757', '#ffa502', '#ffdb58', '#2ed573', '#00f3ff']
  };

  // Chart data
  chartData: any[] = [];

  constructor(private globalDataService: GlobalDataService) { }

  ngOnInit(): void {
    this.globalDataService.vulnerabilities$.subscribe(vulnerabilities => {
      this.updateChartData(vulnerabilities);
    });
  }

  updateChartData(vulnerabilities: SecurityVulnerability[]): void {
    // Count vulnerabilities by severity
    const severityCounts: { [key: string]: number } = {
      'critical': 0,
      'high': 0,
      'medium': 0,
      'low': 0
    };

    vulnerabilities.forEach(vuln => {
      if (vuln.severity in severityCounts) {
        severityCounts[vuln.severity]++;
      }
    });

    // Transform to chart data format
    this.chartData = [
      { name: 'Critique', value: severityCounts['critical'] },
      { name: 'Élevée', value: severityCounts['high'] },
      { name: 'Moyenne', value: severityCounts['medium'] },
      { name: 'Faible', value: severityCounts['low'] || 0 }
    ];
  }

  onSelect(event: any): void {
    console.log('Item clicked', event);
  }
}
