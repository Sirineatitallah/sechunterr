// widget.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="widget" [ngClass]="['widget-' + type, size]">
      <div class="widget-header" [ngClass]="{'has-actions': hasActions}">
        <h3 class="widget-title">{{ title || (type | titlecase) }}</h3>
        <div class="widget-actions" *ngIf="hasActions">
          <button class="action-btn refresh" (click)="onRefresh()">
            <span class="icon-refresh"></span>
          </button>
          <button class="action-btn expand" (click)="onExpand()">
            <span class="icon-expand"></span>
          </button>
          <button class="action-btn more" [class.active]="showMenu" (click)="toggleMenu()">
            <span class="icon-more"></span>
          </button>
          <div class="widget-menu" *ngIf="showMenu">
            <ul>
              <li (click)="onAction('edit')">Edit Widget</li>
              <li (click)="onAction('move')">Move Widget</li>
              <li (click)="onAction('remove')">Remove Widget</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="widget-content">
        <ng-content></ng-content>
        <div class="loading-overlay" *ngIf="loading">
          <div class="spinner"></div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./widget.component.scss']
})
export class WidgetComponent {
  @Input() type!: string;
  @Input() title?: string;
  @Input() config: any;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() loading = false;
  @Input() hasActions = true;
  
  @Output() refresh = new EventEmitter<void>();
  @Output() expand = new EventEmitter<void>();
  @Output() action = new EventEmitter<string>();
  
  showMenu = false;
  
  onRefresh() {
    this.refresh.emit();
  }
  
  onExpand() {
    this.expand.emit();
  }
  
  toggleMenu() {
    this.showMenu = !this.showMenu;
  }
  
  onAction(actionType: string) {
    this.action.emit(actionType);
    this.showMenu = false;
  }
}