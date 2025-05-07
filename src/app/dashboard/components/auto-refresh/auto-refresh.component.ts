import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RealTimeService, RefreshConfig } from '../../services/real-time.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-auto-refresh',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auto-refresh-container">
      <div class="refresh-status" [class.active]="config.enabled">
        <i class="material-icons">{{ config.enabled ? 'sync' : 'sync_disabled' }}</i>
        <span *ngIf="config.enabled">
          Actualisation dans {{ timeUntilNextRefresh }}s
        </span>
        <span *ngIf="!config.enabled">
          Actualisation auto désactivée
        </span>
      </div>
      
      <div class="refresh-controls">
        <button class="refresh-now-btn" (click)="refreshNow()" title="Actualiser maintenant">
          <i class="material-icons">refresh</i>
        </button>
        
        <div class="refresh-dropdown">
          <button class="refresh-settings-btn" (click)="toggleDropdown()" title="Paramètres d'actualisation">
            <i class="material-icons">settings</i>
          </button>
          
          <div class="refresh-dropdown-content" *ngIf="showDropdown" (clickOutside)="showDropdown = false">
            <div class="dropdown-header">
              <h3>Actualisation automatique</h3>
            </div>
            
            <div class="dropdown-body">
              <div class="toggle-container">
                <label class="toggle-switch">
                  <input type="checkbox" [checked]="config.enabled" (change)="toggleAutoRefresh()">
                  <span class="toggle-slider"></span>
                </label>
                <span>Activer</span>
              </div>
              
              <div class="interval-selector" [class.disabled]="!config.enabled">
                <label>Intervalle</label>
                <div class="interval-options">
                  <button 
                    *ngFor="let option of intervalOptions" 
                    class="interval-option" 
                    [class.active]="config.interval === option.value"
                    [disabled]="!config.enabled"
                    (click)="setInterval(option.value)"
                  >
                    {{ option.label }}
                  </button>
                </div>
              </div>
              
              <div class="custom-interval" [class.disabled]="!config.enabled">
                <label>Intervalle personnalisé (secondes)</label>
                <input 
                  type="number" 
                  [disabled]="!config.enabled" 
                  [ngModel]="customInterval" 
                  (ngModelChange)="updateCustomInterval($event)"
                  min="5"
                  max="3600"
                >
              </div>
            </div>
            
            <div class="dropdown-footer">
              <button class="apply-btn" (click)="applyCustomInterval()" [disabled]="!config.enabled">
                Appliquer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auto-refresh-container {
      display: flex;
      align-items: center;
      gap: 12px;
      background-color: rgba(0, 0, 0, 0.03);
      border-radius: 20px;
      padding: 4px 12px;
      height: 36px;
    }
    
    .refresh-status {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #666;
    }
    
    .refresh-status.active {
      color: #3f51b5;
    }
    
    .refresh-status i {
      font-size: 16px;
    }
    
    .refresh-status.active i {
      animation: spin 2s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .refresh-controls {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .refresh-now-btn, .refresh-settings-btn {
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    
    .refresh-now-btn:hover, .refresh-settings-btn:hover {
      background-color: rgba(0, 0, 0, 0.05);
      color: #333;
    }
    
    .refresh-now-btn i, .refresh-settings-btn i {
      font-size: 18px;
    }
    
    .refresh-dropdown {
      position: relative;
    }
    
    .refresh-dropdown-content {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 280px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      z-index: 100;
    }
    
    .dropdown-header {
      padding: 12px 16px;
      border-bottom: 1px solid #eee;
    }
    
    .dropdown-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }
    
    .dropdown-body {
      padding: 16px;
    }
    
    .toggle-container {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    
    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 40px;
      height: 20px;
    }
    
    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    
    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: .4s;
      border-radius: 20px;
    }
    
    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
    
    input:checked + .toggle-slider {
      background-color: #3f51b5;
    }
    
    input:checked + .toggle-slider:before {
      transform: translateX(20px);
    }
    
    .interval-selector {
      margin-bottom: 16px;
    }
    
    .interval-selector.disabled {
      opacity: 0.5;
    }
    
    .interval-selector label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      color: #666;
    }
    
    .interval-options {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .interval-option {
      background-color: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 6px 12px;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .interval-option:hover:not(:disabled) {
      background-color: #e0e0e0;
    }
    
    .interval-option.active {
      background-color: #3f51b5;
      border-color: #3f51b5;
      color: white;
    }
    
    .interval-option:disabled {
      cursor: not-allowed;
    }
    
    .custom-interval {
      margin-bottom: 16px;
    }
    
    .custom-interval.disabled {
      opacity: 0.5;
    }
    
    .custom-interval label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      color: #666;
    }
    
    .custom-interval input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    
    .custom-interval input:focus {
      border-color: #3f51b5;
      outline: none;
    }
    
    .dropdown-footer {
      padding: 12px 16px;
      border-top: 1px solid #eee;
      text-align: right;
    }
    
    .apply-btn {
      background-color: #3f51b5;
      border: 1px solid #3f51b5;
      color: white;
      padding: 6px 16px;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .apply-btn:hover:not(:disabled) {
      background-color: #303f9f;
    }
    
    .apply-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class AutoRefreshComponent implements OnInit, OnDestroy {
  config: RefreshConfig = {
    enabled: false,
    interval: 60
  };
  
  intervalOptions = [
    { label: '30s', value: 30 },
    { label: '1m', value: 60 },
    { label: '5m', value: 300 },
    { label: '15m', value: 900 },
    { label: '30m', value: 1800 }
  ];
  
  customInterval: number = 60;
  showDropdown: boolean = false;
  timeUntilNextRefresh: number = 0;
  
  private timerSubscription?: Subscription;
  private configSubscription?: Subscription;
  
  constructor(private realTimeService: RealTimeService) {}
  
  ngOnInit(): void {
    // Subscribe to refresh config
    this.configSubscription = this.realTimeService.refreshConfig$.subscribe(config => {
      this.config = config;
      this.customInterval = config.interval;
    });
    
    // Start timer to update countdown
    this.startCountdownTimer();
  }
  
  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    
    if (this.configSubscription) {
      this.configSubscription.unsubscribe();
    }
  }
  
  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }
  
  toggleAutoRefresh(): void {
    if (this.config.enabled) {
      this.realTimeService.stopAutoRefresh();
    } else {
      this.realTimeService.setRefreshInterval(this.config.interval);
    }
  }
  
  setInterval(seconds: number): void {
    this.customInterval = seconds;
    this.realTimeService.setRefreshInterval(seconds);
  }
  
  updateCustomInterval(value: number): void {
    this.customInterval = value;
  }
  
  applyCustomInterval(): void {
    if (this.customInterval >= 5) {
      this.realTimeService.setRefreshInterval(this.customInterval);
    }
  }
  
  refreshNow(): void {
    this.realTimeService.refreshData();
  }
  
  private startCountdownTimer(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.config.enabled) {
        this.timeUntilNextRefresh = this.realTimeService.getTimeUntilNextRefresh();
      }
    });
  }
}
