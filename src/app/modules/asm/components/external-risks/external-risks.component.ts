import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-external-risks',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="visualization-container">
      <div class="chart-placeholder">
        <h3>Risques Externes</h3>
        <div class="chart-area">
          <div class="bar-chart">
            <div class="bar-group">
              <div class="bar-label">Exposition DNS</div>
              <div class="bar-container">
                <div class="bar" style="width: 75%;" title="Exposition DNS: 75%"></div>
              </div>
              <div class="bar-value">75%</div>
            </div>
            <div class="bar-group">
              <div class="bar-label">Certificats Expirés</div>
              <div class="bar-container">
                <div class="bar" style="width: 45%;" title="Certificats Expirés: 45%"></div>
              </div>
              <div class="bar-value">45%</div>
            </div>
            <div class="bar-group">
              <div class="bar-label">Ports Ouverts</div>
              <div class="bar-container">
                <div class="bar" style="width: 60%;" title="Ports Ouverts: 60%"></div>
              </div>
              <div class="bar-value">60%</div>
            </div>
            <div class="bar-group">
              <div class="bar-label">Fuites de Données</div>
              <div class="bar-container">
                <div class="bar" style="width: 30%;" title="Fuites de Données: 30%"></div>
              </div>
              <div class="bar-value">30%</div>
            </div>
            <div class="bar-group">
              <div class="bar-label">Shadow IT</div>
              <div class="bar-container">
                <div class="bar" style="width: 55%;" title="Shadow IT: 55%"></div>
              </div>
              <div class="bar-value">55%</div>
            </div>
          </div>
          <div class="risk-summary">
            <div class="summary-item">
              <div class="summary-value">12</div>
              <div class="summary-label">Domaines exposés</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">8</div>
              <div class="summary-label">Vulnérabilités critiques</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">24</div>
              <div class="summary-label">Actifs exposés</div>
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
    
    .bar-chart {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .bar-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .bar-label {
      width: 120px;
      font-size: 13px;
      text-align: right;
    }
    
    .bar-container {
      flex: 1;
      height: 12px;
      background-color: rgba(0, 0, 0, 0.1);
      border-radius: 6px;
      overflow: hidden;
    }
    
    .bar {
      height: 100%;
      background: linear-gradient(to right, #ff9800, #ff5722);
      border-radius: 6px;
      transition: width 0.5s ease;
    }
    
    .bar-value {
      width: 40px;
      font-size: 13px;
      font-weight: 500;
    }
    
    .risk-summary {
      display: flex;
      justify-content: space-around;
      margin-top: 24px;
    }
    
    .summary-item {
      text-align: center;
    }
    
    .summary-value {
      font-size: 24px;
      font-weight: 700;
      color: #ff5722;
    }
    
    .summary-label {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
      margin-top: 4px;
    }
  `]
})
export class ExternalRisksComponent {}
