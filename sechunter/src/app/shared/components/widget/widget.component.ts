import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetPosition } from './../../../core/models/widget-position.model';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-widget',
  standalone: true,
  imports: [CommonModule, MatIconModule,MatProgressSpinnerModule],
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss']
})

export class WidgetComponent {
  @Input() config?: WidgetPosition;
  @Input() type!: string;
  @Input() title?: string;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() loading = false;
  @Input() hasActions = true;

  @Output() refresh = new EventEmitter<void>();
  @Output() expand = new EventEmitter<void>();
  @Output() action = new EventEmitter<{ action: string }>();

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
    this.action.emit({ action: actionType });
    this.showMenu = false;
  }

  getWidgetClass() {
    return {
      [`widget-${this.type}`]: true,
      [this.size]: true,
      'resizing': this.config?.isResizing ?? false
    };
  }
  
  constructor(private cdr: ChangeDetectorRef) {}

}
