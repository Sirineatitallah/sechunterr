import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType, RadarController, LineElement, PointElement, RadialLinearScale } from 'chart.js';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Register the required chart components
Chart.register(RadarController, LineElement, PointElement, RadialLinearScale);

@Component({
  selector: 'app-security-radar',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './security-radar.component.html',
  styleUrls: ['./security-radar.component.scss']
})
export class SecurityRadarComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  chart: Chart | undefined;

  // Mock data for security posture radar
  securityData = {
    labels: [
      'Network Security',
      'Endpoint Protection',
      'Identity Management',
      'Data Protection',
      'Application Security',
      'Cloud Security',
      'Security Operations'
    ],
    datasets: [
      {
        label: 'Current Posture',
        data: [85, 72, 93, 65, 78, 82, 70],
        backgroundColor: 'rgba(0, 243, 255, 0.2)',
        borderColor: 'rgba(0, 243, 255, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(0, 243, 255, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(0, 243, 255, 1)',
        pointRadius: 4
      },
      {
        label: 'Industry Benchmark',
        data: [75, 68, 80, 72, 65, 75, 60],
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.5)',
        borderWidth: 1,
        pointBackgroundColor: 'rgba(255, 255, 255, 0.5)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(255, 255, 255, 0.5)',
        pointRadius: 3
      }
    ]
  };

  // Security recommendations
  recommendations = [
    {
      category: 'Identity Management',
      action: 'Enable MFA for all admin accounts',
      impact: 'high'
    },
    {
      category: 'Data Protection',
      action: 'Encrypt sensitive data at rest',
      impact: 'medium'
    },
    {
      category: 'Security Operations',
      action: 'Implement automated incident response',
      impact: 'high'
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
        type: 'radar' as ChartType,
        data: this.securityData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
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
              min: 0,
              max: 100,
              ticks: {
                backdropColor: 'transparent',
                color: '#e1e1e6',
                stepSize: 20
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
        Math.floor(Math.random() * 30) + 70,
        Math.floor(Math.random() * 30) + 60,
        Math.floor(Math.random() * 30) + 70,
        Math.floor(Math.random() * 30) + 60,
        Math.floor(Math.random() * 30) + 60,
        Math.floor(Math.random() * 30) + 70,
        Math.floor(Math.random() * 30) + 60
      ];

      this.chart.data.datasets[0].data = newData;
      this.chart.update();
    }
  }

  getImpactClass(impact: string): string {
    switch (impact.toLowerCase()) {
      case 'high':
        return 'impact-high';
      case 'medium':
        return 'impact-medium';
      case 'low':
        return 'impact-low';
      default:
        return '';
    }
  }
}
