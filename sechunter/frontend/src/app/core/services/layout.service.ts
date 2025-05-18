import { Injectable } from '@angular/core';
import { WidgetPosition } from '../models/widget-position.model';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly LAYOUT_KEY = 'dashboard_layout_v2';
  
  saveLayout(layout: WidgetPosition[]): void {
    localStorage.setItem(this.LAYOUT_KEY, JSON.stringify(layout));
  }
  
  loadLayout(): WidgetPosition[] {
    const layout = localStorage.getItem(this.LAYOUT_KEY);
    return layout ? JSON.parse(layout) : this.getDefaultLayout();
  }
  
  private getDefaultLayout(): WidgetPosition[] {
    return [
      { id: 'security-posture', type: 'chart', x: 0, y: 0, cols: 4, rows: 2 },
      { id: 'threat-feed', type: 'feed', x: 4, y: 0, cols: 8, rows: 4 },
      { id: 'quick-actions', type: 'actions', x: 0, y: 2, cols: 4, rows: 2 }
    ];
  }
}