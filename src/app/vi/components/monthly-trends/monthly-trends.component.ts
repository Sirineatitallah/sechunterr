import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-monthly-trends',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="monthly-trends-container">
      <div class="chart-header">
        <h3>Tendances Mensuelles</h3>
        <div class="chart-controls">
          <button class="control-button">
            <span class="icon">📊</span>
            <span>Détails</span>
          </button>
        </div>
      </div>
      <div class="chart-content">
        <div class="trend-chart">
          <div class="chart-y-axis">
            <div class="axis-label">200</div>
            <div class="axis-label">150</div>
            <div class="axis-label">100</div>
            <div class="axis-label">50</div>
            <div class="axis-label">0</div>
          </div>
          <div class="chart-bars">
            <div class="month-group">
              <div class="bar-container">
                <div class="bar-stack">
                  <div class="bar critical" style="height: 15%"></div>
                  <div class="bar high" style="height: 25%"></div>
                  <div class="bar medium" style="height: 35%"></div>
                  <div class="bar low" style="height: 15%"></div>
                </div>
              </div>
              <div class="month-label">Jan</div>
            </div>
            <div class="month-group">
              <div class="bar-container">
                <div class="bar-stack">
                  <div class="bar critical" style="height: 20%"></div>
                  <div class="bar high" style="height: 30%"></div>
                  <div class="bar medium" style="height: 25%"></div>
                  <div class="bar low" style="height: 10%"></div>
                </div>
              </div>
              <div class="month-label">Fév</div>
            </div>
            <div class="month-group">
              <div class="bar-container">
                <div class="bar-stack">
                  <div class="bar critical" style="height: 25%"></div>
                  <div class="bar high" style="height: 35%"></div>
                  <div class="bar medium" style="height: 20%"></div>
                  <div class="bar low" style="height: 10%"></div>
                </div>
              </div>
              <div class="month-label">Mar</div>
            </div>
            <div class="month-group">
              <div class="bar-container">
                <div class="bar-stack">
                  <div class="bar critical" style="height: 15%"></div>
                  <div class="bar high" style="height: 25%"></div>
                  <div class="bar medium" style="height: 30%"></div>
                  <div class="bar low" style="height: 20%"></div>
                </div>
              </div>
              <div class="month-label">Avr</div>
            </div>
            <div class="month-group">
              <div class="bar-container">
                <div class="bar-stack">
                  <div class="bar critical" style="height: 10%"></div>
                  <div class="bar high" style="height: 20%"></div>
                  <div class="bar medium" style="height: 40%"></div>
                  <div class="bar low" style="height: 25%"></div>
                </div>
              </div>
              <div class="month-label">Mai</div>
            </div>
            <div class="month-group">
              <div class="bar-container">
                <div class="bar-stack">
                  <div class="bar critical" style="height: 5%"></div>
                  <div class="bar high" style="height: 15%"></div>
                  <div class="bar medium" style="height: 45%"></div>
                  <div class="bar low" style="height: 30%"></div>
                </div>
              </div>
              <div class="month-label">Juin</div>
            </div>
          </div>
        </div>
        <div class="trend-legend">
          <div class="legend-item">
            <div class="legend-color critical"></div>
            <div class="legend-label">Critique</div>
          </div>
          <div class="legend-item">
            <div class="legend-color high"></div>
            <div class="legend-label">Élevée</div>
          </div>
          <div class="legend-item">
            <div class="legend-color medium"></div>
            <div class="legend-label">Moyenne</div>
          </div>
          <div class="legend-item">
            <div class="legend-color low"></div>
            <div class="legend-label">Faible</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .monthly-trends-container {
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
    }
    
    .trend-chart {
      flex: 1;
      display: flex;
      align-items: stretch;
    }
    
    .chart-y-axis {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding-right: 8px;
      
      .axis-label {
        font-size: 12px;
        color: #666;
      }
    }
    
    .chart-bars {
      flex: 1;
      display: flex;
      justify-content: space-around;
      align-items: flex-end;
      border-bottom: 1px solid #e0e0e0;
      border-left: 1px solid #e0e0e0;
      padding-top: 8px;
      position: relative;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background: linear-gradient(to bottom, transparent 0%, transparent 20%, rgba(0,0,0,0.02) 20%, rgba(0,0,0,0.02) 40%, transparent 40%, transparent 60%, rgba(0,0,0,0.02) 60%, rgba(0,0,0,0.02) 80%, transparent 80%, transparent 100%);
        pointer-events: none;
      }
    }
    
    .month-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 40px;
    }
    
    .bar-container {
      height: 150px;
      width: 100%;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }
    
    .bar-stack {
      width: 24px;
      height: 100%;
      display: flex;
      flex-direction: column-reverse;
    }
    
    .bar {
      width: 100%;
      
      &.critical {
        background: #f44336;
      }
      
      &.high {
        background: #ff9800;
      }
      
      &.medium {
        background: #2196f3;
      }
      
      &.low {
        background: #4caf50;
      }
    }
    
    .month-label {
      margin-top: 8px;
      font-size: 12px;
    }
    
    .trend-legend {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-top: 16px;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
      
      &.critical {
        background: #f44336;
      }
      
      &.high {
        background: #ff9800;
      }
      
      &.medium {
        background: #2196f3;
      }
      
      &.low {
        background: #4caf50;
      }
    }
    
    .legend-label {
      font-size: 12px;
    }
  `]
})
export class MonthlyTrendsComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {
  }
}
