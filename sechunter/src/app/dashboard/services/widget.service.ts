import { Injectable } from '@angular/core';
import { WidgetConfig } from './../../core/models/widget-config.model';

@Injectable({ providedIn: 'root' })
export class WidgetService {
  private widgetConfigs: WidgetConfig[] = [
    {
      type: 'threat-feed',
      title: 'Threat Intelligence Feed',
      cols: 4,
      rows: 3,
      component: 'ThreatFeedComponent'
    },
    {
      type: 'security-chart',
      title: 'Security Posture',
      cols: 6,
      rows: 4,
      component: 'SecurityChartComponent'
    }
  ];

  getWidgetConfig(type: string): WidgetConfig | undefined {
    return this.widgetConfigs.find(w => w.type === type);
  }

  getAllWidgetConfigs(): WidgetConfig[] {
    return this.widgetConfigs;
  }
}