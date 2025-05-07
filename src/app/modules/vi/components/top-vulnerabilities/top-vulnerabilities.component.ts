import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Vulnerability {
  id: string;
  name: string;
  severity: string;
  cvss: number;
  affected: number;
  remediated: number;
  description: string;
  discoveryDate: string;
}

@Component({
  selector: 'app-top-vulnerabilities',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="visualization-container">
      <div class="chart-placeholder">
        <div class="header">
          <h3>Top Vulnérabilités</h3>
          <div class="actions">
            <button class="action-button" title="Filtrer">
              <i class="material-icons">filter_list</i>
            </button>
            <button class="action-button" title="Exporter">
              <i class="material-icons">download</i>
            </button>
          </div>
        </div>

        <div class="chart-area">
          <div class="bar-chart">
            <div
              *ngFor="let vuln of vulnerabilities"
              class="bar"
              [style.height]="getBarHeight(vuln.cvss)"
              [style.background]="getSeverityColor(vuln.severity)"
              [title]="getTooltip(vuln)"
              (click)="showDetails(vuln, $event)"
            >
              <div class="bar-content">
                <span class="bar-value">{{ vuln.cvss.toFixed(1) }}</span>
              </div>
              <span class="bar-label">{{ vuln.id }}</span>

              <!-- Tooltip -->
              <div class="tooltip">
                <div class="tooltip-header">
                  <span class="tooltip-title">{{ vuln.id }}</span>
                  <span class="severity-badge" [class]="'severity-' + vuln.severity.toLowerCase()">
                    {{ vuln.severity }}
                  </span>
                </div>
                <div class="tooltip-body">
                  <p class="tooltip-name">{{ vuln.name }}</p>
                  <div class="tooltip-stats">
                    <div class="tooltip-stat">
                      <span class="stat-label">CVSS:</span>
                      <span class="stat-value">{{ vuln.cvss.toFixed(1) }}</span>
                    </div>
                    <div class="tooltip-stat">
                      <span class="stat-label">Affectés:</span>
                      <span class="stat-value">{{ vuln.affected }}</span>
                    </div>
                    <div class="tooltip-stat">
                      <span class="stat-label">Corrigés:</span>
                      <span class="stat-value">{{ vuln.remediated }}</span>
                    </div>
                  </div>
                  <div class="remediation-progress">
                    <div class="progress-label">
                      <span>Remédiation</span>
                      <span>{{ getRemediationPercentage(vuln).toFixed(0) }}%</span>
                    </div>
                    <div class="progress-bar">
                      <div
                        class="progress-fill"
                        [class]="getRemediationClass(vuln)"
                        [style.width.%]="getRemediationPercentage(vuln)"
                      ></div>
                    </div>
                  </div>
                </div>
                <div class="tooltip-footer">
                  <button class="tooltip-button">Voir détails</button>
                </div>
              </div>
            </div>

            <!-- Fallback when no data -->
            <div *ngIf="vulnerabilities.length === 0" class="no-data-message">
              Aucune donnée disponible
            </div>
          </div>
        </div>

        <div class="vulnerability-details" *ngIf="vulnerabilities.length > 0">
          <table class="vuln-table">
            <thead>
              <tr>
                <th>CVE</th>
                <th>Sévérité</th>
                <th>CVSS</th>
                <th>Affectés</th>
                <th>Corrigés</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let vuln of vulnerabilities" (click)="showDetails(vuln, $event)" class="interactive-row">
                <td>{{ vuln.id }}</td>
                <td>
                  <span class="severity-badge" [class]="'severity-' + vuln.severity.toLowerCase()">
                    {{ vuln.severity }}
                  </span>
                </td>
                <td>{{ vuln.cvss.toFixed(1) }}</td>
                <td>{{ vuln.affected }}</td>
                <td>{{ vuln.remediated }}</td>
                <td>
                  <button class="table-action-button" (click)="showDetails(vuln, $event)">
                    <i class="material-icons">visibility</i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Vulnerability Details Modal -->
    <div class="details-modal" *ngIf="selectedVulnerability" (click)="closeDetails()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="modal-title">
            <h3>{{ selectedVulnerability.id }}</h3>
            <span class="severity-badge" [class]="'severity-' + selectedVulnerability.severity.toLowerCase()">
              {{ selectedVulnerability.severity }}
            </span>
          </div>
          <button class="close-button" (click)="closeDetails()">
            <i class="material-icons">close</i>
          </button>
        </div>

        <div class="modal-body">
          <h4 class="vuln-name">{{ selectedVulnerability.name }}</h4>

          <div class="vuln-meta">
            <div class="meta-item">
              <span class="meta-label">CVSS Score</span>
              <span class="meta-value">{{ selectedVulnerability.cvss.toFixed(1) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Découvert le</span>
              <span class="meta-value">{{ selectedVulnerability.discoveryDate }}</span>
            </div>
          </div>

          <div class="vuln-description">
            <h5>Description</h5>
            <p>{{ selectedVulnerability.description }}</p>
          </div>

          <div class="vuln-stats">
            <div class="stat-card">
              <div class="stat-value">{{ selectedVulnerability.affected }}</div>
              <div class="stat-label">Systèmes affectés</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ selectedVulnerability.remediated }}</div>
              <div class="stat-label">Systèmes corrigés</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ (selectedVulnerability.affected - selectedVulnerability.remediated) }}</div>
              <div class="stat-label">Systèmes vulnérables</div>
            </div>
          </div>

          <div class="remediation-progress">
            <div class="progress-header">
              <h5>Progrès de remédiation</h5>
              <span class="progress-percentage">{{ getRemediationPercentage(selectedVulnerability).toFixed(0) }}%</span>
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill"
                [class]="getRemediationClass(selectedVulnerability)"
                [style.width.%]="getRemediationPercentage(selectedVulnerability)"
              ></div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="action-button secondary" (click)="closeDetails()">Fermer</button>
          <button class="action-button primary">Voir plan de remédiation</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .visualization-container {
      height: 100%;
      padding: 16px;
      overflow: hidden;
    }

    .chart-placeholder {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .actions {
      display: flex;
      gap: 8px;
    }

    .action-button {
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .action-button:hover {
      background-color: rgba(0, 0, 0, 0.05);
      color: #333;
    }

    .action-button i {
      font-size: 18px;
    }

    .chart-area {
      flex: 0 0 180px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      margin-bottom: 30px;
    }

    .bar-chart {
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      width: 100%;
      height: 100%;
      position: relative;
    }

    .bar {
      width: 18%;
      background: linear-gradient(to top, #ff4081, #7c4dff);
      border-radius: 4px 4px 0 0;
      position: relative;
      transition: all 0.3s ease;
      min-height: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      cursor: pointer;
    }

    .bar:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    .bar:hover .tooltip {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .bar-content {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      padding: 4px 0;
    }

    .bar-value {
      font-weight: bold;
      font-size: 14px;
      color: white;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
    }

    .bar-label {
      position: absolute;
      bottom: -25px;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Tooltip styles */
    .tooltip {
      position: absolute;
      bottom: calc(100% + 15px);
      left: 50%;
      transform: translateX(-50%) translateY(10px);
      width: 240px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      padding: 0;
      z-index: 10;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      pointer-events: none;
    }

    .tooltip::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border-width: 8px;
      border-style: solid;
      border-color: white transparent transparent transparent;
    }

    .tooltip-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #eee;
    }

    .tooltip-title {
      font-weight: 600;
      font-size: 14px;
    }

    .tooltip-body {
      padding: 12px 16px;
    }

    .tooltip-name {
      margin: 0 0 12px;
      font-size: 13px;
      color: #333;
    }

    .tooltip-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }

    .tooltip-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .stat-label {
      font-size: 11px;
      color: #666;
    }

    .stat-value {
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }

    .remediation-progress {
      margin-top: 12px;
    }

    .progress-label {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      margin-bottom: 4px;
    }

    .progress-bar {
      height: 6px;
      background-color: #f0f0f0;
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.3s ease;
    }

    .progress-fill.status-good {
      background-color: #00C851;
    }

    .progress-fill.status-medium {
      background-color: #ffbb33;
    }

    .progress-fill.status-poor {
      background-color: #ff4444;
    }

    .tooltip-footer {
      padding: 8px 16px 12px;
      text-align: center;
    }

    .tooltip-button {
      background-color: #f5f5f5;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .tooltip-button:hover {
      background-color: #e0e0e0;
    }

    .no-data-message {
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      text-align: center;
      color: #999;
      transform: translateY(-50%);
    }

    .vulnerability-details {
      flex: 1;
      overflow-y: auto;
      margin-top: 10px;
    }

    .vuln-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .vuln-table th {
      text-align: left;
      padding: 8px;
      border-bottom: 1px solid #eee;
      font-weight: 600;
      color: #666;
    }

    .vuln-table td {
      padding: 8px;
      border-bottom: 1px solid #eee;
    }

    .interactive-row {
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .interactive-row:hover {
      background-color: rgba(0, 0, 0, 0.02);
    }

    .table-action-button {
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .table-action-button:hover {
      background-color: rgba(0, 0, 0, 0.05);
      color: #333;
    }

    .table-action-button i {
      font-size: 16px;
    }

    .severity-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .severity-critical {
      background-color: #ffebee;
      color: #d50000;
    }

    .severity-high {
      background-color: #fff3e0;
      color: #ff6d00;
    }

    .severity-medium {
      background-color: #fffde7;
      color: #ffd600;
    }

    .severity-low {
      background-color: #e8f5e9;
      color: #00c853;
    }

    /* Modal styles */
    .details-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #eee;
    }

    .modal-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .modal-title h3 {
      margin: 0;
      font-size: 18px;
    }

    .close-button {
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .close-button:hover {
      background-color: rgba(0, 0, 0, 0.05);
      color: #333;
    }

    .close-button i {
      font-size: 20px;
    }

    .modal-body {
      padding: 20px;
      overflow-y: auto;
    }

    .vuln-name {
      margin: 0 0 16px;
      font-size: 16px;
      color: #333;
    }

    .vuln-meta {
      display: flex;
      gap: 24px;
      margin-bottom: 20px;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
    }

    .meta-label {
      font-size: 12px;
      color: #666;
    }

    .meta-value {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .vuln-description {
      margin-bottom: 20px;
    }

    .vuln-description h5 {
      margin: 0 0 8px;
      font-size: 14px;
      color: #666;
    }

    .vuln-description p {
      margin: 0;
      font-size: 14px;
      line-height: 1.5;
      color: #333;
    }

    .vuln-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }

    .stat-card {
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }

    .stat-card .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #333;
      margin-bottom: 4px;
    }

    .stat-card .stat-label {
      font-size: 12px;
      color: #666;
    }

    .remediation-progress {
      margin-top: 20px;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .progress-header h5 {
      margin: 0;
      font-size: 14px;
      color: #666;
    }

    .progress-percentage {
      font-size: 14px;
      font-weight: 600;
    }

    .modal-footer {
      padding: 16px 20px;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .action-button {
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .action-button.secondary {
      background-color: #f5f5f5;
      border: 1px solid #ddd;
      color: #333;
    }

    .action-button.secondary:hover {
      background-color: #e0e0e0;
    }

    .action-button.primary {
      background-color: #3f51b5;
      border: 1px solid #3f51b5;
      color: white;
    }

    .action-button.primary:hover {
      background-color: #303f9f;
    }
  `]
})
export class TopVulnerabilitiesComponent implements OnChanges {
  @Input() data: any;

  vulnerabilities: Vulnerability[] = [];
  maxCvss: number = 10;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && changes['data'].currentValue) {
      this.processData(changes['data'].currentValue);
    }
  }

  private processData(data: any): void {
    if (Array.isArray(data)) {
      this.vulnerabilities = data.slice(0, 5);
      this.calculateMaxCvss();
    }
  }

  private calculateMaxCvss(): void {
    if (this.vulnerabilities.length > 0) {
      this.maxCvss = Math.max(...this.vulnerabilities.map(v => v.cvss));
    } else {
      this.maxCvss = 10;
    }
  }

  getBarHeight(cvss: number): string {
    const percentage = (cvss / this.maxCvss) * 100;
    return `${percentage}%`;
  }

  getSeverityColor(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'linear-gradient(to top, #ff1744, #d50000)';
      case 'high':
        return 'linear-gradient(to top, #ff9100, #ff6d00)';
      case 'medium':
        return 'linear-gradient(to top, #ffea00, #ffd600)';
      case 'low':
        return 'linear-gradient(to top, #00e676, #00c853)';
      default:
        return 'linear-gradient(to top, #ff4081, #7c4dff)';
    }
  }

  getTooltip(vulnerability: Vulnerability): string {
    return `${vulnerability.id}: ${vulnerability.name}
CVSS: ${vulnerability.cvss}
Affected: ${vulnerability.affected}
Remediated: ${vulnerability.remediated}`;
  }

  /**
   * Show detailed information for a vulnerability
   */
  selectedVulnerability: Vulnerability | null = null;

  showDetails(vulnerability: Vulnerability, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedVulnerability = vulnerability;
  }

  closeDetails(): void {
    this.selectedVulnerability = null;
  }

  /**
   * Calculate remediation percentage
   */
  getRemediationPercentage(vulnerability: Vulnerability): number {
    if (!vulnerability.affected) return 0;
    return (vulnerability.remediated / vulnerability.affected) * 100;
  }

  /**
   * Get remediation status class
   */
  getRemediationClass(vulnerability: Vulnerability): string {
    const percentage = this.getRemediationPercentage(vulnerability);
    if (percentage >= 75) return 'status-good';
    if (percentage >= 50) return 'status-medium';
    return 'status-poor';
  }
}
