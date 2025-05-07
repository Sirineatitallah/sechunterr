import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-satisfaction-line-chart',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './satisfaction-line-chart.component.html',
  styleUrl: './satisfaction-line-chart.component.css'
})
export class SatisfactionLineChartComponent implements OnInit {
  // Chart options
  view: [number, number] = [700, 300];
  legend: boolean = true;
  showLabels: boolean = true;
  animations: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'Month';
  yAxisLabel: string = 'Satisfaction Score';
  timeline: boolean = false;

  colorScheme: any = {
    domain: ['#4CC9F0', '#F72585', '#4361EE', '#3A0CA3', '#7209B7']
  };

  // Chart data
  multi = [
    {
      "name": "Last Month",
      "series": [
        { "name": "Week 1", "value": 71 },
        { "name": "Week 2", "value": 72 },
        { "name": "Week 3", "value": 70 },
        { "name": "Week 4", "value": 73 },
        { "name": "Week 5", "value": 78 }
      ]
    },
    {
      "name": "This Month",
      "series": [
        { "name": "Week 1", "value": 85 },
        { "name": "Week 2", "value": 83 },
        { "name": "Week 3", "value": 84 },
        { "name": "Week 4", "value": 87 },
        { "name": "Week 5", "value": 89 }
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
