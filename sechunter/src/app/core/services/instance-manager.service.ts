import { Injectable, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Instance, InstanceStatus, ScanRequest, ScanRequestStatus, ScanType, ScanPriority } from '../models/instance.model';
import { AuthService } from './auth.service';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InstanceManagerService {
  private apiUrl = '/api/instances';
  private instancesSubject = new BehaviorSubject<Instance[]>([]);
  public instances$ = this.instancesSubject.asObservable();
  
  private scanRequestsSubject = new BehaviorSubject<ScanRequest[]>([]);
  public scanRequests$ = this.scanRequestsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loadInstances();
  }

  private loadInstances(): void {
    if (isDevMode()) {
      // In development mode, use mock data
      const mockInstances = this.getMockInstances();
      this.instancesSubject.next(mockInstances);
      
      const mockScanRequests = this.getMockScanRequests();
      this.scanRequestsSubject.next(mockScanRequests);
    } else {
      // In production, fetch from API
      this.http.get<Instance[]>(this.apiUrl).pipe(
        catchError(error => {
          console.error('Error loading instances:', error);
          return of([]);
        })
      ).subscribe(instances => {
        this.instancesSubject.next(instances);
      });
      
      this.http.get<ScanRequest[]>(`${this.apiUrl}/scan-requests`).pipe(
        catchError(error => {
          console.error('Error loading scan requests:', error);
          return of([]);
        })
      ).subscribe(requests => {
        this.scanRequestsSubject.next(requests);
      });
    }
  }

  getInstances(): Observable<Instance[]> {
    const user = this.authService.getDecodedToken();
    
    return this.instances$.pipe(
      map(instances => {
        // If user is admin or superuser, return all instances
        if (user?.roles?.includes('admin') || user?.roles?.includes('superuser')) {
          return instances;
        }
        
        // If user is client, return only their instances
        if (user?.roles?.includes('client') && user?.clientId) {
          return instances.filter(instance => instance.clientId === user.clientId);
        }
        
        // Default: return empty array
        return [];
      })
    );
  }

  getInstance(id: string): Observable<Instance | undefined> {
    return this.instances$.pipe(
      map(instances => instances.find(instance => instance.id === id))
    );
  }

  createInstance(instance: Partial<Instance>): Observable<Instance> {
    if (isDevMode()) {
      // In development mode, create mock instance
      const newInstance: Instance = {
        id: `inst-${Date.now()}`,
        name: instance.name || 'New Instance',
        clientId: instance.clientId || 'client1',
        clientName: instance.clientName || 'Client 1',
        status: InstanceStatus.HEALTHY,
        createdAt: new Date(),
        updatedAt: new Date(),
        metrics: {
          cpu: 10,
          memory: 20,
          disk: 30,
          network: 40,
          vulnerabilities: {
            critical: 0,
            high: 2,
            medium: 5,
            low: 10
          },
          alerts: 0
        }
      };
      
      const currentInstances = this.instancesSubject.value;
      this.instancesSubject.next([...currentInstances, newInstance]);
      
      return of(newInstance);
    } else {
      // In production, create via API
      return this.http.post<Instance>(this.apiUrl, instance).pipe(
        tap(newInstance => {
          const currentInstances = this.instancesSubject.value;
          this.instancesSubject.next([...currentInstances, newInstance]);
        })
      );
    }
  }

  deleteInstance(id: string): Observable<boolean> {
    if (isDevMode()) {
      // In development mode, delete from local state
      const currentInstances = this.instancesSubject.value;
      const updatedInstances = currentInstances.filter(instance => instance.id !== id);
      this.instancesSubject.next(updatedInstances);
      
      return of(true);
    } else {
      // In production, delete via API
      return this.http.delete<boolean>(`${this.apiUrl}/${id}`).pipe(
        tap(() => {
          const currentInstances = this.instancesSubject.value;
          const updatedInstances = currentInstances.filter(instance => instance.id !== id);
          this.instancesSubject.next(updatedInstances);
        })
      );
    }
  }

  requestScan(instanceId: string, scanType: ScanType = ScanType.QUICK): Observable<ScanRequest> {
    const user = this.authService.getDecodedToken();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const scanRequest: ScanRequest = {
      instanceId,
      scanType,
      priority: ScanPriority.MEDIUM,
      requestedBy: user.id,
      requestedAt: new Date(),
      status: user.roles.includes('admin') ? ScanRequestStatus.APPROVED : ScanRequestStatus.PENDING
    };
    
    if (isDevMode()) {
      // In development mode, add to local state
      const currentRequests = this.scanRequestsSubject.value;
      this.scanRequestsSubject.next([...currentRequests, scanRequest]);
      
      return of(scanRequest);
    } else {
      // In production, create via API
      return this.http.post<ScanRequest>(`${this.apiUrl}/scan-requests`, scanRequest).pipe(
        tap(newRequest => {
          const currentRequests = this.scanRequestsSubject.value;
          this.scanRequestsSubject.next([...currentRequests, newRequest]);
        })
      );
    }
  }

  approveScanRequest(requestId: string): Observable<ScanRequest> {
    if (isDevMode()) {
      // In development mode, update local state
      const currentRequests = this.scanRequestsSubject.value;
      const updatedRequests = currentRequests.map(req => 
        req.instanceId === requestId 
          ? { ...req, status: ScanRequestStatus.APPROVED } 
          : req
      );
      this.scanRequestsSubject.next(updatedRequests);
      
      return of(updatedRequests.find(req => req.instanceId === requestId) as ScanRequest);
    } else {
      // In production, update via API
      return this.http.patch<ScanRequest>(`${this.apiUrl}/scan-requests/${requestId}`, {
        status: ScanRequestStatus.APPROVED
      }).pipe(
        tap(updatedRequest => {
          const currentRequests = this.scanRequestsSubject.value;
          const updatedRequests = currentRequests.map(req => 
            req.instanceId === requestId ? updatedRequest : req
          );
          this.scanRequestsSubject.next(updatedRequests);
        })
      );
    }
  }

  // Mock data generators
  private getMockInstances(): Instance[] {
    return [
      {
        id: 'inst-1',
        name: 'Production Server',
        clientId: '1',
        clientName: 'Client 1',
        status: InstanceStatus.HEALTHY,
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date('2024-06-01'),
        lastScan: new Date('2024-06-01'),
        metrics: {
          cpu: 45,
          memory: 60,
          disk: 72,
          network: 30,
          vulnerabilities: {
            critical: 0,
            high: 3,
            medium: 12,
            low: 25
          },
          alerts: 0
        }
      },
      {
        id: 'inst-2',
        name: 'Development Server',
        clientId: '1',
        clientName: 'Client 1',
        status: InstanceStatus.WARNING,
        createdAt: new Date('2023-02-20'),
        updatedAt: new Date('2024-05-28'),
        lastScan: new Date('2024-05-28'),
        metrics: {
          cpu: 35,
          memory: 50,
          disk: 65,
          network: 25,
          vulnerabilities: {
            critical: 1,
            high: 5,
            medium: 8,
            low: 15
          },
          alerts: 2
        }
      },
      {
        id: 'inst-3',
        name: 'Database Server',
        clientId: '2',
        clientName: 'Client 2',
        status: InstanceStatus.CRITICAL,
        createdAt: new Date('2023-03-10'),
        updatedAt: new Date('2024-06-02'),
        lastScan: new Date('2024-06-02'),
        metrics: {
          cpu: 85,
          memory: 90,
          disk: 95,
          network: 70,
          vulnerabilities: {
            critical: 3,
            high: 7,
            medium: 15,
            low: 22
          },
          alerts: 5
        }
      },
      {
        id: 'inst-4',
        name: 'Web Server',
        clientId: '2',
        clientName: 'Client 2',
        status: InstanceStatus.HEALTHY,
        createdAt: new Date('2023-04-05'),
        updatedAt: new Date('2024-05-30'),
        lastScan: new Date('2024-05-30'),
        metrics: {
          cpu: 40,
          memory: 55,
          disk: 60,
          network: 45,
          vulnerabilities: {
            critical: 0,
            high: 2,
            medium: 10,
            low: 18
          },
          alerts: 1
        }
      },
      {
        id: 'inst-5',
        name: 'API Gateway',
        clientId: '3',
        clientName: 'Client 3',
        status: InstanceStatus.OFFLINE,
        createdAt: new Date('2023-05-15'),
        updatedAt: new Date('2024-05-15'),
        lastScan: new Date('2024-05-15'),
        metrics: {
          cpu: 0,
          memory: 0,
          disk: 0,
          network: 0,
          vulnerabilities: {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0
          },
          alerts: 0
        }
      }
    ];
  }

  private getMockScanRequests(): ScanRequest[] {
    return [
      {
        instanceId: 'inst-1',
        scanType: ScanType.FULL,
        priority: ScanPriority.HIGH,
        requestedBy: 'client-1',
        requestedAt: new Date('2024-06-01T10:30:00'),
        status: ScanRequestStatus.COMPLETED
      },
      {
        instanceId: 'inst-2',
        scanType: ScanType.VULNERABILITY,
        priority: ScanPriority.MEDIUM,
        requestedBy: 'client-1',
        requestedAt: new Date('2024-06-02T14:15:00'),
        status: ScanRequestStatus.IN_PROGRESS
      },
      {
        instanceId: 'inst-3',
        scanType: ScanType.QUICK,
        priority: ScanPriority.CRITICAL,
        requestedBy: 'client-2',
        requestedAt: new Date('2024-06-03T09:45:00'),
        status: ScanRequestStatus.PENDING
      }
    ];
  }
}
