import { Injectable, Type } from '@angular/core';
import { WidgetConfig } from '../models/widget-config.model';
import { DefaultWidgetComponent } from './../../shared/components/widget/default-widget.component';

@Injectable({ providedIn: 'root' })
export class WidgetRegistryService {
  private registry = new Map<string, { component: Type<any>; config: WidgetConfig }>();

  constructor() {
    this.registerDefaultWidgets();
  }

  private registerDefaultWidgets(): void {
    this.register('default', DefaultWidgetComponent, {
      type: 'default',
      title: 'Unnamed Widget',
      cols: 4,
      rows: 3,
      component: 'DefaultWidgetComponent',
      theme: 'light'

    });
  }

  register(
    widgetType: string,
    component: Type<any>,
    config: Partial<WidgetConfig> = {}
  ): void {
    this.registry.set(widgetType, {
      component,
      config: {
        type: widgetType,
        title: config.title || 'Unnamed Widget',
        cols: config.cols || 4,
        rows: config.rows || 3,
        minCols: config.minCols || 2,
        maxCols: config.maxCols || 8,
        minRows: config.minRows || 2,
        maxRows: config.maxRows || 6,
        component: config.component || component.name,
        refreshInterval: config.refreshInterval || 300,
        permissions: config.permissions || [],
        theme: config.theme || 'auto'
      }
    });
  }

  getWidgetType(widgetType: string): Type<any> {
    return this.registry.get(widgetType)?.component || DefaultWidgetComponent;
  }

  getWidgetConfig(widgetType: string): WidgetConfig | undefined {
    return this.registry.get(widgetType)?.config;
  }

  getAllWidgetConfigs(): WidgetConfig[] {
    return Array.from(this.registry.values()).map(v => v.config);
  }
}