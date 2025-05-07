import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-threat-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="visualization-container">
      <div class="chart-placeholder">
        <h3>Carte des Menaces</h3>
        <div class="chart-area">
          <div class="world-map">
            <!-- Simplified world map SVG -->
            <svg viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet">
              <path class="continent" d="M250,100 L350,100 L400,150 L350,200 L250,200 L200,150 Z" />
              <path class="continent" d="M500,150 L600,150 L650,200 L600,250 L500,250 L450,200 Z" />
              <path class="continent" d="M700,200 L800,200 L850,250 L800,300 L700,300 L650,250 Z" />
              <path class="continent" d="M300,300 L400,300 L450,350 L400,400 L300,400 L250,350 Z" />
              
              <!-- Threat hotspots -->
              <circle class="threat-point high" cx="300" cy="150" r="10" />
              <circle class="threat-point critical" cx="550" cy="200" r="15" />
              <circle class="threat-point medium" cx="750" cy="250" r="8" />
              <circle class="threat-point high" cx="350" cy="350" r="12" />
              <circle class="threat-point low" cx="450" cy="180" r="6" />
            </svg>
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
    
    .world-map {
      flex: 1;
      background-color: #f0f8ff;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .continent {
      fill: #e0e0e0;
      stroke: #ffffff;
      stroke-width: 1;
    }
    
    .threat-point {
      opacity: 0.7;
      transition: all 0.3s ease;
    }
    
    .threat-point:hover {
      opacity: 1;
      transform: scale(1.2);
    }
    
    .threat-point.critical {
      fill: #ff4444;
    }
    
    .threat-point.high {
      fill: #ffbb33;
    }
    
    .threat-point.medium {
      fill: #00C851;
    }
    
    .threat-point.low {
      fill: #33b5e5;
    }
    
    .legend {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-top: 16px;
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
export class ThreatMapComponent {}
