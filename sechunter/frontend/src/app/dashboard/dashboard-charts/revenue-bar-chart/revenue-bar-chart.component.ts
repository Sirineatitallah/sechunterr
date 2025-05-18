import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-revenue-bar-chart',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './revenue-bar-chart.component.html',
  styleUrl: './revenue-bar-chart.component.css'
})
export class RevenueBarChartComponent implements OnInit {
  // Chart options
  view: [number, number] = [700, 300];
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Day';
  showYAxisLabel = true;
  yAxisLabel = 'Revenue';
  legendTitle = 'Products';

  colorScheme: any = {
    domain: ['#1E88E5', '#26C6DA', '#00E676', '#FFC107', '#7B1FA2']
  };

  // Chart data
  multi = [
    {
      "name": "Online Sales",
      "series": [
        { "name": "Monday", "value": 7300 },
        { "name": "Tuesday", "value": 8900 },
        { "name": "Wednesday", "value": 7000 },
        { "name": "Thursday", "value": 9800 },
        { "name": "Friday", "value": 8200 },
        { "name": "Saturday", "value": 9100 },
        { "name": "Sunday", "value": 8600 }
      ]
    },
    {
      "name": "Store Sales",
      "series": [
        { "name": "Monday", "value": 5400 },
        { "name": "Tuesday", "value": 6900 },
        { "name": "Wednesday", "value": 9000 },
        { "name": "Thursday", "value": 7200 },
        { "name": "Friday", "value": 5900 },
        { "name": "Saturday", "value": 7300 },
        { "name": "Sunday", "value": 6100 }
      ]
    }
  ];

  constructor() { }

  ngOnInit(): void {
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
