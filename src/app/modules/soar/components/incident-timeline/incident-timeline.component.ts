import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-incident-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="visualization-container">
      <div class="chart-placeholder">
        <h3>Timeline des Incidents</h3>
        <div class="chart-area">
          <div class="timeline">
            <div class="timeline-item" *ngFor="let incident of incidents">
              <div class="timeline-point" [ngClass]="incident.severity"></div>
              <div class="timeline-content">
                <div class="incident-header">
                  <div class="incident-id">{{ incident.id }}</div>
                  <div class="incident-time">{{ incident.time }}</div>
                </div>
                <div class="incident-title">{{ incident.title }}</div>
                <div class="incident-details">{{ incident.details }}</div>
                <div class="incident-status" [ngClass]="incident.status">{{ incident.status }}</div>
              </div>
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
      overflow-y: auto;
    }
    
    .timeline {
      position: relative;
      padding-left: 24px;
      border-left: 2px solid rgba(0, 0, 0, 0.1);
    }
    
    .timeline-item {
      position: relative;
      margin-bottom: 24px;
    }
    
    .timeline-point {
      position: absolute;
      left: -31px;
      top: 0;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid white;
    }
    
    .timeline-point.critical {
      background-color: #f44336;
    }
    
    .timeline-point.high {
      background-color: #ff9800;
    }
    
    .timeline-point.medium {
      background-color: #ffeb3b;
    }
    
    .timeline-point.low {
      background-color: #4caf50;
    }
    
    .timeline-content {
      background-color: white;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    
    .incident-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    
    .incident-id {
      font-weight: 600;
      color: rgba(0, 0, 0, 0.7);
    }
    
    .incident-time {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.5);
    }
    
    .incident-title {
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .incident-details {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.7);
      margin-bottom: 12px;
    }
    
    .incident-status {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .incident-status.open {
      background-color: rgba(244, 67, 54, 0.1);
      color: #d32f2f;
    }
    
    .incident-status.investigating {
      background-color: rgba(255, 152, 0, 0.1);
      color: #ef6c00;
    }
    
    .incident-status.contained {
      background-color: rgba(33, 150, 243, 0.1);
      color: #1976d2;
    }
    
    .incident-status.resolved {
      background-color: rgba(76, 175, 80, 0.1);
      color: #388e3c;
    }
  `]
})
export class IncidentTimelineComponent {
  incidents = [
    {
      id: 'INC-001',
      time: '10:30 AM',
      title: 'Tentative d\'accès non autorisé',
      details: 'Détection de multiples tentatives d\'authentification échouées depuis une adresse IP externe.',
      severity: 'high',
      status: 'investigating'
    },
    {
      id: 'INC-002',
      time: '09:15 AM',
      title: 'Malware détecté',
      details: 'Malware détecté sur un poste de travail dans le département comptabilité.',
      severity: 'critical',
      status: 'contained'
    },
    {
      id: 'INC-003',
      time: 'Hier, 18:45',
      title: 'Phishing Campaign',
      details: 'Plusieurs employés ont reçu des emails de phishing ciblés.',
      severity: 'medium',
      status: 'resolved'
    },
    {
      id: 'INC-004',
      time: 'Hier, 14:20',
      title: 'Vulnérabilité critique',
      details: 'Vulnérabilité critique détectée sur le serveur web principal.',
      severity: 'critical',
      status: 'open'
    },
    {
      id: 'INC-005',
      time: '22/05, 11:05',
      title: 'Activité suspecte sur le réseau',
      details: 'Trafic réseau anormal détecté entre deux serveurs internes.',
      severity: 'low',
      status: 'resolved'
    }
  ];
}
