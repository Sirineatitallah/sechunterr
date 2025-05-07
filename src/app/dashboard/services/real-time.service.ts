import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription, interval } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { DashboardDataService } from './dashboard-data.service';
import { DashboardStateService } from './dashboard-state.service';

export interface RefreshConfig {
  enabled: boolean;
  interval: number; // in seconds
  widgetIds?: string[]; // if empty, refresh all widgets
}

@Injectable({
  providedIn: 'root'
})
export class RealTimeService implements OnDestroy {
  private refreshConfigSubject = new BehaviorSubject<RefreshConfig>({
    enabled: false,
    interval: 60 // default to 60 seconds
  });
  
  private refreshSubscription?: Subscription;
  private destroy$ = new Subject<void>();
  private lastRefreshSubject = new BehaviorSubject<Date | null>(null);
  
  refreshConfig$ = this.refreshConfigSubject.asObservable();
  lastRefresh$ = this.lastRefreshSubject.asObservable();
  
  constructor(
    private dashboardDataService: DashboardDataService,
    private dashboardStateService: DashboardStateService
  ) {
    // Initialize from dashboard state
    this.dashboardStateService.state$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(state => {
      if (state.refreshInterval !== undefined) {
        this.setRefreshInterval(state.refreshInterval);
      }
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopAutoRefresh();
  }
  
  /**
   * Start auto-refresh with the current configuration
   */
  startAutoRefresh(): void {
    this.stopAutoRefresh();
    
    const config = this.refreshConfigSubject.value;
    if (!config.enabled || config.interval <= 0) return;
    
    // Save to dashboard state
    this.dashboardStateService.updateState({
      refreshInterval: config.interval
    });
    
    // Start interval
    this.refreshSubscription = interval(config.interval * 1000).pipe(
      takeUntil(this.destroy$),
      tap(() => this.refreshData())
    ).subscribe();
    
    console.log(`Auto-refresh started with interval: ${config.interval} seconds`);
  }
  
  /**
   * Stop auto-refresh
   */
  stopAutoRefresh(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
      this.refreshSubscription = undefined;
      
      // Update config
      const config = this.refreshConfigSubject.value;
      this.refreshConfigSubject.next({
        ...config,
        enabled: false
      });
      
      // Save to dashboard state
      this.dashboardStateService.updateState({
        refreshInterval: 0
      });
      
      console.log('Auto-refresh stopped');
    }
  }
  
  /**
   * Set refresh interval
   */
  setRefreshInterval(seconds: number): void {
    const enabled = seconds > 0;
    
    this.refreshConfigSubject.next({
      enabled,
      interval: seconds
    });
    
    if (enabled) {
      this.startAutoRefresh();
    } else {
      this.stopAutoRefresh();
    }
  }
  
  /**
   * Get current refresh configuration
   */
  getRefreshConfig(): RefreshConfig {
    return this.refreshConfigSubject.value;
  }
  
  /**
   * Refresh data for all widgets or specific widgets
   */
  refreshData(widgetIds?: string[]): void {
    const config = this.refreshConfigSubject.value;
    const idsToRefresh = widgetIds || config.widgetIds;
    
    if (idsToRefresh && idsToRefresh.length > 0) {
      // Refresh specific widgets
      idsToRefresh.forEach(id => {
        this.dashboardDataService.clearCache(id);
      });
    } else {
      // Refresh all widgets
      this.dashboardDataService.clearCache();
    }
    
    // Update last refresh time
    this.lastRefreshSubject.next(new Date());
    
    console.log(`Data refreshed at ${new Date().toLocaleTimeString()}`);
  }
  
  /**
   * Get time until next refresh in seconds
   */
  getTimeUntilNextRefresh(): number {
    if (!this.refreshSubscription || !this.refreshConfigSubject.value.enabled) {
      return 0;
    }
    
    const lastRefresh = this.lastRefreshSubject.value;
    if (!lastRefresh) return this.refreshConfigSubject.value.interval;
    
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - lastRefresh.getTime()) / 1000);
    const remaining = this.refreshConfigSubject.value.interval - elapsed;
    
    return remaining > 0 ? remaining : 0;
  }
}
