import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-risk-score',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="visualization-container">
      <div class="chart-placeholder">
        <h3>Score de Risque</h3>
        <div class="chart-area">
          <div class="gauge-container">
            <div class="gauge">
              <div class="gauge-body">
                <div class="gauge-fill" [style.transform]="'rotate(' + getRotation() + 'deg)'"></div>
                <div class="gauge-cover">
                  <div class="gauge-value">{{ riskScore }}</div>
                  <div class="gauge-label">sur 100</div>
                </div>
              </div>
              <div class="gauge-ticks">
                <div class="tick tick-0">0</div>
                <div class="tick tick-25">25</div>
                <div class="tick tick-50">50</div>
                <div class="tick tick-75">75</div>
                <div class="tick tick-100">100</div>
              </div>
            </div>
          </div>
          <div class="risk-details">
            <div class="risk-level" [ngClass]="getRiskLevelClass()">
              {{ getRiskLevelText() }}
            </div>
            <div class="risk-change">
              <span class="change-icon">↑</span>
              <span class="change-value">+5 pts</span>
              <span class="change-period">depuis le mois dernier</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .visualization-container {
      height: 100%;
      padding: 16px;
    }
    
    .chart-placeholder {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    h3 {
      margin-top: 0;
      margin-bottom: 16px;
    }
    
    .chart-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    
    .gauge-container {
      width: 100%;
      max-width: 200px;
      margin-bottom: 24px;
    }
    
    .gauge {
      position: relative;
      width: 100%;
    }
    
    .gauge-body {
      position: relative;
      width: 100%;
      height: 0;
      padding-bottom: 50%;
      background: #e6e6e6;
      border-top-left-radius: 100% 200%;
      border-top-right-radius: 100% 200%;
      overflow: hidden;
    }
    
    .gauge-fill {
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to right, #4caf50, #ffeb3b, #f44336);
      transform-origin: center bottom;
      transform: rotate(0deg);
      transition: transform 0.5s ease-out;
    }
    
    .gauge-cover {
      position: absolute;
      top: 15%;
      left: 25%;
      width: 50%;
      height: 85%;
      background: white;
      border-top-left-radius: 125% 150%;
      border-top-right-radius: 125% 150%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding-bottom: 25%;
      box-shadow: 0 -3px 6px rgba(0, 0, 0, 0.1) inset;
    }
    
    .gauge-value {
      font-size: 28px;
      font-weight: 700;
    }
    
    .gauge-label {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .gauge-ticks {
      position: relative;
      margin-top: 5px;
      width: 100%;
      height: 20px;
      display: flex;
      justify-content: space-between;
    }
    
    .tick {
      font-size: 10px;
      color: rgba(0, 0, 0, 0.6);
      position: relative;
    }
    
    .risk-details {
      text-align: center;
    }
    
    .risk-level {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
      padding: 4px 12px;
      border-radius: 16px;
      display: inline-block;
    }
    
    .risk-level.low {
      background-color: rgba(76, 175, 80, 0.2);
      color: #2e7d32;
    }
    
    .risk-level.medium {
      background-color: rgba(255, 235, 59, 0.2);
      color: #f9a825;
    }
    
    .risk-level.high {
      background-color: rgba(244, 67, 54, 0.2);
      color: #c62828;
    }
    
    .risk-change {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .change-icon {
      color: #f44336;
      margin-right: 4px;
    }
    
    .change-value {
      font-weight: 500;
      color: #f44336;
      margin-right: 4px;
    }
  `]
})
export class RiskScoreComponent {
  riskScore = 68;
  
  getRotation(): number {
    // Convert score to rotation degrees (0-180)
    return (this.riskScore / 100) * 180;
  }
  
  getRiskLevelClass(): string {
    if (this.riskScore < 40) return 'low';
    if (this.riskScore < 70) return 'medium';
    return 'high';
  }
  
  getRiskLevelText(): string {
    if (this.riskScore < 40) return 'Risque Faible';
    if (this.riskScore < 70) return 'Risque Moyen';
    return 'Risque Élevé';
  }
}
