  // src/app/core/services/microservice-connector.service.ts
  import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Observable, of } from 'rxjs';
  import { WidgetPosition } from '../models/widget-position.model';

  @Injectable({
    providedIn: 'root'
  })
  export class MicroserviceConnectorService {
    constructor(private http: HttpClient) {}

    saveUserPreferences(preferences: { layout: WidgetPosition[] }): Observable<any> {
      // Pour l'instant, on simule la réponse
      console.log('Saving user preferences:', preferences);
      return of({ success: true });
      
      // À terme, appeler l'API réelle
      // return this.http.post('/api/user/preferences', preferences);
    }

    // Méthodes pour se connecter aux différents microservices
    connectToVi(): Observable<any> {
      return of({ status: 'connected', service: 'vi' });
      // return this.http.get('/api/vi/connect');
    }

    connectToAsm(): Observable<any> {
      return of({ status: 'connected', service: 'asm' });
      // return this.http.get('/api/asm/connect');
    }

    connectToCti(): Observable<any> {
      return of({ status: 'connected', service: 'cti' });
      // return this.http.get('/api/cti/connect');
    }

    connectToSoar(): Observable<any> {
      return of({ status: 'connected', service: 'soar' });
      // return this.http.get('/api/soar/connect');
    }

    // Méthodes génériques pour récupérer des données de chaque service
    getDataFromService(service: 'vi' | 'asm' | 'cti' | 'soar', endpoint: string, params?: any): Observable<any> {
      return of({ data: 'Sample data', service, endpoint });
      // return this.http.get(`/api/${service}/${endpoint}`, { params });
    }

    postDataToService(service: 'vi' | 'asm' | 'cti' | 'soar', endpoint: string, data: any): Observable<any> {
      return of({ status: 'success', service, endpoint });
      // return this.http.post(`/api/${service}/${endpoint}`, data);
    }
  }