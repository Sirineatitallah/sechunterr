import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-resolution-rate',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="visualization-container">
      <div class="chart-placeholder">
        <h3>Taux de Résolution</h3>
        <div class="chart-area">
          <div class="donut-chart">
            <svg width="100%" height="100%" viewBox="0 0 42 42">
              <circle class="donut-ring" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#e6e6e6" stroke-width="3"></circle>
              
              <circle class="donut-segment" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#4caf50" stroke-width="3" stroke-dasharray="75 25" stroke-dashoffset="25"></circle>
              
              <g class="donut-text">
                <text x="50%" y="50%" class="donut-percent">75%</text>
                <text x="50%" y="50%" class="donut-label">Résolus</text>
              </g>
            </svg>
          </div>
          <div class="resolution-stats">
            <div class="stat-item">
              <div class="stat-value">24</div>
              <div class="stat-label">Incidents Totaux</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">18</div>
              <div class="stat-label">Résolus</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">6</div>
              <div class="stat-label">En cours</div>
            </div>
          </div>
          <div class="mttr">
            <div class="mttr-label">Temps moyen de résolution</div>
            <div class="mttr-value">2h 15m</div>
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
      justify-content: space-between;
    }
    
    .donut-chart {
      width: 100%;
      max-width: 150px;
      margin-bottom: 16px;
    }
    
    .donut-ring {
      stroke: #e6e6e6;
    }
    
    .donut-segment {
      stroke: #4caf50;
      stroke-linecap: round;
    }
    
    .donut-text {
      font-family: Arial, sans-serif;
      fill: #333;
    }
    
    .donut-percent {
      font-size: 0.5em;
      font-weight: bold;
      line-height: 1;
      text-anchor: middle;
      transform: translateY(-0.25em);
    }
    
    .donut-label {
      font-size: 0.25em;
      text-transform: uppercase;
      text-anchor: middle;
      transform: translateY(0.7em);
    }
    
    .resolution-stats {
      display: flex;
      justify-content: space-between;
      width: 100%;
      margin-bottom: 16px;
    }
    
    .stat-item {
      text-align: center;
    }
    
    .stat-value {
      font-size: 20px;
      font-weight: 700;
    }
    
    .stat-label {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .mttr {
      text-align: center;
      padding: 12px;
      background-color: rgba(76, 175, 80, 0.1);
      border-radius: 8px;
      width: 100%;
    }
    
    .mttr-label {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
      margin-bottom: 4px;
    }
    
    .mttr-value {
      font-size: 18px;
      font-weight: 700;
      color: #388e3c;
    }
  `]
})
export class ResolutionRateComponent {}
