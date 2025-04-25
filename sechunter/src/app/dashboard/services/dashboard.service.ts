// src/app/dashboard/services/dashboard.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { WidgetPosition } from '../../core/models/widget-position.model';
import { UserInteraction } from '../../core/models/user-interaction.model';
import { MicroserviceConnectorService } from '../../core/services/microservice-connector.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private layoutSubject = new BehaviorSubject<WidgetPosition[]>([]);
  private userBehaviorSubject = new BehaviorSubject<UserInteraction[]>([]);

  constructor(private microserviceConnector: MicroserviceConnectorService) {
    // Initialiser avec les données par défaut ou stockées
  }

  saveLayout(layout: WidgetPosition[]): void {
    this.layoutSubject.next(layout);
    this.microserviceConnector.saveUserPreferences({ layout });
  }

  trackUserInteraction(interaction: UserInteraction): void {
    const currentInteractions = this.userBehaviorSubject.value;
    this.userBehaviorSubject.next([...currentInteractions, interaction]);
    
    // Vous pourriez envoyer ces données à un service d'analyse
  }

  getLayout(): Observable<WidgetPosition[]> {
    return this.layoutSubject.asObservable();
  }

  getUserBehavior(): Observable<UserInteraction[]> {
    return this.userBehaviorSubject.asObservable();
  }

  // Autres méthodes pour charger les données spécifiques aux widgets
  loadVulnerabilityData() {
    // Simuler pour le moment, à remplacer par un appel API réel
    return [
      { date: '2025-01', critical: 42, high: 78, medium: 123, low: 96 },
      { date: '2025-02', critical: 36, high: 82, medium: 114, low: 89 },
      { date: '2025-03', critical: 28, high: 74, medium: 108, low: 92 },
      { date: '2025-04', critical: 24, high: 68, medium: 102, low: 85 }
    ];
  }

  loadSecurityMetrics() {
    return [
      { label: 'Critical Vulnerabilities', value: 24, trend: 'down', trendValue: '12%' },
      { label: 'Attack Surface Score', value: 72, trend: 'up', trendValue: '3%' },
      { label: 'Threat Intelligence', value: 158, trend: 'up', trendValue: '15%' },
      { label: 'Open Incidents', value: 7, trend: 'down', trendValue: '5%' }
    ];
  }
  
}