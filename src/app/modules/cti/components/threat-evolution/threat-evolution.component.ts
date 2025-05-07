import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-threat-evolution',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="visualization-container">
      <div class="chart-placeholder">
        <h3>Évolution des Menaces</h3>
        <div class="chart-area">
          <div class="area-chart">
            <svg width="100%" height="100%" viewBox="0 0 600 200" preserveAspectRatio="none">
              <!-- Area chart paths -->
              <path class="area ransomware" d="M0,200 L0,150 L100,140 L200,160 L300,130 L400,120 L500,100 L600,90 L600,200 Z"></path>
              <path class="area phishing" d="M0,200 L0,170 L100,160 L200,180 L300,170 L400,160 L500,150 L600,140 L600,200 Z"></path>
              <path class="area malware" d="M0,200 L0,190 L100,180 L200,190 L300,185 L400,180 L500,175 L600,170 L600,200 Z"></path>
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
          <div class="legend">
            <div class="legend-item">
              <div class="legend-color ransomware"></div>
              <div class="legend-label">Ransomware</div>
            </div>
            <div class="legend-item">
              <div class="legend-color phishing"></div>
              <div class="legend-label">Phishing</div>
            </div>
            <div class="legend-item">
              <div class="legend-color malware"></div>
              <div class="legend-label">Malware</div>
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
    
    .area-chart {
      flex: 1;
      position: relative;
      margin-bottom: 24px;
    }
    
    .area {
      fill-opacity: 0.7;
      transition: all 0.3s ease;
    }
    
    .area:hover {
      fill-opacity: 0.9;
    }
    
    .area.ransomware {
      fill: #ff4081;
    }
    
    .area.phishing {
      fill: #7c4dff;
    }
    
    .area.malware {
      fill: #2196f3;
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
    
    .legend-color.ransomware {
      background-color: #ff4081;
    }
    
    .legend-color.phishing {
      background-color: #7c4dff;
    }
    
    .legend-color.malware {
      background-color: #2196f3;
    }
    
    .legend-label {
      font-size: 12px;
    }
  `]
})
export class ThreatEvolutionComponent {}
