import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-volume-service-chart',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './volume-service-chart.component.html',
  styleUrl: './volume-service-chart.component.css'
})
export class VolumeServiceChartComponent implements OnInit {
  // Chart options
  view: [number, number] = [700, 300];
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Month';
  showYAxisLabel = true;
  yAxisLabel = 'Value';

  colorScheme: any = {
    domain: ['#00E676', '#2196F3']
  };

  // Chart data
  multi = [
    {
      "name": "Volume",
      "series": [
        { "name": "Jan", "value": 1228 },
        { "name": "Feb", "value": 1300 },
        { "name": "Mar", "value": 1260 },
        { "name": "Apr", "value": 1190 },
        { "name": "May", "value": 1350 },
        { "name": "Jun", "value": 1480 }
      ]
    },
    {
      "name": "Service",
      "series": [
        { "name": "Jan", "value": 1550 },
        { "name": "Feb", "value": 1590 },
        { "name": "Mar", "value": 1620 },
        { "name": "Apr", "value": 1680 },
        { "name": "May", "value": 1700 },
        { "name": "Jun", "value": 1790 }
      ]
    }
  ];

  // Summary data
  volumeTotal = 0;
  serviceTotal = 0;

  constructor() { }

  ngOnInit(): void {
    this.calculateTotals();
  }

  calculateTotals(): void {
    this.volumeTotal = this.multi[0].series.reduce((sum, item) => sum + item.value, 0);
    this.serviceTotal = this.multi[1].series.reduce((sum, item) => sum + item.value, 0);
  }

  onSelect(event: any): void {
    console.log('Item clicked', event);
  }

  onActivate(data: any): void {
    console.log('Activate', data);
  }

  onDeactivate(data: any): void {
    console.log('Deactivate', data);
  }
}
