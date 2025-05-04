import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexFill,
  ApexTooltip,
  ApexGrid,
  ApexYAxis,
  ApexLegend,
  ApexPlotOptions,
  NgApexchartsModule
} from 'ng-apexcharts';
import { MicroserviceConnectorService, MicroserviceType } from '../../../core/services/microservice-connector.service';
import { Subscription } from 'rxjs';

export type HeatmapChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  title: ApexTitleSubtitle;
  fill: ApexFill;
  tooltip: ApexTooltip;
  grid: ApexGrid;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  legend: ApexLegend;
  plotOptions: ApexPlotOptions;
};

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-asm-dashboard',
  templateUrl: './asm-dashboard.component.html',
  styleUrls: ['./asm-dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, NgApexchartsModule]
})
export class AsmDashboardComponent implements OnInit, OnDestroy {
  public heatmapChartOptions: HeatmapChartOptions;
  private microserviceConnectorService = inject(MicroserviceConnectorService);
  private dataSubscription?: Subscription;

  loading: boolean = true;

  constructor() {
    this.heatmapChartOptions = {
      series: [],
      chart: {
        height: 350,
        type: 'heatmap',
      },
      dataLabels: {
        enabled: false,
      },
      title: {
        text: 'ASM Heatmap',
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        enabled: true,
      },
      grid: {
        padding: {
          right: 20,
        },
      },
      xaxis: {
        type: 'category',
      },
      yaxis: {
        show: true,
      },
      legend: {
        show: true,
        position: 'top',
      },
      plotOptions: {
        heatmap: {
          shadeIntensity: 0.5,
          radius: 0,
          useFillColorAsStroke: true,
          colorScale: {
            ranges: [
              {
                from: 0,
                to: 20,
                color: '#00A100',
                name: 'low',
              },
              {
                from: 21,
                to: 40,
                color: '#128FD9',
                name: 'medium',
              },
              {
                from: 41,
                to: 60,
                color: '#FFB200',
                name: 'high',
              },
              {
                from: 61,
                to: 100,
                color: '#FF0000',
                name: 'extreme',
              },
            ],
          },
        },
      },
    };
  }

  ngOnInit(): void {
    this.dataSubscription = this.microserviceConnectorService
      .getRealTimeServiceData<any>(MicroserviceType.VULNERABILITY_SCANNER)
      .subscribe((data) => {
        // Transform the data to ApexCharts heatmap series format
        this.heatmapChartOptions = {
          ...this.heatmapChartOptions,
          series: this.transformDataToSeries(data),
        };
        this.loading = false;
      });
  }

  ngOnDestroy(): void {
    this.dataSubscription?.unsubscribe();
  }

  private transformDataToSeries(data: any): ApexAxisChartSeries {
    // TODO: Implement transformation logic based on actual data structure
    // For now, return empty series or sample data
    return [
      {
        name: 'Sample Metric',
        data: [
          { x: 'Mon', y: 10 },
          { x: 'Tue', y: 20 },
          { x: 'Wed', y: 30 },
          { x: 'Thu', y: 40 },
          { x: 'Fri', y: 50 },
          { x: 'Sat', y: 60 },
          { x: 'Sun', y: 70 },
        ],
      },
    ];
  }
}
