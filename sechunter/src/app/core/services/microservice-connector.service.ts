import { Injectable, inject, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, timer, of } from 'rxjs';
import { switchMap, retryWhen, delayWhen } from 'rxjs/operators';
import { WidgetPosition } from '../models/widget-position.model';

export enum MicroserviceType {
  THREAT_INTEL = 'threat-intel',
  VULNERABILITY_SCANNER = 'vuln-scanner',
  INCIDENT_RESPONSE = 'incident-response',
  NETWORK_SECURITY = 'network-security',
  VULNERABILITY_INTELLIGENCE = 'vi' // Added for VI module
}

export interface ServicePreferences {
  dataRetention: number;
  refreshRate: number;
  notificationEnabled: boolean;
}

@Injectable({ providedIn: 'root' })
export class MicroserviceConnectorService {
  private http = inject(HttpClient);
  private apiUrl = '/api/services';

  private dataUpdateSubjects: Record<string, Subject<any>> = {};

  saveUserPreferences(config: {
    layout: WidgetPosition[];
    servicePreferences: Partial<Record<MicroserviceType, ServicePreferences>>;
  }): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/preferences`, config);
  }

  getServiceData<T = unknown>(serviceType: MicroserviceType): Observable<T> {
    // In development mode, return mock data to avoid API calls
    if (isDevMode()) {
      console.log(`[DEV MODE] Returning mock data for ${serviceType}`);
      return of(this.getMockData(serviceType) as T);
    }
    return this.http.get<T>(`${this.apiUrl}/${serviceType}/data`);
  }

  private getMockData(serviceType: MicroserviceType): any {
    switch (serviceType) {
      case MicroserviceType.VULNERABILITY_SCANNER:
        return {
          icon: 'security',
          criticalCount: 12,
          highCount: 28,
          mediumCount: 45,
          lowCount: 67,
          trend: 'decreasing',
          lastScan: new Date().toISOString(),
          vulnerabilities: [
            { id: 'CVE-2023-1234', severity: 'critical', asset: 'web-server-01', status: 'open' },
            { id: 'CVE-2023-5678', severity: 'high', asset: 'db-server-02', status: 'in-progress' }
          ]
        };
      case MicroserviceType.THREAT_INTEL:
        return {
          icon: 'warning',
          alerts: [
            { severity: 'high', source: 'darkweb', description: 'Credentials leaked' },
            { severity: 'medium', source: 'osint', description: 'New vulnerability disclosed' }
          ],
          lastUpdated: new Date().toISOString(),
          threatScore: 65
        };
      case MicroserviceType.INCIDENT_RESPONSE:
        return {
          icon: 'emergency',
          activeIncidents: 3,
          resolvedToday: 5,
          mttr: '2h 15m',
          incidents: [
            { id: 'INC-001', severity: 'high', status: 'active', created: new Date().toISOString() }
          ]
        };
      case MicroserviceType.NETWORK_SECURITY:
        return {
          icon: 'router',
          blockedConnections: 1245,
          suspiciousActivities: 23,
          lastUpdated: new Date().toISOString()
        };
      default:
        return { icon: 'info', message: 'Mock data not available for this service type' };
    }
  }

  getServiceConfig<T = unknown>(serviceType: MicroserviceType): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${serviceType}/config`);
  }

  getAvailableServices(): Observable<MicroserviceType[]> {
    // In development mode, return all service types to avoid API calls
    if (isDevMode()) {
      console.log('[DEV MODE] Returning all available services');
      return of(Object.values(MicroserviceType));
    }
    return this.http.get<MicroserviceType[]>(`${this.apiUrl}/available`);
  }

  // New method to get real-time updates using polling with retry
  getRealTimeServiceData<T = unknown>(serviceType: MicroserviceType, intervalMs: number = 5000): Observable<T> {
    if (!this.dataUpdateSubjects[serviceType]) {
      this.dataUpdateSubjects[serviceType] = new Subject<T>();
      timer(0, intervalMs).pipe(
        switchMap(() => this.getServiceData<T>(serviceType)),
        retryWhen(errors => errors.pipe(delayWhen(() => timer(3000))))
      ).subscribe(data => {
        this.dataUpdateSubjects[serviceType].next(data);
      });
    }
    return this.dataUpdateSubjects[serviceType].asObservable();
  }

  // Specific method to get VI (Vulnerability Intelligence) data
  getVIData(): Observable<any> {
    // In development mode, return mock data
    if (isDevMode()) {
      console.log('[DEV MODE] Returning mock VI data');
      return of(this.getMockVIData());
    }
    // In production, fetch from the VI API
    return this.http.get('/api/vi/vulnerabilities');
  }

  // Get real-time VI data with polling
  getRealTimeVIData(intervalMs: number = 5000): Observable<any> {
    const serviceType = 'vi-data';
    if (!this.dataUpdateSubjects[serviceType]) {
      this.dataUpdateSubjects[serviceType] = new Subject<any>();
      timer(0, intervalMs).pipe(
        switchMap(() => this.getVIData()),
        retryWhen(errors => errors.pipe(delayWhen(() => timer(3000))))
      ).subscribe(data => {
        this.dataUpdateSubjects[serviceType].next(data);
      });
    }
    return this.dataUpdateSubjects[serviceType].asObservable();
  }

  // Mock data for VI module
  private getMockVIData(): any {
    return {
      topCVEs: [
        { id: 'CVE-2023-1234', count: 156, severity: 'critical' },
        { id: 'CVE-2023-5678', count: 142, severity: 'high' },
        { id: 'CVE-2023-9012', count: 98, severity: 'critical' },
        { id: 'CVE-2023-3456', count: 87, severity: 'high' },
        { id: 'CVE-2023-7890', count: 76, severity: 'medium' }
      ],
      vulnerabilitiesBySeverity: [
        { name: 'Critical', count: 124, color: '#d0021b' },
        { name: 'High', count: 256, color: '#f5a623' },
        { name: 'Medium', count: 432, color: '#f8e71c' },
        { name: 'Low', count: 321, color: '#7ed321' }
      ],
      osintSources: [
        {
          name: 'NVD',
          dailyVolume: [45, 38, 52, 63, 47, 55, 61],
          totalVolume: 361
        },
        {
          name: 'GitHub Security',
          dailyVolume: [32, 28, 35, 42, 38, 45, 40],
          totalVolume: 260
        },
        {
          name: 'ExploitDB',
          dailyVolume: [18, 15, 22, 19, 24, 20, 25],
          totalVolume: 143
        }
      ],
      dailyVulnerabilities: [
        { date: '2023-05-01', count: 42 },
        { date: '2023-05-02', count: 38 },
        { date: '2023-05-03', count: 56 },
        { date: '2023-05-04', count: 61 },
        { date: '2023-05-05', count: 49 },
        { date: '2023-05-06', count: 52 },
        { date: '2023-05-07', count: 58 }
      ]
    };
  }
}
