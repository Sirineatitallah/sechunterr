import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-active-playbooks',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="visualization-container">
      <div class="chart-placeholder">
        <h3>Playbooks Actifs</h3>
        <div class="chart-area">
          <div class="playbooks-list">
            <div class="playbook-item" *ngFor="let playbook of playbooks">
              <div class="playbook-header">
                <div class="playbook-name">{{ playbook.name }}</div>
                <div class="playbook-status" [ngClass]="playbook.status">{{ playbook.status }}</div>
              </div>
              <div class="playbook-progress">
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="playbook.progress"></div>
                </div>
                <div class="progress-value">{{ playbook.progress }}%</div>
              </div>
              <div class="playbook-details">
                <div class="detail-item">
                  <div class="detail-label">Incident</div>
                  <div class="detail-value">{{ playbook.incident }}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Étapes</div>
                  <div class="detail-value">{{ playbook.completedSteps }}/{{ playbook.totalSteps }}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Temps</div>
                  <div class="detail-value">{{ playbook.timeElapsed }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="playbooks-summary">
            <div class="summary-item">
              <div class="summary-value">{{ totalPlaybooks }}</div>
              <div class="summary-label">Total Playbooks</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">{{ automatedActions }}</div>
              <div class="summary-label">Actions Automatisées</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">{{ manualActions }}</div>
              <div class="summary-label">Actions Manuelles</div>
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
      justify-content: space-between;
    }
    
    .playbooks-list {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .playbook-item {
      background-color: white;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    
    .playbook-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    
    .playbook-name {
      font-weight: 600;
    }
    
    .playbook-status {
      font-size: 12px;
      font-weight: 500;
      padding: 4px 8px;
      border-radius: 4px;
    }
    
    .playbook-status.running {
      background-color: rgba(33, 150, 243, 0.1);
      color: #1976d2;
    }
    
    .playbook-status.waiting {
      background-color: rgba(255, 152, 0, 0.1);
      color: #ef6c00;
    }
    
    .playbook-status.completed {
      background-color: rgba(76, 175, 80, 0.1);
      color: #388e3c;
    }
    
    .playbook-progress {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    
    .progress-bar {
      flex: 1;
      height: 8px;
      background-color: rgba(0, 0, 0, 0.1);
      border-radius: 4px;
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      background-color: #2196f3;
      border-radius: 4px;
    }
    
    .progress-value {
      font-size: 12px;
      font-weight: 500;
      min-width: 36px;
      text-align: right;
    }
    
    .playbook-details {
      display: flex;
      justify-content: space-between;
    }
    
    .detail-item {
      text-align: center;
    }
    
    .detail-label {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
      margin-bottom: 4px;
    }
    
    .detail-value {
      font-size: 14px;
      font-weight: 500;
    }
    
    .playbooks-summary {
      display: flex;
      justify-content: space-between;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
    }
    
    .summary-item {
      text-align: center;
    }
    
    .summary-value {
      font-size: 20px;
      font-weight: 700;
      color: #2196f3;
    }
    
    .summary-label {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }
  `]
})
export class ActivePlaybooksComponent {
  playbooks = [
    {
      name: 'Malware Containment',
      status: 'running',
      progress: 75,
      incident: 'INC-002',
      completedSteps: 6,
      totalSteps: 8,
      timeElapsed: '45m'
    },
    {
      name: 'Phishing Response',
      status: 'completed',
      progress: 100,
      incident: 'INC-003',
      completedSteps: 5,
      totalSteps: 5,
      timeElapsed: '1h 20m'
    },
    {
      name: 'Unauthorized Access',
      status: 'running',
      progress: 30,
      incident: 'INC-001',
      completedSteps: 3,
      totalSteps: 10,
      timeElapsed: '15m'
    },
    {
      name: 'Vulnerability Patching',
      status: 'waiting',
      progress: 0,
      incident: 'INC-004',
      completedSteps: 0,
      totalSteps: 6,
      timeElapsed: '0m'
    }
  ];
  
  get totalPlaybooks(): number {
    return this.playbooks.length;
  }
  
  get automatedActions(): number {
    return 14;
  }
  
  get manualActions(): number {
    return 5;
  }
}
