import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-external-risks',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="external-risks-container">
      <div class="chart-header">
        <h3>Risques Externes</h3>
        <div class="chart-controls">
          <button class="control-button">
            <span class="icon">🔍</span>
            <span>Détails</span>
          </button>
        </div>
      </div>
      <div class="chart-content">
        <div class="risks-list">
          <div class="risk-item high">
            <div class="risk-icon">🔴</div>
            <div class="risk-details">
              <div class="risk-name">Ports Exposés</div>
              <div class="risk-count">12 actifs</div>
            </div>
            <div class="risk-score">85</div>
          </div>
          <div class="risk-item high">
            <div class="risk-icon">🔴</div>
            <div class="risk-details">
              <div class="risk-name">Certificats Expirés</div>
              <div class="risk-count">7 actifs</div>
            </div>
            <div class="risk-score">78</div>
          </div>
          <div class="risk-item medium">
            <div class="risk-icon">🟠</div>
            <div class="risk-details">
              <div class="risk-name">Domaines Non Sécurisés</div>
              <div class="risk-count">5 actifs</div>
            </div>
            <div class="risk-score">65</div>
          </div>
          <div class="risk-item medium">
            <div class="risk-icon">🟠</div>
            <div class="risk-details">
              <div class="risk-name">Services Cloud Exposés</div>
              <div class="risk-count">3 actifs</div>
            </div>
            <div class="risk-score">58</div>
          </div>
          <div class="risk-item low">
            <div class="risk-icon">🟡</div>
            <div class="risk-details">
              <div class="risk-name">Informations Sensibles</div>
              <div class="risk-count">2 actifs</div>
            </div>
            <div class="risk-score">42</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .external-risks-container {
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
    }
    
    .risks-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .risk-item {
      display: flex;
      align-items: center;
      padding: 12px;
      border-radius: 8px;
      background: white;
      border-left: 4px solid transparent;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      
      &.high {
        border-left-color: #f44336;
      }
      
      &.medium {
        border-left-color: #ff9800;
      }
      
      &.low {
        border-left-color: #ffc107;
      }
    }
    
    .risk-icon {
      margin-right: 12px;
      font-size: 18px;
    }
    
    .risk-details {
      flex: 1;
      
      .risk-name {
        font-weight: 500;
        margin-bottom: 4px;
      }
      
      .risk-count {
        font-size: 12px;
        color: #666;
      }
    }
    
    .risk-score {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
    }
  `]
})
export class ExternalRisksComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {
  }
}
