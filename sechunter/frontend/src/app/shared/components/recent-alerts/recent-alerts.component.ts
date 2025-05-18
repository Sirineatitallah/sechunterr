import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';

export interface Alert {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  severity: 'critical' | 'high' | 'medium' | 'low';
  source: string;
  status: 'new' | 'in-progress' | 'resolved' | 'dismissed';
  type: 'vulnerability' | 'threat' | 'incident' | 'system';
  actions?: {
    label: string;
    icon: string;
    action: string;
  }[];
  details?: any;
}

@Component({
  selector: 'app-recent-alerts',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatBadgeModule,
    MatMenuModule,
    RouterModule
  ],
  template: `
    <div class="recent-alerts-container">
      <div class="alerts-header">
        <div class="header-title">
          <mat-icon [matBadge]="newAlertsCount" [matBadgeHidden]="newAlertsCount === 0" matBadgeColor="warn">
            notifications_active
          </mat-icon>
          <h2>{{title}}</h2>
        </div>
        <div class="header-actions">
          <button mat-button color="primary" *ngIf="newAlertsCount > 0" (click)="markAllAsRead()">
            <mat-icon>done_all</mat-icon>
            Tout marquer comme lu
          </button>
          <button mat-button [routerLink]="viewAllLink">
            <mat-icon>visibility</mat-icon>
            Voir tout
          </button>
        </div>
      </div>
      
      <div class="alerts-list">
        <ng-container *ngIf="alerts.length > 0; else noAlerts">
          <div *ngFor="let alert of alerts" class="alert-item" [ngClass]="alert.severity">
            <div class="alert-icon">
              <mat-icon>{{getAlertIcon(alert.type)}}</mat-icon>
            </div>
            
            <div class="alert-content">
              <div class="alert-header">
                <h3 class="alert-title">{{alert.title}}</h3>
                <span class="alert-time">{{formatTime(alert.timestamp)}}</span>
              </div>
              
              <p class="alert-description">{{alert.description}}</p>
              
              <div class="alert-meta">
                <span class="alert-source">{{alert.source}}</span>
                <span class="alert-severity" [ngClass]="alert.severity">
                  {{alert.severity}}
                </span>
                <span class="alert-status" [ngClass]="alert.status">
                  {{formatStatus(alert.status)}}
                </span>
              </div>
            </div>
            
            <div class="alert-actions">
              <button mat-icon-button [matMenuTriggerFor]="menu" matTooltip="Actions">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="onAlertAction(alert, 'view')">
                  <mat-icon>visibility</mat-icon>
                  <span>Voir les détails</span>
                </button>
                <button mat-menu-item (click)="onAlertAction(alert, 'acknowledge')" *ngIf="alert.status === 'new'">
                  <mat-icon>done</mat-icon>
                  <span>Accuser réception</span>
                </button>
                <button mat-menu-item (click)="onAlertAction(alert, 'investigate')" *ngIf="alert.status === 'new' || alert.status === 'in-progress'">
                  <mat-icon>search</mat-icon>
                  <span>Investiguer</span>
                </button>
                <button mat-menu-item (click)="onAlertAction(alert, 'resolve')" *ngIf="alert.status === 'in-progress'">
                  <mat-icon>check_circle</mat-icon>
                  <span>Résoudre</span>
                </button>
                <button mat-menu-item (click)="onAlertAction(alert, 'dismiss')">
                  <mat-icon>block</mat-icon>
                  <span>Ignorer</span>
                </button>
                <button mat-menu-item (click)="onAlertAction(alert, 'delete')">
                  <mat-icon>delete</mat-icon>
                  <span>Supprimer</span>
                </button>
              </mat-menu>
              
              <div class="quick-actions">
                <ng-container *ngFor="let action of alert.actions?.slice(0, 2)">
                  <button mat-icon-button [matTooltip]="action.label" (click)="onAlertAction(alert, action.action)">
                    <mat-icon>{{action.icon}}</mat-icon>
                  </button>
                </ng-container>
              </div>
            </div>
          </div>
        </ng-container>
        
        <ng-template #noAlerts>
          <div class="no-alerts">
            <mat-icon>notifications_off</mat-icon>
            <p>Aucune alerte récente</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .recent-alerts-container {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-radius: 10px;
      padding: 1.5rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      margin-bottom: 1.5rem;
      position: relative;
      overflow: hidden;
    }
    
    .recent-alerts-container::before {
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
    
    .alerts-header {
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
      gap: 0.5rem;
    }
    
    .alerts-list {
      position: relative;
      z-index: 1;
    }
    
    .alert-item {
      background: rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 1.2rem;
      display: flex;
      gap: 1rem;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
      margin-bottom: 1rem;
    }
    
    .alert-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
      z-index: 0;
    }
    
    .alert-item:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    }
    
    .alert-item.critical {
      border-left: 4px solid #ff4757;
    }
    
    .alert-item.high {
      border-left: 4px solid #ffa502;
    }
    
    .alert-item.medium {
      border-left: 4px solid #1e90ff;
    }
    
    .alert-item.low {
      border-left: 4px solid #2ed573;
    }
    
    .alert-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 1;
      background: rgba(255, 255, 255, 0.1);
    }
    
    .alert-content {
      flex: 1;
      position: relative;
      z-index: 1;
    }
    
    .alert-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
    }
    
    .alert-title {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.9);
    }
    
    .alert-time {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.6);
    }
    
    .alert-description {
      margin: 0 0 0.8rem;
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.7);
    }
    
    .alert-meta {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    
    .alert-source, .alert-severity, .alert-status {
      font-size: 0.8rem;
      padding: 0.2rem 0.6rem;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.7);
    }
    
    .alert-severity.critical {
      background: rgba(255, 71, 87, 0.2);
      color: #ff4757;
    }
    
    .alert-severity.high {
      background: rgba(255, 165, 2, 0.2);
      color: #ffa502;
    }
    
    .alert-severity.medium {
      background: rgba(30, 144, 255, 0.2);
      color: #1e90ff;
    }
    
    .alert-severity.low {
      background: rgba(46, 213, 115, 0.2);
      color: #2ed573;
    }
    
    .alert-status.new {
      background: rgba(255, 71, 87, 0.2);
      color: #ff4757;
    }
    
    .alert-status.in-progress {
      background: rgba(255, 165, 2, 0.2);
      color: #ffa502;
    }
    
    .alert-status.resolved {
      background: rgba(46, 213, 115, 0.2);
      color: #2ed573;
    }
    
    .alert-status.dismissed {
      background: rgba(178, 190, 195, 0.2);
      color: #b2bec3;
    }
    
    .alert-actions {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
      position: relative;
      z-index: 1;
    }
    
    .quick-actions {
      display: flex;
      gap: 0.3rem;
    }
    
    .no-alerts {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: rgba(255, 255, 255, 0.5);
      text-align: center;
    }
    
    .no-alerts mat-icon {
      font-size: 3rem;
      height: 3rem;
      width: 3rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }
  `]
})
export class RecentAlertsComponent implements OnInit {
  @Input() title = 'Alertes récentes';
  @Input() alerts: Alert[] = [];
  @Input() viewAllLink = '/dashboard/alerts';
  @Input() maxAlerts = 5;
  
