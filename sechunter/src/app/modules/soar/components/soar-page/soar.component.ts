import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

// Interfaces
interface TimeRange {
  id: string;
  label: string;
}

interface IncidentSummary {
  totalIncidents: number;
  criticalIncidents: number;
  openIncidents: number;
  resolvedIncidents: number;
  trend: number;
}

interface User {
  id: string;
  name: string;
  color: string;
}

interface Incident {
  id: string;
  title: string;
  severity: string;
  status: string;
  assignee: User;
  timeElapsed: string;
}

interface Playbook {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  executionCount: number;
  successRate: number;
  avgTime: string;
}

interface MetricData {
  value: number;
  trend: number;
  history: number[];
}

interface IncidentType {
  name: string;
  percentage: number;
  color: string;
}

interface Analytics {
  responseTime: MetricData;
  automationRate: MetricData;
  mttr: MetricData;
  incidentTypes: IncidentType[];
}

@Component({
  selector: 'app-soar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './soar.component.html',
  styleUrl: './soar.component.scss'
})
export class SoarComponent implements OnInit {
  // Time ranges
  timeRanges: TimeRange[] = [
    { id: '7d', label: '7 jours' },
    { id: '30d', label: '30 jours' },
    { id: '6m', label: '6 mois' },
    { id: '1y', label: '1 an' }
  ];
  selectedTimeRange: string = '7d';

  // Incident summary
  incidentSummary: IncidentSummary = {
    totalIncidents: 0,
    criticalIncidents: 0,
    openIncidents: 0,
    resolvedIncidents: 0,
    trend: 0
  };

  // Active incidents
  activeIncidents: Incident[] = [];

  // Playbooks
  playbooks: Playbook[] = [];

  // Analytics
  analytics: Analytics = {
    responseTime: { value: 0, trend: 0, history: [] },
    automationRate: { value: 0, trend: 0, history: [] },
    mttr: { value: 0, trend: 0, history: [] },
    incidentTypes: []
  };

  constructor() { }

  ngOnInit(): void {
    // Initialize mock data
    this.initMockData();
  }

  // Set time range
  setTimeRange(rangeId: string): void {
    this.selectedTimeRange = rangeId;
    // Refresh data based on new time range
    this.refreshAll();
  }

  // Refresh all data
  refreshAll(): void {
    // In a real application, this would call APIs to refresh data
    console.log('Refreshing all data for time range:', this.selectedTimeRange);
    this.initMockData(); // For demo, just reinitialize mock data
  }

  // Get max value from history array for charts
  getMaxHistoryValue(history: number[]): number {
    return Math.max(...history, 1); // Ensure we don't divide by zero
  }

  // Get segment rotation for donut chart
  getSegmentRotation(index: number): number {
    if (index === 0) return 0;

    let totalAngle = 0;
    const total = this.analytics.incidentTypes.reduce((sum, type) => sum + type.percentage, 0);

    for (let i = 0; i < index; i++) {
      totalAngle += (this.analytics.incidentTypes[i].percentage / total) * 360;
    }

    return totalAngle;
  }

  // Get segment path for donut chart
  getSegmentPath(index: number): string {
    const total = this.analytics.incidentTypes.reduce((sum, type) => sum + type.percentage, 0);
    const percentage = this.analytics.incidentTypes[index].percentage / total;
    const angle = percentage * 360;

    // For simplicity, we're just returning a basic path
    // In a real implementation, this would calculate the actual SVG path
    if (angle <= 90) {
      return '100% 0%';
    } else if (angle <= 180) {
      return '100% 100%';
    } else if (angle <= 270) {
      return '0% 100%';
    } else {
      return '0% 0%';
    }
  }

  // Initialize mock data for demo
  private initMockData(): void {
    // Mock incident summary
    this.incidentSummary = {
      totalIncidents: 124,
      criticalIncidents: 18,
      openIncidents: 42,
      resolvedIncidents: 82,
      trend: -12
    };

    // Mock active incidents
    this.activeIncidents = [
      {
        id: 'INC-1024',
        title: 'Tentative d\'accès non autorisé au serveur de production',
        severity: 'critical',
        status: 'investigating',
        assignee: { id: 'u1', name: 'Thomas Dubois', color: '#4a90e2' },
        timeElapsed: '1h 24m'
      },
      {
        id: 'INC-1023',
        title: 'Alerte de malware détectée sur poste de travail',
        severity: 'high',
        status: 'in-progress',
        assignee: { id: 'u2', name: 'Sophie Martin', color: '#50e3c2' },
        timeElapsed: '2h 15m'
      },
      {
        id: 'INC-1022',
        title: 'Activité suspecte sur compte administrateur',
        severity: 'medium',
        status: 'pending',
        assignee: { id: 'u3', name: 'Jean Dupont', color: '#f5a623' },
        timeElapsed: '3h 42m'
      },
      {
        id: 'INC-1021',
        title: 'Tentative de phishing détectée',
        severity: 'high',
        status: 'in-progress',
        assignee: { id: 'u4', name: 'Marie Leroy', color: '#9013fe' },
        timeElapsed: '4h 10m'
      },
      {
        id: 'INC-1020',
        title: 'Anomalie de trafic réseau détectée',
        severity: 'medium',
        status: 'investigating',
        assignee: { id: 'u1', name: 'Thomas Dubois', color: '#4a90e2' },
        timeElapsed: '5h 35m'
      }
    ];

    // Mock playbooks
    this.playbooks = [
      {
        id: 'pb1',
        name: 'Réponse Malware',
        description: 'Automatise la réponse aux incidents de malware',
        icon: 'security',
        color: '#4a90e2',
        executionCount: 42,
        successRate: 94,
        avgTime: '12m'
      },
      {
        id: 'pb2',
        name: 'Analyse Phishing',
        description: 'Analyse et contient les tentatives de phishing',
        icon: 'email',
        color: '#50e3c2',
        executionCount: 78,
        successRate: 89,
        avgTime: '8m'
      },
      {
        id: 'pb3',
        name: 'Accès Non Autorisé',
        description: 'Détecte et bloque les accès non autorisés',
        icon: 'lock',
        color: '#f5a623',
        executionCount: 36,
        successRate: 92,
        avgTime: '15m'
      },
      {
        id: 'pb4',
        name: 'Scan Vulnérabilités',
        description: 'Analyse et corrige les vulnérabilités',
        icon: 'bug_report',
        color: '#9013fe',
        executionCount: 24,
        successRate: 87,
        avgTime: '22m'
      }
    ];

    // Mock analytics
    this.analytics = {
      responseTime: {
        value: 8,
        trend: -15,
        history: [18, 15, 12, 10, 9, 8]
      },
      automationRate: {
        value: 78,
        trend: 12,
        history: []
      },
      mttr: {
        value: 3.5,
        trend: -22,
        history: [6.2, 5.8, 5.1, 4.5, 4.0, 3.5]
      },
      incidentTypes: [
        { name: 'Malware', percentage: 35, color: '#4a90e2' },
        { name: 'Phishing', percentage: 25, color: '#50e3c2' },
        { name: 'Accès Non Autorisé', percentage: 20, color: '#f5a623' },
        { name: 'Vulnérabilités', percentage: 15, color: '#9013fe' },
        { name: 'Autres', percentage: 5, color: '#b8e986' }
      ]
    };
  }
}
