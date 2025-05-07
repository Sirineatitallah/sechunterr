import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-attack-surface',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="visualization-container">
      <div class="chart-placeholder">
        <h3>Surface d'Attaque</h3>
        <div class="chart-area">
          <div class="treemap">
            <div class="treemap-item web-apps" title="Applications Web: 35%">
              <div class="item-label">Applications Web</div>
              <div class="item-value">35%</div>
            </div>
            <div class="treemap-item apis" title="APIs: 25%">
              <div class="item-label">APIs</div>
              <div class="item-value">25%</div>
            </div>
            <div class="treemap-item cloud" title="Cloud: 20%">
              <div class="item-label">Cloud</div>
              <div class="item-value">20%</div>
            </div>
            <div class="treemap-item network" title="Réseau: 15%">
              <div class="item-label">Réseau</div>
              <div class="item-value">15%</div>
            </div>
            <div class="treemap-item other" title="Autres: 5%">
              <div class="item-label">Autres</div>
              <div class="item-value">5%</div>
            </div>
          </div>
          <div class="legend">
            <div class="legend-item">
              <div class="legend-color web-apps"></div>
              <div class="legend-label">Applications Web (35%)</div>
            </div>
            <div class="legend-item">
              <div class="legend-color apis"></div>
              <div class="legend-label">APIs (25%)</div>
            </div>
            <div class="legend-item">
              <div class="legend-color cloud"></div>
              <div class="legend-label">Cloud (20%)</div>
            </div>
            <div class="legend-item">
              <div class="legend-color network"></div>
              <div class="legend-label">Réseau (15%)</div>
            </div>
            <div class="legend-item">
              <div class="legend-color other"></div>
              <div class="legend-label">Autres (5%)</div>
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
    
    .treemap {
      flex: 1;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(2, 1fr);
      gap: 8px;
      margin-bottom: 16px;
    }
    
    .treemap-item {
      border-radius: 8px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: white;
      transition: all 0.3s ease;
      cursor: pointer;
    }
    
    .treemap-item:hover {
      transform: scale(1.02);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .treemap-item.web-apps {
      background-color: #ff5722;
      grid-column: span 2;
      grid-row: span 1;
    }
    
    .treemap-item.apis {
      background-color: #ff9800;
      grid-column: span 1;
      grid-row: span 1;
    }
    
    .treemap-item.cloud {
      background-color: #ffc107;
      grid-column: span 1;
      grid-row: span 1;
    }
    
    .treemap-item.network {
      background-color: #8bc34a;
      grid-column: span 2;
      grid-row: span 1;
    }
    
    .treemap-item.other {
      background-color: #03a9f4;
      grid-column: span 2;
      grid-row: span 1;
    }
    
    .item-label {
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .item-value {
      font-size: 20px;
      font-weight: 700;
    }
    
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
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
    
    .legend-color.web-apps {
      background-color: #ff5722;
    }
    
    .legend-color.apis {
      background-color: #ff9800;
    }
    
    .legend-color.cloud {
      background-color: #ffc107;
    }
    
    .legend-color.network {
      background-color: #8bc34a;
    }
    
    .legend-color.other {
      background-color: #03a9f4;
    }
    
    .legend-label {
      font-size: 12px;
    }
  `]
})
export class AttackSurfaceComponent {}
