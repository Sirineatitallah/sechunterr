// src/app/dashboard/components/quick-actions/quick-actions.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface Action {
  id: string;
  label: string;
  icon: string;
  color?: 'primary' | 'accent' | 'warn' | 'default';
  tooltip?: string;
  disabled?: boolean;
  badgeCount?: number;
}

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  template: `
    <div class="quick-actions-container">
      @for (action of actions; track action.id) {
        <button mat-raised-button
                class="action-button"
                [color]="action.color || 'default'"
                [matTooltip]="action.tooltip || ''"
                [disabled]="action.disabled"
                (click)="onActionClick(action)"
                [attr.aria-label]="action.label">
          <mat-icon>{{action.icon}}</mat-icon>
          <span class="button-label">{{action.label}}</span>
          @if (action.badgeCount && action.badgeCount > 0) {
            <span class="badge">{{action.badgeCount}}</span>
          }
        </button>
      }
    </div>
  `,
  styleUrls: ['./quick-actions.component.scss']
})
export class QuickActionsComponent {
  @Input() actions: Action[] = [];
  @Input() layout: 'horizontal' | 'vertical' = 'horizontal';
  @Output() actionSelected = new EventEmitter<Action>();

  onActionClick(action: Action): void {
    if (!action.disabled) {
      this.actionSelected.emit(action);
    }
  }
}