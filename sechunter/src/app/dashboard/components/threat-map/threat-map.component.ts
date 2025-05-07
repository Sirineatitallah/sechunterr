import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType, PolarAreaController, ArcElement, RadialLinearScale } from 'chart.js';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Register the required chart components
Chart.register(PolarAreaController, ArcElement, RadialLinearScale);

@Component({
  selector: 'app-threat-map',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './threat-map.component.html',
  styleUrls: ['./threat-map.component.scss']
})
export class ThreatMapComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  chart: Chart | undefined;

  // Mock data for threat map
  threatData = {
    labels: ['North America', 'Europe', 'Asia', 'South America', 'Africa', 'Australia'],
    datasets: [
      {
        label: 'Threat Intensity',
        data: [85, 72, 93, 45, 38, 25],
        backgroundColor: [
          'rgba(255, 71, 87, 0.7)',
          'rgba(255, 165, 2, 0.7)',
          'rgba(255, 71, 87, 0.7)',
          'rgba(255, 219, 88, 0.7)',
          'rgba(46, 213, 115, 0.7)',
          'rgba(0, 243, 255, 0.7)'
        ],
        borderColor: [
          'rgba(255, 71, 87, 1)',
          'rgba(255, 165, 2, 1)',
          'rgba(255, 71, 87, 1)',
          'rgba(255, 219, 88, 1)',
          'rgba(46, 213, 115, 1)',
          'rgba(0, 243, 255, 1)'
        ],
        borderWidth: 1,
        hoverOffset: 15
      }
    ]
  };

  // Recent threat alerts
  recentThreats = [
    {
      region: 'North America',
      type: 'DDoS Attack',
      severity: 'high',
      time: '10 min ago',
      source: 'Botnet'
    },
    {
      region: 'Asia',
      type: 'Data Breach',
      severity: 'critical',
      time: '25 min ago',
      source: 'APT Group'
    },
    {
      region: 'Europe',
      type: 'Phishing Campaign',
      severity: 'medium',
      time: '1 hour ago',
      source: 'Unknown'
    }
  ];

  constructor() { }

  ngOnInit(): void {
    // Initialize component
  }

  ngAfterViewInit(): void {
    this.createChart();
  }

  createChart(): void {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');

    if (ctx) {
      // Register required Chart.js components
      Chart.defaults.color = '#e1e1e6';
      Chart.defaults.font.family = 'Roboto, "Helvetica Neue", sans-serif';

      const config: ChartConfiguration = {
        type: 'polarArea' as ChartType,
        data: this.threatData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                color: '#e1e1e6',
                font: {
                  family: 'Roboto, "Helvetica Neue", sans-serif'
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(16, 18, 27, 0.8)',
              titleColor: '#ffffff',
              bodyColor: '#e1e1e6',
              borderColor: 'rgba(0, 243, 255, 0.3)',
              borderWidth: 1,
              padding: 10,
              displayColors: true,
              usePointStyle: true
            }
          },
          scales: {
            r: {
              ticks: {
                backdropColor: 'transparent',
                color: '#e1e1e6'
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              angleLines: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              pointLabels: {
                color: '#e1e1e6',
                font: {
                  size: 12
                }
              }
            }
          },
          animation: {
            duration: 1000,
            easing: 'easeOutQuart'
          }
        }
      };

      this.chart = new Chart(ctx, config);
    }
  }

  refreshData(): void {
    if (this.chart) {
      // Simulate data refresh with random values
      const newData = [
        Math.floor(Math.random() * 50) + 50,
        Math.floor(Math.random() * 50) + 50,
        Math.floor(Math.random() * 50) + 50,
        Math.floor(Math.random() * 50) + 30,
        Math.floor(Math.random() * 50) + 20,
        Math.floor(Math.random() * 50) + 10
      ];

      this.chart.data.datasets[0].data = newData;
      this.chart.update();
    }
  }

  getSeverityClass(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'severity-critical';
      case 'high':
        return 'severity-high';
      case 'medium':
        return 'severity-medium';
      case 'low':
        return 'severity-low';
      default:
        return '';
    }
  }
}
