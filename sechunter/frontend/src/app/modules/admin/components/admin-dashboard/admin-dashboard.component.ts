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
import { Instance, ScanRequest, ScanType } from '../../../../core/models/instance.model';
import { Communication, CommunicationPriority } from '../../../../core/models/communication.model';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-admin-dashboard',
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
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  instances: Instance[] = [];
  communications: Communication[] = [];
  scanRequests: ScanRequest[] = [];
  currentUser: User | null = null;

  // Stats
  totalInstances = 0;
  healthyInstances = 0;
  warningInstances = 0;
  criticalInstances = 0;
  offlineInstances = 0;

  totalVulnerabilities = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  };

  // Table columns
  instanceColumns: string[] = ['status', 'name', 'client', 'metrics', 'lastScan', 'actions'];
  communicationColumns: string[] = ['priority', 'title', 'sender', 'date', 'actions'];
  scanRequestColumns: string[] = ['instance', 'type', 'requestedBy', 'date', 'status', 'actions'];

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

    // Load scan requests
    this.subscriptions.push(
      this.instanceManagerService.scanRequests$.subscribe(requests => {
        this.scanRequests = requests.sort((a, b) =>
          new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
        );
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private calculateStats(): void {
    this.totalInstances = this.instances.length;
    this.healthyInstances = this.instances.filter(i => i.status === 'healthy').length;
    this.warningInstances = this.instances.filter(i => i.status === 'warning').length;
    this.criticalInstances = this.instances.filter(i => i.status === 'critical').length;
    this.offlineInstances = this.instances.filter(i => i.status === 'offline').length;

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
  }

  createInstance(): void {
    // Open dialog to create instance
    console.log('Create instance clicked');
  }

  deleteInstance(instanceId: string): void {
    if (confirm('Are you sure you want to delete this instance?')) {
      this.instanceManagerService.deleteInstance(instanceId).subscribe(() => {
        console.log('Instance deleted successfully');
      });
    }
  }

  requestScan(instanceId: string, scanType: ScanType = ScanType.QUICK): void {
    this.instanceManagerService.requestScan(instanceId, scanType).subscribe(request => {
      console.log('Scan requested successfully', request);
    });
  }

  approveScanRequest(requestId: string): void {
    this.instanceManagerService.approveScanRequest(requestId).subscribe(request => {
      console.log('Scan request approved', request);
    });
  }

  markCommunicationAsRead(id: string): void {
    this.communicationService.markAsRead(id).subscribe(() => {
      console.log('Communication marked as read');
    });
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

  getPendingRequestsCount(): number {
    return this.scanRequests.filter(r => r.status === 'pending').length;
  }

  getInProgressRequestsCount(): number {
    return this.scanRequests.filter(r => r.status === 'in_progress').length;
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

  getInstanceName(instanceId: string): string {
    const instance = this.instances.find(i => i.id === instanceId);
    return instance?.name || 'Unknown';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'healthy':
        return 'status-healthy';
      case 'warning':
        return 'status-warning';
      case 'critical':
        return 'status-critical';
      case 'offline':
        return 'status-offline';
      default:
        return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'healthy':
        return '🟢';
      case 'warning':
        return '🟠';
      case 'critical':
        return '🔴';
      case 'offline':
        return '⚫';
      default:
        return '⚪';
    }
  }
}
