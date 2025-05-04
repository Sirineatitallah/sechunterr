import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, tap } from 'rxjs';
import { WidgetPosition } from '../../core/models/widget-position.model';
import { UserInteraction } from '../../core/models/user-interaction.model';
import { MicroserviceConnectorService, MicroserviceType } from '../../core/services/microservice-connector.service';
import { of } from 'rxjs'; 

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private layoutSubject = new BehaviorSubject<WidgetPosition[]>([]);

  public layout$ = this.layoutSubject.asObservable();
  private userBehaviorSubject = new BehaviorSubject<UserInteraction[]>([]);
  private widgetCache = new Map<string, any>();

  constructor(private microserviceConnector: MicroserviceConnectorService) {
    this.initializeDashboard();
  }

  private initializeDashboard(): void {
    this.microserviceConnector.getAvailableServices().subscribe(services => {
      const initialLayout = services.map(service => ({
        id: `${service}-widget`,
        type: service,
        cols: 4,
        rows: 3,
        x: 0,
        y: 0
      }));
      this.layoutSubject.next(initialLayout);
    });
  }

  saveLayout(layout: WidgetPosition[]): void {
    const config = {
      layout,
      servicePreferences: {} 
    };
  
    this.microserviceConnector.saveUserPreferences(config)
      .pipe(
        tap(() => console.log('Layout saved successfully')),
        catchError(error => {
          console.error('Failed to save layout:', error);
          return [];
        })
      )
      .subscribe();
  }
  saveWidgetPositions(positions: WidgetPosition[]): void {
    localStorage.setItem('dashboardLayout', JSON.stringify(positions));
  }

  trackUserInteraction(interaction: UserInteraction): void {
    const currentInteractions = this.userBehaviorSubject.value;
    this.userBehaviorSubject.next([...currentInteractions.slice(-99), interaction]);
  }

  getWidgetData(widgetType: string, forceRefresh = false): Observable<any> {
    if (!forceRefresh && this.widgetCache.has(widgetType)) {
      return of(this.widgetCache.get(widgetType));
    }

    return this.microserviceConnector.getServiceData(widgetType as MicroserviceType).pipe(
      tap(data => this.widgetCache.set(widgetType, data))
    );
  }

  // Additional methods
  resetToDefaultLayout(): void {
    this.initializeDashboard();
  }
}