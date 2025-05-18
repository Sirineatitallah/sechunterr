import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { GlobalDataService, SecurityIncident } from '../../../../core/services/global-data.service';

@Component({
  selector: 'app-incidents-by-status',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  template: `
    <div class="chart-container">
      <h3>Incidents par Statut</h3>
      <ngx-charts-bar-horizontal
        [view]="view"
        [scheme]="colorScheme"
        [results]="chartData"
        [gradient]="gradient"
        [xAxis]="showXAxis"
        [yAxis]="showYAxis"
        [legend]="showLegend"
        [showXAxisLabel]="showXAxisLabel"
        [showYAxisLabel]="showYAxisLabel"
        [xAxisLabel]="xAxisLabel"
        [yAxisLabel]="yAxisLabel"
        (select)="onSelect($event)">
      </ngx-charts-bar-horizontal>
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
    
    ::ng-deep .ngx-charts .grid-line-path {
      stroke: rgba(255, 255, 255, 0.1);
    }
    
    ::ng-deep .ngx-charts .tick text {
      fill: #e0e0e0;
    }
    
    ::ng-deep .ngx-charts .legend-labels {
      background: rgba(0, 0, 0, 0.2) !important;
    }
    
    ::ng-deep .ngx-charts .legend-label-text {
      color: #e0e0e0 !important;
    }
  `]
})
export class IncidentsByStatusComponent implements OnInit {
  // Chart options
  view: [number, number] = [500, 300];
  showXAxis = true;
  showYAxis = true;
  gradient = true;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Nombre d\'incidents';
  showYAxisLabel = false;
  yAxisLabel = 'Statut';

  colorScheme: any = {
    domain: ['#ff4757', '#ffa502', '#00f3ff', '#2ed573']
  };

  // Chart data
  chartData: any[] = [];

  constructor(private globalDataService: GlobalDataService) { }

  ngOnInit(): void {
    this.globalDataService.incidents$.subscribe(incidents => {
      this.updateChartData(incidents);
    });
  }

  updateChartData(incidents: SecurityIncident[]): void {
    // Count incidents by status
    const statusCounts: { [key: string]: number } = {
      'open': 0,
      'investigating': 0,
      'in-progress': 0,
      'resolved': 0
    };
    
    incidents.forEach(incident => {
      if (incident.status in statusCounts) {
        statusCounts[incident.status]++;
      }
    });
    
    // Transform to chart data format
    this.chartData = [
      { name: 'Ouvert', value: statusCounts['open'] },
      { name: 'En investigation', value: statusCounts['investigating'] },
      { name: 'En cours', value: statusCounts['in-progress'] },
      { name: 'Résolu', value: statusCounts['resolved'] }
    ];
  }

  onSelect(event: any): void {
    console.log('Item clicked', event);
  }
}
