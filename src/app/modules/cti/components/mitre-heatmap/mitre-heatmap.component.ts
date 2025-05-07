import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mitre-heatmap',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="visualization-container">
      <div class="chart-placeholder">
        <h3>MITRE ATT&CK Heatmap</h3>
        <div class="chart-area">
          <div class="heatmap">
            <div class="heatmap-row" *ngFor="let row of [0, 1, 2, 3, 4]">
              <div class="heatmap-cell" 
                   *ngFor="let col of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]"
                   [ngClass]="getCellClass(row, col)"
                   [title]="getCellTitle(row, col)">
              </div>
            </div>
          </div>
          <div class="heatmap-labels">
            <div class="row-labels">
              <div class="row-label">Reconnaissance</div>
              <div class="row-label">Initial Access</div>
              <div class="row-label">Execution</div>
              <div class="row-label">Persistence</div>
              <div class="row-label">Privilege Escalation</div>
            </div>
            <div class="col-labels">
              <div class="col-label" *ngFor="let col of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]">T{{ col + 1 }}</div>
            </div>
          </div>
          <div class="legend">
            <div class="legend-item">
              <div class="legend-color level-0"></div>
              <div class="legend-label">Aucune</div>
            </div>
            <div class="legend-item">
              <div class="legend-color level-1"></div>
              <div class="legend-label">Faible</div>
            </div>
            <div class="legend-item">
              <div class="legend-color level-2"></div>
              <div class="legend-label">Moyenne</div>
            </div>
            <div class="legend-item">
              <div class="legend-color level-3"></div>
              <div class="legend-label">Élevée</div>
            </div>
            <div class="legend-item">
              <div class="legend-color level-4"></div>
              <div class="legend-label">Critique</div>
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
    
    .heatmap {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .heatmap-row {
      display: flex;
      gap: 2px;
      flex: 1;
    }
    
    .heatmap-cell {
      flex: 1;
      border-radius: 4px;
      transition: all 0.3s ease;
    }
    
    .heatmap-cell:hover {
      transform: scale(1.1);
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    }
    
    .heatmap-cell.level-0 {
      background-color: #f0f0f0;
    }
    
    .heatmap-cell.level-1 {
      background-color: #b3e5fc;
    }
    
    .heatmap-cell.level-2 {
      background-color: #4fc3f7;
    }
    
    .heatmap-cell.level-3 {
      background-color: #0288d1;
    }
    
    .heatmap-cell.level-4 {
      background-color: #01579b;
    }
    
    .heatmap-labels {
      display: flex;
      margin-top: 16px;
    }
    
    .row-labels {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      margin-right: 16px;
    }
    
    .row-label {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .col-labels {
      flex: 1;
      display: flex;
      justify-content: space-between;
    }
    
    .col-label {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
      text-align: center;
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
    
    .legend-color.level-0 {
      background-color: #f0f0f0;
    }
    
    .legend-color.level-1 {
      background-color: #b3e5fc;
    }
    
    .legend-color.level-2 {
      background-color: #4fc3f7;
    }
    
    .legend-color.level-3 {
      background-color: #0288d1;
    }
    
    .legend-color.level-4 {
      background-color: #01579b;
    }
    
    .legend-label {
      font-size: 12px;
    }
  `]
})
export class MitreHeatmapComponent {
  // Generate random cell classes for demo
  getCellClass(row: number, col: number): string {
    const levels = ['level-0', 'level-1', 'level-2', 'level-3', 'level-4'];
    const randomIndex = Math.floor(Math.random() * levels.length);
    return levels[randomIndex];
  }
  
  // Generate cell titles for demo
  getCellTitle(row: number, col: number): string {
    const tactics = ['Reconnaissance', 'Initial Access', 'Execution', 'Persistence', 'Privilege Escalation'];
    const techniques = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10'];
    return `${tactics[row]} - ${techniques[col]}`;
  }
}
