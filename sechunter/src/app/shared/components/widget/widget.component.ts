// src/app/shared/components/widget/widget.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss']
})
export class WidgetComponent {
  @Input() type!: string;
  @Input() title?: string;
  @Input() config: any;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() loading = false;
  @Input() hasActions = true;
 
  @Output() refresh = new EventEmitter();
  @Output() expand = new EventEmitter();
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