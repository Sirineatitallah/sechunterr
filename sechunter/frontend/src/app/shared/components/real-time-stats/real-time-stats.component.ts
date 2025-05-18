import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { interval, Subscription } from 'rxjs';

export interface StatItem {
  id: string;
  label: string;
  value: number;
  previousValue?: number;
  icon: string;
  color: string;
  trend?: 'up' | 'down' | 'stable';
  percentage?: number;
  unit?: string;
  tooltip?: string;
}

@Component({
  selector: 'app-real-time-stats',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatMenuModule
  ],
  template: `
    <div class="real-time-stats-container">
      <div class="stats-header">
        <div class="header-title">
          <mat-icon>trending_up</mat-icon>
          <h2>{{title}}</h2>
        </div>
        <div class="header-actions">
          <div class="refresh-info" *ngIf="autoRefresh">
            <span class="refresh-label">Actualisation: {{refreshCountdown}}s</span>
            <div class="refresh-progress" [style.width.%]="(refreshCountdown / refreshInterval) * 100"></div>
          </div>
          <button mat-icon-button [matMenuTriggerFor]="menu" matTooltip="Options">
            <mat-icon>more_vert</mat-icon>
          </button>
          <mat-menu #menu="matMenu">
            <button mat-menu-item (click)="toggleAutoRefresh()">
              <mat-icon>{{autoRefresh ? 'pause' : 'play_arrow'}}</mat-icon>
              <span>{{autoRefresh ? 'Pause' : 'Actualisation auto'}}</span>
            </button>
            <button mat-menu-item (click)="refreshData()">
              <mat-icon>refresh</mat-icon>
              <span>Actualiser maintenant</span>
            </button>
            <button mat-menu-item [matMenuTriggerFor]="intervalMenu">
              <mat-icon>timer</mat-icon>
              <span>Intervalle</span>
            </button>
          </mat-menu>
          <mat-menu #intervalMenu="matMenu">
            <button mat-menu-item (click)="setRefreshInterval(10)">10 secondes</button>
            <button mat-menu-item (click)="setRefreshInterval(30)">30 secondes</button>
            <button mat-menu-item (click)="setRefreshInterval(60)">1 minute</button>
            <button mat-menu-item (click)="setRefreshInterval(300)">5 minutes</button>
          </mat-menu>
        </div>
      </div>
      
      <div class="stats-grid">
        <div *ngFor="let stat of stats" class="stat-card" [ngClass]="stat.color">
          <div class="stat-icon">
            <mat-icon>{{stat.icon}}</mat-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label" [matTooltip]="stat.tooltip || ''">{{stat.label}}</div>
            <div class="stat-value">
              {{stat.value}}{{stat.unit || ''}}
              <span *ngIf="stat.trend" class="trend-indicator" [ngClass]="stat.trend">
                <mat-icon>
                  {{stat.trend === 'up' ? 'trending_up' : stat.trend === 'down' ? 'trending_down' : 'trending_flat'}}
                </mat-icon>
                <span *ngIf="stat.percentage !== undefined">{{stat.percentage}}%</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .real-time-stats-container {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-radius: 10px;
      padding: 1.5rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      margin-bottom: 1.5rem;
      position: relative;
      overflow: hidden;
    }
    
    .real-time-stats-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: 
        radial-gradient(circle at 20% 30%, rgba(71, 118, 230, 0.05), transparent 70%),
        radial-gradient(circle at 80% 70%, rgba(142, 84, 233, 0.05), transparent 70%);
      pointer-events: none;
      z-index: 0;
    }
    
    .stats-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      position: relative;
      z-index: 1;
    }
    
    .header-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .header-title h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.9);
    }
    
    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .refresh-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.2rem;
    }
    
    .refresh-label {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.6);
    }
    
    .refresh-progress {
      height: 2px;
      background: linear-gradient(90deg, #4776E6, #8E54E9);
      border-radius: 2px;
      transition: width 1s linear;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      position: relative;
      z-index: 1;
    }
    
    .stat-card {
      background: rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 1.2rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
      z-index: 0;
    }
    
    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    }
    
    .stat-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 1;
    }
    
    .stat-content {
      flex: 1;
      position: relative;
      z-index: 1;
    }
    
    .stat-label {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 0.3rem;
    }
    
    .stat-value {
      font-size: 1.5rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .trend-indicator {
      display: flex;
      align-items: center;
      font-size: 0.9rem;
      font-weight: normal;
    }
    
    .trend-indicator mat-icon {
      font-size: 1.2rem;
      height: 1.2rem;
      width: 1.2rem;
    }
    
    .trend-indicator.up {
      color: #2ed573;
    }
    
    .trend-indicator.down {
      color: #ff4757;
    }
    
    .trend-indicator.stable {
      color: #1e90ff;
    }
    
    .stat-card.critical .stat-icon {
      background: rgba(255, 71, 87, 0.2);
      color: #ff4757;
    }
    
    .stat-card.high .stat-icon {
      background: rgba(255, 165, 2, 0.2);
      color: #ffa502;
    }
    
    .stat-card.medium .stat-icon {
      background: rgba(30, 144, 255, 0.2);
      color: #1e90ff;
    }
    
    .stat-card.low .stat-icon {
      background: rgba(46, 213, 115, 0.2);
      color: #2ed573;
    }
    
    .stat-card.info .stat-icon {
      background: rgba(142, 84, 233, 0.2);
      color: #8e54e9;
    }
  `]
})
export class RealTimeStatsComponent implements OnInit, OnDestroy {
  @Input() title = 'Statistiques en temps réel';
  @Input() stats: StatItem[] = [];
  @Input() refreshInterval = 30; // seconds
  
  autoRefresh = true;
  refreshCountdown = 30;
  
  private refreshSubscription?: Subscription;
  
  constructor() { }
  
  ngOnInit(): void {
    this.startRefreshTimer();
  }
  
  ngOnDestroy(): void {
    this.stopRefreshTimer();
  }
  
  toggleAutoRefresh(): void {
    this.autoRefresh = !this.autoRefresh;
    
    if (this.autoRefresh) {
      this.startRefreshTimer();
    } else {
      this.stopRefreshTimer();
    }
  }
  
  refreshData(): void {
    // Simulate data refresh with random changes
    this.stats = this.stats.map(stat => {
      const previousValue = stat.value;
      const change = Math.floor(Math.random() * 10) - 5; // Random change between -5 and +5
      const newValue = Math.max(0, previousValue + change);
      
      let trend: 'up' | 'down' | 'stable';
      if (newValue > previousValue) {
        trend = 'up';
      } else if (newValue < previousValue) {
        trend = 'down';
      } else {
        trend = 'stable';
      }
      
      let percentage = 0;
      if (previousValue > 0) {
        percentage = Math.round((Math.abs(newValue - previousValue) / previousValue) * 100);
      }
      
      return {
        ...stat,
        value: newValue,
        previousValue,
        trend,
        percentage
      };
    });
    
    // Reset countdown
    this.refreshCountdown = this.refreshInterval;
  }
  
  setRefreshInterval(seconds: number): void {
    this.refreshInterval = seconds;
    this.refreshCountdown = seconds;
    
    if (this.autoRefresh) {
      this.stopRefreshTimer();
      this.startRefreshTimer();
    }
  }
  
  private startRefreshTimer(): void {
    this.refreshSubscription = interval(1000).subscribe(() => {
      this.refreshCountdown--;
      
      if (this.refreshCountdown <= 0) {
        this.refreshData();
      }
    });
  }
  
  private stopRefreshTimer(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }
}
