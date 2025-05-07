import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-risk-score',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="risk-score-container">
      <div class="chart-header">
        <h3>Score de Risque</h3>
        <div class="chart-controls">
          <button class="control-button">
            <span class="icon">📊</span>
            <span>Historique</span>
          </button>
        </div>
      </div>
      <div class="chart-content">
        <div class="gauge-chart">
          <div class="gauge-value">
            <div class="value">76</div>
            <div class="label">Score</div>
          </div>
          <div class="gauge-indicator" style="--rotation: 76deg"></div>
          <div class="gauge-scale">
            <div class="scale-marker low">0</div>
            <div class="scale-marker medium">50</div>
            <div class="scale-marker high">100</div>
          </div>
        </div>
        <div class="risk-breakdown">
          <div class="breakdown-item">
            <div class="item-label">Exposition Externe</div>
            <div class="item-bar">
              <div class="bar-fill" style="width: 85%"></div>
            </div>
            <div class="item-value">85%</div>
          </div>
          <div class="breakdown-item">
            <div class="item-label">Vulnérabilités</div>
            <div class="item-bar">
              <div class="bar-fill" style="width: 62%"></div>
            </div>
            <div class="item-value">62%</div>
          </div>
          <div class="breakdown-item">
            <div class="item-label">Configuration</div>
            <div class="item-bar">
              <div class="bar-fill" style="width: 78%"></div>
            </div>
            <div class="item-value">78%</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .risk-score-container {
      padding: 16px;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    
    h3 {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
    }
    
    .chart-controls {
      display: flex;
      gap: 8px;
    }
    
    .control-button {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border: 1px solid #e0e0e0;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
    }
    
    .chart-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    
    .gauge-chart {
      position: relative;
      height: 150px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .gauge-value {
      position: relative;
      z-index: 2;
      text-align: center;
    }
    
    .value {
      font-size: 36px;
      font-weight: 700;
      color: #333;
    }
    
    .label {
      font-size: 14px;
      color: #666;
    }
    
    .gauge-indicator {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 50%;
      background: conic-gradient(
        #4CAF50 0deg,
        #4CAF50 calc(var(--rotation) * 1.8deg),
        #e0e0e0 calc(var(--rotation) * 1.8deg),
        #e0e0e0 180deg
      );
      clip-path: polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%);
      transform: rotate(-90deg);
    }
    
    .gauge-scale {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-between;
      padding: 0 10%;
    }
    
    .scale-marker {
      font-size: 12px;
      color: #666;
    }
    
    .risk-breakdown {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .breakdown-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .item-label {
      width: 120px;
      font-size: 14px;
    }
    
    .item-bar {
      flex: 1;
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .bar-fill {
      height: 100%;
      background: #4CAF50;
      border-radius: 4px;
    }
    
    .item-value {
      width: 40px;
      text-align: right;
      font-size: 14px;
      font-weight: 500;
    }
  `]
})
export class RiskScoreComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {
  }
}
