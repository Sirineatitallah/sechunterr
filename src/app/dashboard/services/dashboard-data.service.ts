import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, shareReplay, map, finalize, delay } from 'rxjs/operators';

export interface DashboardData {
  id: string;
  type: string;
  title: string;
  data: any;
  lastUpdated: Date;
}

export interface DashboardCache {
  [key: string]: {
    data: DashboardData;
    timestamp: number;
    expiresAt: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DashboardDataService {
  private cache: DashboardCache = {};
  private cacheExpiration = 5 * 60 * 1000; // 5 minutes in milliseconds
  private loadingSubject = new BehaviorSubject<{ [key: string]: boolean }>({});
  private errorSubject = new BehaviorSubject<{ [key: string]: string }>({});
  
  loading$ = this.loadingSubject.asObservable();
  errors$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {}

  getWidgetData(widgetId: string, type: string, forceRefresh = false): Observable<DashboardData> {
    // Update loading state
    this.setLoading(widgetId, true);
    this.clearError(widgetId);
    
    // Check cache if not forcing refresh
    if (!forceRefresh && this.isCacheValid(widgetId)) {
      this.setLoading(widgetId, false);
      return of(this.cache[widgetId].data);
    }
    
    // Simulate API endpoint based on widget type
    const endpoint = this.getEndpointForWidgetType(type);
    
    // Add a small delay to simulate network request (remove in production)
    return this.http.get<any>(endpoint).pipe(
      delay(1500), // Simulate network delay - remove in production
      map(response => this.transformResponse(response, widgetId, type)),
      tap(data => this.updateCache(widgetId, data)),
      catchError(error => this.handleError(error, widgetId)),
      finalize(() => this.setLoading(widgetId, false)),
      shareReplay(1)
    );
  }

  isLoading(widgetId: string): Observable<boolean> {
    return this.loading$.pipe(
      map(loadingState => !!loadingState[widgetId])
    );
  }

  getError(widgetId: string): Observable<string | null> {
    return this.errors$.pipe(
      map(errorState => errorState[widgetId] || null)
    );
  }

  clearCache(widgetId?: string): void {
    if (widgetId) {
      delete this.cache[widgetId];
    } else {
      this.cache = {};
    }
  }

  private setLoading(widgetId: string, isLoading: boolean): void {
    const currentState = this.loadingSubject.value;
    this.loadingSubject.next({
      ...currentState,
      [widgetId]: isLoading
    });
  }

  private setError(widgetId: string, error: string): void {
    const currentState = this.errorSubject.value;
    this.errorSubject.next({
      ...currentState,
      [widgetId]: error
    });
  }

  private clearError(widgetId: string): void {
    const currentState = this.errorSubject.value;
    const newState = { ...currentState };
    delete newState[widgetId];
    this.errorSubject.next(newState);
  }

  private isCacheValid(widgetId: string): boolean {
    const cachedData = this.cache[widgetId];
    if (!cachedData) return false;
    
    const now = Date.now();
    return cachedData.expiresAt > now;
  }

  private updateCache(widgetId: string, data: DashboardData): void {
    const now = Date.now();
    this.cache[widgetId] = {
      data,
      timestamp: now,
      expiresAt: now + this.cacheExpiration
    };
  }

  private handleError(error: HttpErrorResponse, widgetId: string): Observable<never> {
    let errorMessage = 'Une erreur est survenue lors du chargement des données.';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Code d'erreur: ${error.status}, Message: ${error.message}`;
    }
    
    this.setError(widgetId, errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  private getEndpointForWidgetType(type: string): string {
    // In a real app, this would point to actual API endpoints
    // For now, we'll use mock endpoints
    const baseUrl = 'assets/mock-data';
    
    switch (type) {
      case 'vi-top':
        return `${baseUrl}/top-vulnerabilities.json`;
      case 'vi-severity':
        return `${baseUrl}/severity-distribution.json`;
      case 'vi-trends':
        return `${baseUrl}/monthly-trends.json`;
      case 'cti-map':
        return `${baseUrl}/threat-map.json`;
      case 'cti-mitre':
        return `${baseUrl}/mitre-heatmap.json`;
      case 'cti-evolution':
        return `${baseUrl}/threat-evolution.json`;
      case 'asm-surface':
        return `${baseUrl}/attack-surface.json`;
      case 'asm-risks':
        return `${baseUrl}/external-risks.json`;
      case 'asm-score':
        return `${baseUrl}/risk-score.json`;
      case 'soar-timeline':
        return `${baseUrl}/incident-timeline.json`;
      case 'soar-resolution':
        return `${baseUrl}/resolution-rate.json`;
      case 'soar-playbooks':
        return `${baseUrl}/active-playbooks.json`;
      default:
        return `${baseUrl}/generic-widget.json`;
    }
  }

  private transformResponse(response: any, widgetId: string, type: string): DashboardData {
    // Transform the API response into the expected format
    return {
      id: widgetId,
      type: type,
      title: response.title || 'Widget',
      data: response.data || response,
      lastUpdated: new Date()
    };
  }
}
