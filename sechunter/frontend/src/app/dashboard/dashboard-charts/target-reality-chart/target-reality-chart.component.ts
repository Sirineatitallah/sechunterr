import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-target-reality-chart',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './target-reality-chart.component.html',
  styleUrl: './target-reality-chart.component.css'
})
export class TargetRealityChartComponent implements OnInit {
  // Chart options
  view: [number, number] = [700, 300];
  showXAxis = true;
  showYAxis = true;
  gradient = true;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Month';
  showYAxisLabel = true;
  yAxisLabel = 'Value';

  colorScheme: any = {
    domain: ['#FFD700', '#4CC9F0', '#7209B7']
  };

  // Chart data
  multi = [
    {
      "name": "Target",
      "series": [
        { "name": "Jan", "value": 9500 },
        { "name": "Feb", "value": 10000 },
        { "name": "Mar", "value": 10500 },
        { "name": "Apr", "value": 11000 },
        { "name": "May", "value": 11500 },
        { "name": "Jun", "value": 12000 }
      ]
    },
    {
      "name": "Reality",
      "series": [
        { "name": "Jan", "value": 9800 },
        { "name": "Feb", "value": 10300 },
        { "name": "Mar", "value": 10200 },
        { "name": "Apr", "value": 11800 },
        { "name": "May", "value": 12500 },
        { "name": "Jun", "value": 12100 }
      ]
    }
  ];

  // Summary data
  targetSum = 0;
  realitySum = 0;

  constructor() { }

  ngOnInit(): void {
    // Calculate summary data
    this.calculateSummary();
  }

  calculateSummary(): void {
    this.targetSum = this.multi[0].series.reduce((sum, item) => sum + item.value, 0);
    this.realitySum = this.multi[1].series.reduce((sum, item) => sum + item.value, 0);
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
