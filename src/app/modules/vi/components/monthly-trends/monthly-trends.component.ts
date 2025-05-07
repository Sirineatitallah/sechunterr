import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-monthly-trends',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="visualization-container">
      <div class="chart-placeholder">
        <h3>Tendances Mensuelles</h3>
        <div class="chart-area">
          <div class="line-chart">
            <div class="chart-grid">
              <div class="grid-line" *ngFor="let i of [0,1,2,3,4]"></div>
            </div>
            <div class="chart-lines">
              <svg width="100%" height="100%" viewBox="0 0 600 200" preserveAspectRatio="none">
                <!-- Critical vulnerabilities line -->
                <path class="line critical" d="M0,180 L100,150 L200,170 L300,120 L400,100 L500,80 L600,60"></path>
                
                <!-- High vulnerabilities line -->
                <path class="line high" d="M0,160 L100,170 L200,150 L300,140 L400,130 L500,120 L600,110"></path>
                
                <!-- Medium vulnerabilities line -->
                <path class="line medium" d="M0,140 L100,130 L200,140 L300,130 L400,140 L500,130 L600,120"></path>
                
                <!-- Low vulnerabilities line -->
                <path class="line low" d="M0,120 L100,110 L200,120 L300,110 L400,120 L500,110 L600,100"></path>
              </svg>
            </div>
            <div class="chart-labels">
              <div class="month-label">Jan</div>
              <div class="month-label">Fév</div>
              <div class="month-label">Mar</div>
              <div class="month-label">Avr</div>
              <div class="month-label">Mai</div>
              <div class="month-label">Juin</div>
            </div>
          </div>
          <div class="legend">
            <div class="legend-item">
              <div class="legend-color critical"></div>
              <div class="legend-label">Critique</div>
            </div>
            <div class="legend-item">
              <div class="legend-color high"></div>
              <div class="legend-label">Haute</div>
            </div>
            <div class="legend-item">
              <div class="legend-color medium"></div>
              <div class="legend-label">Moyenne</div>
            </div>
            <div class="legend-item">
              <div class="legend-color low"></div>
              <div class="legend-label">Basse</div>
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
    }
    
    .line-chart {
      flex: 1;
      position: relative;
      margin-bottom: 24px;
    }
    
    .chart-grid {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    
    .grid-line {
      width: 100%;
      height: 1px;
      background-color: rgba(0, 0, 0, 0.1);
    }
    
    .chart-lines {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    
    .line {
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    
    .line.critical {
      stroke: #ff4444;
    }
    
    .line.high {
      stroke: #ffbb33;
    }
    
    .line.medium {
      stroke: #00C851;
    }
    
    .line.low {
      stroke: #33b5e5;
    }
    
    .chart-labels {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
    }
    
    .month-label {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .legend {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-top: 8px;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }
    
    .legend-color.critical {
      background-color: #ff4444;
    }
    
    .legend-color.high {
      background-color: #ffbb33;
    }
    
    .legend-color.medium {
      background-color: #00C851;
    }
    
    .legend-color.low {
      background-color: #33b5e5;
    }
    
    .legend-label {
      font-size: 12px;
    }
  `]
})
export class MonthlyTrendsComponent {}
