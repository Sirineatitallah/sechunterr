// src/app/dashboard/components/quick-actions/quick-actions.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Action {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="quick-actions">
      <button *ngFor="let action of actions" 
              class="action-button"
              (click)="onActionClick(action)">
        <span class="action-icon icon-{{action.icon}}"></span>
        <span class="action-label">{{action.label}}</span>
      </button>
    </div>
  `,
  styleUrls: ['./quick-actions.component.scss']
})
export class QuickActionsComponent {
  @Input() actions: Action[] = [];
  @Output() actionSelected = new EventEmitter<Action>();

  onActionClick(action: Action) {
    this.actionSelected.emit(action);
  }
}