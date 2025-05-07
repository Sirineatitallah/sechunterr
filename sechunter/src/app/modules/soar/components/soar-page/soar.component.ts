import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { GlobalDataService, SecurityIncident } from '../../../../core/services/global-data.service';

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

// Map from SecurityIncident to Incident
function mapSecurityIncidentToIncident(incident: SecurityIncident, users: User[]): Incident {
  // Assign a random user for demo purposes
  const randomUser = users[Math.floor(Math.random() * users.length)];

  // Calculate time elapsed
  const now = new Date();
  const incidentTime = new Date(incident.timestamp);
  const diffMs = now.getTime() - incidentTime.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const timeElapsed = `${diffHrs}h ${diffMins}m`;

  return {
    id: incident.id,
    title: incident.title,
    severity: incident.severity,
    status: incident.status,
    assignee: randomUser,
    timeElapsed: timeElapsed
  };
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
    MatTooltipModule,
    RouterModule
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

  constructor(private globalDataService: GlobalDataService) { }

  ngOnInit(): void {
    // Subscribe to global data service for incidents
    this.globalDataService.incidents$.subscribe(incidents => {
      // Get mock users for assignees
      const mockUsers = this.getMockUsers();

      // Map security incidents to our incident format
      this.activeIncidents = incidents
        .filter(incident => incident.status !== 'resolved')
        .map(incident => mapSecurityIncidentToIncident(incident, mockUsers));

      // Update incident summary
      this.updateIncidentSummary(incidents);
    });

    // Initialize other mock data
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
    // Refresh global data
    this.globalDataService.refreshAllData();

    // Refresh local data
    console.log('Refreshing all data for time range:', this.selectedTimeRange);
    this.initMockData(); // For demo, just reinitialize mock data for non-global data
  }

  // Get mock users for assignees
  private getMockUsers(): User[] {
    return [
      { id: 'u1', name: 'Thomas Dubois', color: '#4a90e2' },
      { id: 'u2', name: 'Sophie Martin', color: '#50e3c2' },
      { id: 'u3', name: 'Jean Dupont', color: '#f5a623' },
      { id: 'u4', name: 'Marie Leroy', color: '#9013fe' }
    ];
  }

  // Update incident summary based on incidents
  private updateIncidentSummary(incidents: SecurityIncident[]): void {
    const totalIncidents = incidents.length;
    const criticalIncidents = incidents.filter(i => i.severity === 'critical').length;
    const openIncidents = incidents.filter(i => i.status !== 'resolved').length;
    const resolvedIncidents = incidents.filter(i => i.status === 'resolved').length;

    this.incidentSummary = {
      totalIncidents,
      criticalIncidents,
      openIncidents,
      resolvedIncidents,
      trend: -12 // Mock trend for demo
    };
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
    // We no longer need to mock incidents as they come from the global service
    // Only initialize data that's specific to this component

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