  @Output() alertAction = new EventEmitter<{alert: Alert, action: string}>();
  
  newAlertsCount = 0;
  
  constructor() { }
  
  ngOnInit(): void {
    this.countNewAlerts();
  }
  
  getAlertIcon(type: string): string {
    switch (type) {
      case 'vulnerability':
        return 'bug_report';
      case 'threat':
        return 'gpp_maybe';
      case 'incident':
        return 'warning';
      case 'system':
        return 'computer';
      default:
        return 'notifications';
    }
  }
  
  formatTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);
    
    if (diffSec < 60) {
      return 'À l\'instant';
    } else if (diffMin < 60) {
      return `Il y a ${diffMin} min`;
    } else if (diffHour < 24) {
      return `Il y a ${diffHour}h`;
    } else {
      return `Il y a ${diffDay}j`;
    }
  }
  
  formatStatus(status: string): string {
    switch (status) {
      case 'new':
        return 'Nouveau';
      case 'in-progress':
        return 'En cours';
      case 'resolved':
        return 'Résolu';
      case 'dismissed':
        return 'Ignoré';
      default:
        return status;
    }
  }
  
  onAlertAction(alert: Alert, action: string): void {
    this.alertAction.emit({ alert, action });
    
    // Update alert status based on action
    if (action === 'acknowledge' || action === 'investigate') {
      alert.status = 'in-progress';
    } else if (action === 'resolve') {
      alert.status = 'resolved';
    } else if (action === 'dismiss') {
      alert.status = 'dismissed';
    }
    
    this.countNewAlerts();
  }
  
  markAllAsRead(): void {
    this.alerts.forEach(alert => {
      if (alert.status === 'new') {
        alert.status = 'in-progress';
      }
    });
    
    this.countNewAlerts();
  }
  
  private countNewAlerts(): void {
    this.newAlertsCount = this.alerts.filter(alert => alert.status === 'new').length;
  }
}
