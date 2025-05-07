import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-attack-surface',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="attack-surface-container">
      <div class="chart-header">
        <h3>Carte de Surface d'Attaque</h3>
        <div class="chart-controls">
          <button class="control-button">
            <span class="icon">⚙️</span>
            <span>Filtres</span>
          </button>
          <button class="control-button">
            <span class="icon">↗️</span>
            <span>Exporter</span>
          </button>
        </div>
      </div>
      <div class="chart-content">
        <div class="placeholder-chart">
          <div class="placeholder-text">Carte de Surface d'Attaque</div>
          <div class="placeholder-subtext">Visualisation interactive des actifs et de leurs relations</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .attack-surface-container {
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
      background: #f9f9f9;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .placeholder-chart {
      text-align: center;
      color: #666;
    }
    
    .placeholder-text {
      font-size: 18px;
      font-weight: 500;
      margin-bottom: 8px;
    }
    
    .placeholder-subtext {
      font-size: 14px;
      opacity: 0.7;
    }
  `]
})
export class AttackSurfaceComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {
  }
}
