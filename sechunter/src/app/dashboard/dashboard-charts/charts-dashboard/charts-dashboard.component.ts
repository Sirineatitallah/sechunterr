import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevenueBarChartComponent } from '../revenue-bar-chart/revenue-bar-chart.component';
import { SatisfactionLineChartComponent } from '../satisfaction-line-chart/satisfaction-line-chart.component';
import { CountryMapComponent } from '../country-map/country-map.component';
import { TargetRealityChartComponent } from '../target-reality-chart/target-reality-chart.component';
import { TopProductsChartComponent } from '../top-products-chart/top-products-chart.component';
import { VolumeServiceChartComponent } from '../volume-service-chart/volume-service-chart.component';

@Component({
  selector: 'app-charts-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RevenueBarChartComponent,
    SatisfactionLineChartComponent,
    CountryMapComponent,
    TargetRealityChartComponent,
    TopProductsChartComponent,
    VolumeServiceChartComponent
  ],
  templateUrl: './charts-dashboard.component.html',
  styleUrl: './charts-dashboard.component.css'
})
export class ChartsDashboardComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {
  }
}
