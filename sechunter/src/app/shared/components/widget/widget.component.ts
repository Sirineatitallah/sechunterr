import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetPosition } from '../../../core/models/widget-position.model';

@Component({
  selector: 'app-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss']
})
export class WidgetComponent {
  @Input() config!: WidgetPosition;
  @Input() type!: string;
  @Input() title?: string;
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

  getWidgetClass() {
    return {
      [`widget-${this.type}`]: true,
      [this.size]: true
    };
  }
}