import { Component, EventEmitter, OnInit, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { InstanceManagerService } from '../../../core/services/instance-manager.service';
import { AuthService } from '../../../core/services/auth.service';
import { Instance, InstanceStatus, ScanType } from '../../../core/models/instance.model';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-instance-manager',
  templateUrl: './instance-manager.component.html',
  styleUrls: ['./instance-manager.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatDialogModule,
    FormsModule
  ]
})
export class InstanceManagerComponent implements OnInit, OnDestroy {
  instances: Instance[] = [];
  selectedInstance: Instance | null = null;
  isAdmin = false;
  isLoading = true;
  ScanType = ScanType; // Expose enum to template

  private subscriptions: Subscription[] = [];

  @Output() instanceSelected = new EventEmitter<Instance>();
  @Output() createInstance = new EventEmitter<void>();
  @Output() deleteInstance = new EventEmitter<string>();
  @Output() requestScan = new EventEmitter<{instanceId: string, scanType: ScanType}>();

  constructor(
    private instanceManagerService: InstanceManagerService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Check if user is admin
    const user = this.authService.getDecodedToken();
    this.isAdmin = user?.roles?.includes(UserRole.ADMIN) || user?.roles?.includes(UserRole.SUPERUSER);

    // Load instances
    this.subscriptions.push(
      this.instanceManagerService.getInstances().subscribe(instances => {
        this.instances = instances;
        this.isLoading = false;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onCreateInstance(): void {
    this.createInstance.emit();
  }

  onDeleteInstance(instanceId: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this instance?')) {
      this.deleteInstance.emit(instanceId);
    }
  }

  onRequestScan(instanceId: string, scanType: ScanType = ScanType.QUICK, event: Event): void {
    event.stopPropagation();
    this.requestScan.emit({ instanceId, scanType });
  }

  onSelectInstance(instance: Instance): void {
    this.selectedInstance = instance;
    this.instanceSelected.emit(instance);
  }

  getStatusIcon(status: InstanceStatus): string {
    switch (status) {
      case InstanceStatus.HEALTHY:
        return '🟢';
      case InstanceStatus.WARNING:
        return '🟠';
      case InstanceStatus.CRITICAL:
        return '🔴';
      case InstanceStatus.OFFLINE:
        return '⚫';
      default:
        return '⚪';
    }
  }

  getStatusClass(status: InstanceStatus): string {
    switch (status) {
      case InstanceStatus.HEALTHY:
        return 'status-healthy';
      case InstanceStatus.WARNING:
        return 'status-warning';
      case InstanceStatus.CRITICAL:
        return 'status-critical';
      case InstanceStatus.OFFLINE:
        return 'status-offline';
      default:
        return '';
    }
  }

  forceScanAll(): void {
    if (confirm('Are you sure you want to force a scan on all instances?')) {
      this.instances.forEach(instance => {
        this.requestScan.emit({ instanceId: instance.id, scanType: ScanType.FULL });
      });
    }
  }
}
