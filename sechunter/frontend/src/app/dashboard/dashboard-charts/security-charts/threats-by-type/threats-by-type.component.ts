import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { GlobalDataService, SecurityThreat } from '../../../../core/services/global-data.service';

@Component({
  selector: 'app-threats-by-type',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  template: `
    <div class="chart-container">
      <h3>Menaces par Type</h3>
      <ngx-charts-advanced-pie-chart
        [view]="view"
        [scheme]="colorScheme"
        [results]="chartData"
        [gradient]="gradient"
        (select)="onSelect($event)">
      </ngx-charts-advanced-pie-chart>
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
    
    ::ng-deep .ngx-charts .total-value, 
    ::ng-deep .ngx-charts .total-label {
      color: #e0e0e0 !important;
    }
    
    ::ng-deep .ngx-charts .legend-labels {
      background: rgba(0, 0, 0, 0.2) !important;
    }
    
    ::ng-deep .ngx-charts .legend-label-text {
      color: #e0e0e0 !important;
    }
  `]
})
export class ThreatsByTypeComponent implements OnInit {
  // Chart options
  view: [number, number] = [500, 300];
  gradient = true;

  colorScheme: any = {
    domain: ['#bc13fe', '#ff4757', '#ffa502', '#00f3ff', '#2ed573']
  };

  // Chart data
  chartData: any[] = [];

  constructor(private globalDataService: GlobalDataService) { }

  ngOnInit(): void {
    this.globalDataService.threats$.subscribe(threats => {
      this.updateChartData(threats);
    });
  }

  updateChartData(threats: SecurityThreat[]): void {
    // Count threats by type
    const typeCounts: { [key: string]: number } = {};
    
    threats.forEach(threat => {
      typeCounts[threat.type] = (typeCounts[threat.type] || 0) + 1;
    });
    
    // Transform to chart data format
    this.chartData = Object.keys(typeCounts).map(type => {
      // Capitalize first letter and translate common threat types
      let displayName = type.charAt(0).toUpperCase() + type.slice(1);
      
      // Translate common threat types
      const translations: { [key: string]: string } = {
        'phishing': 'Phishing',
        'ransomware': 'Ransomware',
        'malware': 'Malware',
        'ddos': 'DDoS',
        'apt': 'APT'
      };
      
      if (type in translations) {
        displayName = translations[type];
      }
      
      return {
        name: displayName,
        value: typeCounts[type]
      };
    });
  }

  onSelect(event: any): void {
    console.log('Item clicked', event);
  }
}
