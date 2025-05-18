import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-severity-distribution',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="severity-distribution-container">
      <div class="chart-header">
        <h3>Distribution des Sévérités</h3>
        <div class="chart-controls">
          <button class="control-button">
            <span class="icon">⚙️</span>
            <span>Filtres</span>
          </button>
        </div>
      </div>
      <div class="chart-content">
        <div class="severity-bars">
          <div class="severity-bar-group">
            <div class="severity-label">Critique</div>
            <div class="severity-bar-container">
              <div class="severity-bar critical" style="width: 25%"></div>
            </div>
            <div class="severity-count">186</div>
          </div>
          <div class="severity-bar-group">
            <div class="severity-label">Élevée</div>
            <div class="severity-bar-container">
              <div class="severity-bar high" style="width: 45%"></div>
            </div>
            <div class="severity-count">342</div>
          </div>
          <div class="severity-bar-group">
            <div class="severity-label">Moyenne</div>
            <div class="severity-bar-container">
              <div class="severity-bar medium" style="width: 65%"></div>
            </div>
            <div class="severity-count">487</div>
          </div>
          <div class="severity-bar-group">
            <div class="severity-label">Faible</div>
            <div class="severity-bar-container">
              <div class="severity-bar low" style="width: 30%"></div>
            </div>
            <div class="severity-count">232</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .severity-distribution-container {
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
      align-items: center;
    }

    .severity-bars {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .severity-bar-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .severity-label {
      width: 80px;
      font-size: 14px;
    }

    .severity-bar-container {
      flex: 1;
      height: 24px;
      background: #f5f5f5;
      border-radius: 4px;
      overflow: hidden;
    }

    .severity-bar {
      height: 100%;
      border-radius: 4px;

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

    .severity-count {
      width: 50px;
      text-align: right;
      font-weight: 500;
    }
  `]
})
export class SeverityDistributionComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {
  }
}
