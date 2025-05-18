import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { GlobalDataService, SecurityAsset } from '../../../../core/services/global-data.service';

@Component({
  selector: 'app-assets-by-type',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  template: `
    <div class="chart-container">
      <h3>Actifs par Type</h3>
      <ngx-charts-pie-grid
        [view]="view"
        [scheme]="colorScheme"
        [results]="chartData"
        (select)="onSelect($event)">
      </ngx-charts-pie-grid>
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
    
    ::ng-deep .ngx-charts .label {
      fill: #e0e0e0 !important;
    }
    
    ::ng-deep .ngx-charts .value-text {
      fill: #e0e0e0 !important;
    }
  `]
})
export class AssetsByTypeComponent implements OnInit {
  // Chart options
  view: [number, number] = [500, 300];

  colorScheme: any = {
    domain: ['#4a90e2', '#50e3c2', '#f5a623', '#9013fe', '#b8e986']
  };

  // Chart data
  chartData: any[] = [];

  constructor(private globalDataService: GlobalDataService) { }

  ngOnInit(): void {
    this.globalDataService.assets$.subscribe(assets => {
      this.updateChartData(assets);
    });
  }

  updateChartData(assets: SecurityAsset[]): void {
    // Count assets by type
    const typeCounts: { [key: string]: number } = {};
    
    assets.forEach(asset => {
      typeCounts[asset.type] = (typeCounts[asset.type] || 0) + 1;
    });
    
    // Transform to chart data format
    this.chartData = Object.keys(typeCounts).map(type => {
      // Capitalize first letter and translate common asset types
      let displayName = type.charAt(0).toUpperCase() + type.slice(1);
      
      // Translate common asset types
      const translations: { [key: string]: string } = {
        'server': 'Serveurs',
        'application': 'Applications',
        'endpoint': 'Endpoints',
        'cloud': 'Cloud',
        'network': 'Réseau'
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
