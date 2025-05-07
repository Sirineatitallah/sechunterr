import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { InstanceManagerService } from '../../../../core/services/instance-manager.service';
import { CommunicationService } from '../../../../core/services/communication.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Instance, ScanType } from '../../../../core/models/instance.model';
import { Communication, CommunicationPriority } from '../../../../core/models/communication.model';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressBarModule,
    MatTableModule,
    MatBadgeModule,
    MatTooltipModule,
    RouterModule
  ],
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.scss']
})
export class ClientDashboardComponent implements OnInit, OnDestroy {
  instances: Instance[] = [];
  communications: Communication[] = [];
  currentUser: User | null = null;

  // Stats
  totalVulnerabilities = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  };

  externalRiskPercentage = 0;
  securityScore = 0;

  // Table columns
  communicationColumns: string[] = ['priority', 'title', 'date', 'actions'];
  vulnerabilityColumns: string[] = ['severity', 'name', 'affected', 'status'];

  // Top vulnerabilities
  topVulnerabilities = [
    { id: 'CVE-2023-1234', name: 'Apache Log4j RCE', severity: 'critical', affected: 'Web Server', status: 'open' },
    { id: 'CVE-2023-5678', name: 'OpenSSL Buffer Overflow', severity: 'high', affected: 'API Gateway', status: 'in-progress' },
    { id: 'CVE-2023-9012', name: 'SQL Injection Vulnerability', severity: 'high', affected: 'Database Server', status: 'open' },
    { id: 'CVE-2023-3456', name: 'Cross-Site Scripting (XSS)', severity: 'medium', affected: 'Web Application', status: 'open' },
    { id: 'CVE-2023-7890', name: 'Insecure Deserialization', severity: 'medium', affected: 'Application Server', status: 'in-progress' }
  ];

  // Threat intel
  threatIntel = [
    { type: 'Ransomware', name: 'BlackCat', relevance: 'high', sector: 'Your Industry', description: 'New variant targeting your sector' },
    { type: 'Phishing', name: 'CredHarvester', relevance: 'medium', sector: 'General', description: 'Sophisticated phishing campaign' },
    { type: 'Zero-Day', name: 'CVE-2024-XXXX', relevance: 'high', sector: 'Your Industry', description: 'Unpatched vulnerability in common software' }
  ];

  private subscriptions: Subscription[] = [];

  constructor(
    private instanceManagerService: InstanceManagerService,
    private communicationService: CommunicationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getDecodedToken();

    // Load instances
    this.subscriptions.push(
      this.instanceManagerService.getInstances().subscribe(instances => {
        this.instances = instances;
        this.calculateStats();
      })
    );

    // Load communications
    this.subscriptions.push(
      this.communicationService.getCommunications().subscribe(communications => {
        this.communications = communications.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private calculateStats(): void {
    // Reset vulnerability counts
    this.totalVulnerabilities = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    // Calculate total vulnerabilities
    this.instances.forEach(instance => {
      if (instance.metrics?.vulnerabilities) {
        this.totalVulnerabilities.critical += instance.metrics.vulnerabilities.critical;
        this.totalVulnerabilities.high += instance.metrics.vulnerabilities.high;
        this.totalVulnerabilities.medium += instance.metrics.vulnerabilities.medium;
        this.totalVulnerabilities.low += instance.metrics.vulnerabilities.low;
      }
    });

    // Calculate external risk percentage (mock calculation)
    this.externalRiskPercentage = 12;

    // Calculate security score (mock calculation)
    const totalVulns = this.totalVulnerabilities.critical + this.totalVulnerabilities.high +
                       this.totalVulnerabilities.medium + this.totalVulnerabilities.low;

    if (totalVulns === 0) {
      this.securityScore = 100;
    } else {
      // Weight vulnerabilities by severity
      const weightedScore = 100 - (
        (this.totalVulnerabilities.critical * 10) +
        (this.totalVulnerabilities.high * 5) +
        (this.totalVulnerabilities.medium * 2) +
        (this.totalVulnerabilities.low * 0.5)
      );

      this.securityScore = Math.max(0, Math.min(100, weightedScore));
    }
  }

  requestScan(instanceId: string, scanType: ScanType = ScanType.QUICK): void {
    this.instanceManagerService.requestScan(instanceId, scanType).subscribe(request => {
      console.log('Scan requested successfully', request);
    });
  }

  markCommunicationAsRead(id: string): void {
    this.communicationService.markAsRead(id).subscribe(() => {
      console.log('Communication marked as read');
    });
  }

  generateReport(): void {
    console.log('Generating PDF report...');
    // In a real implementation, this would call a service to generate a PDF report
    setTimeout(() => {
      alert('Report generated successfully! Downloading PDF...');
    }, 1500);
  }

  getPriorityClass(priority: CommunicationPriority): string {
    switch (priority) {
      case CommunicationPriority.CRITICAL:
        return 'priority-critical';
      case CommunicationPriority.HIGH:
        return 'priority-high';
      case CommunicationPriority.MEDIUM:
        return 'priority-medium';
      case CommunicationPriority.LOW:
        return 'priority-low';
      default:
        return '';
    }
  }

  getUnreadMessagesCount(): number {
    return this.communications.filter(c => !c.read).length;
  }

  getCriticalUnreadMessagesCount(): number {
    return this.communications.filter(c => !c.read && c.priority === 'critical').length;
  }

  getHighUnreadMessagesCount(): number {
    return this.communications.filter(c => !c.read && c.priority === 'high').length;
  }

  getSecurityScoreClass(): string {
    if (this.securityScore >= 80) {
      return 'score-excellent';
    } else if (this.securityScore >= 60) {
      return 'score-good';
    } else if (this.securityScore >= 40) {
      return 'score-fair';
    } else {
      return 'score-poor';
    }
  }

  getSecurityScoreLabel(): string {
    if (this.securityScore >= 80) {
      return 'Excellent';
    } else if (this.securityScore >= 60) {
      return 'Good';
    } else if (this.securityScore >= 40) {
      return 'Fair';
    } else {
      return 'Poor';
    }
  }

  getSeverityClass(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'severity-critical';
      case 'high':
        return 'severity-high';
      case 'medium':
        return 'severity-medium';
      case 'low':
        return 'severity-low';
      default:
        return '';
    }
  }

  getRelevanceClass(relevance: string): string {
    switch (relevance.toLowerCase()) {
      case 'high':
        return 'relevance-high';
      case 'medium':
        return 'relevance-medium';
      case 'low':
        return 'relevance-low';
      default:
        return '';
    }
  }
}
