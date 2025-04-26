import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { WidgetPosition } from '../models/widget-position.model';

// Define MicroserviceType enum
export enum MicroserviceType {
  THREAT_INTEL = 'threat-intel',
  VULNERABILITY_SCANNER = 'vuln-scanner',
  INCIDENT_RESPONSE = 'incident-response',
  NETWORK_SECURITY = 'network-security'
}

// Define Record type for servicePreferences
export interface ServicePreferences {
  dataRetention?: number;
  refreshRate?: number;
  notificationEnabled?: boolean;
}

@Injectable({ providedIn: 'root' })
export class MicroserviceConnectorService {
  private apiUrl = '/api/services';
  
  constructor(private http: HttpClient) {}

  // Method to save user preferences
  saveUserPreferences(data: { layout: WidgetPosition[], servicePreferences?: Record<MicroserviceType, any> }): Observable<any> {
    // In a real app, this would be an HTTP POST
    console.log('Saving user preferences:', data);
    return of({ success: true });
  }

  // Method to fetch data from a specific microservice
  getServiceData(serviceType: MicroserviceType): Observable<any> {
    return this.http.get(`${this.apiUrl}/${serviceType}/data`);
  }

  // Method to get service configuration
  getServiceConfig(serviceType: MicroserviceType): Observable<any> {
    return this.http.get(`${this.apiUrl}/${serviceType}/config`);
  }

  // Simulated method to get available services
  getAvailableServices(): Observable<MicroserviceType[]> {
    return of(Object.values(MicroserviceType));
  }
}