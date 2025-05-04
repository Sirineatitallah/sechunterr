import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, timer } from 'rxjs';
import { switchMap, retryWhen, delayWhen } from 'rxjs/operators';
import { WidgetPosition } from '../models/widget-position.model';

export enum MicroserviceType {
  THREAT_INTEL = 'threat-intel',
  VULNERABILITY_SCANNER = 'vuln-scanner',
  INCIDENT_RESPONSE = 'incident-response',
  NETWORK_SECURITY = 'network-security'
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
    return this.http.get<T>(`${this.apiUrl}/${serviceType}/data`);
  }

  getServiceConfig<T = unknown>(serviceType: MicroserviceType): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${serviceType}/config`);
  }

  getAvailableServices(): Observable<MicroserviceType[]> {
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
}
