import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-top-vulnerabilities',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="top-vulnerabilities-container">
      <div class="chart-header">
        <h3>Top Vulnérabilités</h3>
        <div class="chart-controls">
          <button class="control-button">
            <span class="icon">🔍</span>
            <span>Détails</span>
          </button>
        </div>
      </div>
      <div class="chart-content">
        <div class="vulnerabilities-list">
          <div class="vulnerability-item">
            <div class="vulnerability-score critical">9.8</div>
            <div class="vulnerability-details">
              <div class="vulnerability-name">CVE-2023-1234</div>
              <div class="vulnerability-description">Exécution de code à distance dans Apache Log4j</div>
            </div>
            <div class="vulnerability-systems">42 systèmes</div>
          </div>
          <div class="vulnerability-item">
            <div class="vulnerability-score critical">9.4</div>
            <div class="vulnerability-details">
              <div class="vulnerability-name">CVE-2023-7890</div>
              <div class="vulnerability-description">Fuite d'informations dans OpenSSL</div>
            </div>
            <div class="vulnerability-systems">31 systèmes</div>
          </div>
          <div class="vulnerability-item">
            <div class="vulnerability-score critical">9.1</div>
            <div class="vulnerability-details">
              <div class="vulnerability-name">CVE-2023-9012</div>
              <div class="vulnerability-description">Déni de service dans Nginx</div>
            </div>
            <div class="vulnerability-systems">35 systèmes</div>
          </div>
          <div class="vulnerability-item">
            <div class="vulnerability-score high">8.2</div>
            <div class="vulnerability-details">
              <div class="vulnerability-name">CVE-2023-5678</div>
              <div class="vulnerability-description">Vulnérabilité d'injection SQL dans MySQL</div>
            </div>
            <div class="vulnerability-systems">28 systèmes</div>
          </div>
          <div class="vulnerability-item">
            <div class="vulnerability-score high">7.8</div>
            <div class="vulnerability-details">
              <div class="vulnerability-name">CVE-2023-3456</div>
              <div class="vulnerability-description">Élévation de privilèges dans Windows Server</div>
            </div>
            <div class="vulnerability-systems">18 systèmes</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .top-vulnerabilities-container {
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
      overflow-y: auto;
    }

    .vulnerabilities-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .vulnerability-item {
      display: flex;
      align-items: center;
      padding: 12px;
      background: #f9f9f9;
      border-radius: 6px;
      border-left: 4px solid transparent;

      &:hover {
        background: #f5f5f5;
      }
    }

    .vulnerability-score {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
      color: white;
      margin-right: 12px;

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

    .vulnerability-details {
      flex: 1;

      .vulnerability-name {
        font-weight: 500;
        margin-bottom: 4px;
      }

      .vulnerability-description {
        font-size: 13px;
        color: #666;
      }
    }

    .vulnerability-systems {
      font-size: 12px;
      color: #666;
      background: rgba(0, 0, 0, 0.05);
      padding: 4px 8px;
      border-radius: 4px;
    }
  `]
})
export class TopVulnerabilitiesComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {
  }
}
