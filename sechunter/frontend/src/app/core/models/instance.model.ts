export interface Instance {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  status: InstanceStatus;
  metrics?: InstanceMetrics;
  lastScan?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum InstanceStatus {
  HEALTHY = 'healthy',
  WARNING = 'warning',
  CRITICAL = 'critical',
  OFFLINE = 'offline'
}

export interface InstanceMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  alerts: number;
}

export interface ScanRequest {
  instanceId: string;
  scanType: ScanType;
  priority: ScanPriority;
  requestedBy: string;
  requestedAt: Date;
  status: ScanRequestStatus;
}

export enum ScanType {
  FULL = 'full',
  QUICK = 'quick',
  VULNERABILITY = 'vulnerability',
  COMPLIANCE = 'compliance'
}

export enum ScanPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ScanRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}
