import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VisualizationService } from '../../../shared/services/visualization.service';
import { Subscription } from 'rxjs';

declare var CanvasJS: any;

@Component({
  selector: 'app-risk-score',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './risk-score.component.html',
  styleUrls: ['./risk-score.component.scss']
})
export class RiskScoreComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('gaugeContainer') gaugeContainer!: ElementRef;
  
  // Risk score data
  currentScore = 72;
  previousScore = 68;
  scoreChange = 4;
  scoreDate = new Date();
  
  // Risk factors
  riskFactors = [
    { name: 'Vulnérabilités', score: 65, weight: 0.3, trend: 'down' },
    { name: 'Exposition', score: 78, weight: 0.25, trend: 'up' },
    { name: 'Menaces', score: 82, weight: 0.2, trend: 'up' },
    { name: 'Conformité', score: 70, weight: 0.15, trend: 'stable' },
    { name: 'Résilience', score: 60, weight: 0.1, trend: 'down' }
  ];
  
  // Chart instance
  private chart: any;
  
  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor(private visualizationService: VisualizationService) { }

  ngOnInit(): void {
    // Subscribe to refresh trigger
    this.subscriptions.push(
      this.visualizationService.refreshTrigger$.subscribe(trigger => {
        if (trigger) {
          this.refreshData();
        }
      })
    );
    
    // Load CanvasJS script
    this.loadCanvasJSScript().then(() => {
      // Script loaded, chart will be rendered in ngAfterViewInit
    });
  }

  ngAfterViewInit(): void {
    // Render gauge chart
    setTimeout(() => {
      this.renderGaugeChart();
    }, 100);
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    // Dispose chart
    if (this.chart) {
      this.chart.destroy();
    }
  }

  // Load CanvasJS script
  loadCanvasJSScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof CanvasJS !== 'undefined') {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdn.canvasjs.com/canvasjs.min.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = (error) => reject(error);
      document.head.appendChild(script);
    });
  }

  // Render gauge chart
  renderGaugeChart(): void {
    if (typeof CanvasJS === 'undefined') {
      console.error('CanvasJS not loaded');
      return;
    }
    
    const container = this.gaugeContainer.nativeElement;
    if (!container) {
      console.error('Gauge container not found');
      return;
    }
    
    // Create chart
    this.chart = new CanvasJS.Chart(container, {
      backgroundColor: 'transparent',
      animationEnabled: true,
      animationDuration: 2000,
      data: [{
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        valueFormatString: '0',
        dataPoints: [
          { y: this.currentScore, color: this.getScoreColor(this.currentScore) }
        ],
        minimum: 0,
        maximum: 100,
        radius: '90%',
        innerRadius: '60%',
        tickLength: 0,
        tickColor: 'transparent'
      }],
      axisY: {
        minimum: 0,
        maximum: 100,
        interval: 20,
        labelFontColor: '#a8a3a3',
        labelFontSize: 12,
        tickLength: 0,
        lineThickness: 0
      },
      toolTip: {
        enabled: false
      }
    });
    
    // Add color bands
    this.chart.options.data[0].colorSet = 'customColorSet';
    this.chart.options.data[0].colorSet = [
      { color: '#ff4757', from: 0, to: 40 },
      { color: '#ffa502', from: 40, to: 70 },
      { color: '#2ed573', from: 70, to: 100 }
    ];
    
    // Render chart
    this.chart.render();
    
    // Add score text
    const scoreText = document.createElement('div');
    scoreText.className = 'gauge-score';
    scoreText.innerHTML = `
      <div class="score-value">${this.currentScore}</div>
      <div class="score-label">Score de Risque</div>
    `;
    container.appendChild(scoreText);
  }

  // Get score color based on value
  getScoreColor(score: number): string {
    if (score >= 70) {
      return '#2ed573'; // Green (good)
    } else if (score >= 40) {
      return '#ffa502'; // Orange (medium)
    } else {
      return '#ff4757'; // Red (bad)
    }
  }

  // Get score zone
  getScoreZone(): string {
    if (this.currentScore >= 70) {
      return 'Bon';
    } else if (this.currentScore >= 40) {
      return 'Moyen';
    } else {
      return 'Critique';
    }
  }

  // Get score zone class
  getScoreZoneClass(): string {
    if (this.currentScore >= 70) {
      return 'good';
    } else if (this.currentScore >= 40) {
      return 'medium';
    } else {
      return 'bad';
    }
  }

  // Get trend class
  getTrendClass(trend: string): string {
    switch (trend) {
      case 'up':
        return 'trend-up';
      case 'down':
        return 'trend-down';
      default:
        return 'trend-stable';
    }
  }

  // Get trend icon
  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up':
        return 'trending_up';
      case 'down':
        return 'trending_down';
      default:
        return 'trending_flat';
    }
  }

  // Format date
  formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Refresh data
  refreshData(): void {
    // In a real application, this would fetch data from an API
    // For demo purposes, we'll just update the current score
    this.previousScore = this.currentScore;
    this.currentScore = Math.min(100, Math.max(0, this.currentScore + Math.floor(Math.random() * 11) - 5));
    this.scoreChange = this.currentScore - this.previousScore;
    this.scoreDate = new Date();
    
    // Update risk factors
    this.riskFactors = this.riskFactors.map(factor => ({
      ...factor,
      score: Math.min(100, Math.max(0, factor.score + Math.floor(Math.random() * 11) - 5)),
      trend: Math.random() > 0.5 ? (Math.random() > 0.5 ? 'up' : 'down') : 'stable'
    }));
    
    // Re-render gauge chart
    if (this.chart) {
      this.chart.options.data[0].dataPoints[0].y = this.currentScore;
      this.chart.options.data[0].dataPoints[0].color = this.getScoreColor(this.currentScore);
      this.chart.render();
      
      // Update score text
      const scoreText = this.gaugeContainer.nativeElement.querySelector('.gauge-score .score-value');
      if (scoreText) {
        scoreText.textContent = this.currentScore;
      }
    }
  }
}
