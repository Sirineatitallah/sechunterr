// src/app/dashboard/components/main-chart/main-chart.component.ts
import { Component, Input, OnInit, OnChanges, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-main-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <canvas #chartCanvas></canvas>
      <div class="no-data" *ngIf="!data || data.length === 0">
        No data available
      </div>
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      width: 100%;
      height: 100%;
    }
    
    canvas {
      width: 100% !important;
      height: 100% !important;
    }
    
    .no-data {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #999;
      font-style: italic;
    }
  `]
})
export class MainChartComponent implements OnInit, OnChanges {
  @Input() data: any[] = [];
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  private chart?: Chart;
  
  ngOnInit() {
    if (this.data && this.data.length > 0) {
      this.initChart();
    }
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && !changes['data'].firstChange) {
      if (this.chart) {
        this.updateChart();
      } else {
        this.initChart();
      }
    }
  }
  
  private initChart() {
    if (!this.chartCanvas || !this.data || this.data.length === 0) return;
    
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
    
    const labels = this.data.map(item => item.date);
    
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Critical',
            data: this.data.map(item => item.critical),
            borderColor: '#e53935',
            backgroundColor: 'rgba(229, 57, 53, 0.1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true
          },
          {
            label: 'High',
            data: this.data.map(item => item.high),
            borderColor: '#ff9800',
            backgroundColor: 'rgba(255, 152, 0, 0.1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true
          },
          {
            label: 'Medium',
            data: this.data.map(item => item.medium),
            borderColor: '#ffeb3b',
            backgroundColor: 'rgba(255, 235, 59, 0.1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true
          },
          {
            label: 'Low',
            data: this.data.map(item => item.low),
            borderColor: '#4caf50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Vulnerabilities'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Time Period'
            }
          }
        },
      }
    });
  }
  
  private updateChart() {
    if (!this.chart || !this.data) return;
    
    const labels = this.data.map(item => item.date);
    
    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = this.data.map(item => item.critical);
    this.chart.data.datasets[1].data = this.data.map(item => item.high);
    this.chart.data.datasets[2].data = this.data.map(item => item.medium);
    this.chart.data.datasets[3].data = this.data.map(item => item.low);
    
    this.chart.update();
  }
}