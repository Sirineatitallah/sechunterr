import { Component, OnInit, OnDestroy, isDevMode } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridsterModule, GridsterConfig, GridsterItem, GridType, GridsterItemComponent } from 'angular-gridster2';
import { Router, RouterModule } from '@angular/router';
// Removed unused import WidgetComponent
import { WidgetPosition } from '../core/models/widget-position.model';
import { MicroserviceConnectorService, MicroserviceType } from '../core/services/microservice-connector.service';
import { DashboardService } from './services/dashboard.service';
import { AuthService } from '../core/services/auth.service';
import { FullscreenService } from '../core/services/fullscreen.service';
import { FullscreenButtonComponent } from '../shared/components/fullscreen-button/fullscreen-button.component';
import { Subscription, debounceTime } from 'rxjs';
// These components are no longer used directly in the template
// import { FavoritesQuickWidgetsComponent } from "./components/favorites-quick-widgets/favorites-quick-widgets.component";
// import { InstanceManagerComponent } from "./components/instance-manager/instance-manager.component";
// import { RecentMemosComponent } from "./components/recent-memos/recent-memos.component";
// import { UserRole } from '../core/models/user.model'; // Not used
// import { DashboardWidget, WidgetType } from '../core/models/dashboard-widget.model'; // Not used

interface DashboardItem extends GridsterItem, WidgetPosition {
  componentType: string;
  data?: {
    icon: string;
    [key: string]: any;
  };
  config?: Record<string, unknown>;
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    GridsterModule,
    RouterModule,
    FullscreenButtonComponent
    // These components are no longer used directly in the template
    // FavoritesQuickWidgetsComponent,
    // InstanceManagerComponent,
    // RecentMemosComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  // private readonly LAYOUT_SAVE_DEBOUNCE = 1000; // Not used
  private readonly DEFAULT_WIDGET_SIZE = { cols: 2, rows: 2 };

  gridsterOptions: GridsterConfig = {
    gridType: GridType.Fit,
    margin: 12,
    outerMargin: true,
    draggable: {
      enabled: true,
      ignoreContent: true,
      dragHandleClass: 'drag-handle'
    },
    resizable: {
      enabled: true,
      handles: {
        s: true,
        e: true,
        n: true,
        w: true,
        se: true,
        ne: true,
        sw: true,
        nw: true
      }
    },
    mobileBreakpoint: 768,
    minCols: 6,
    maxCols: 12,
    minRows: 4,
    pushItems: true,
    swap: false,
    disableWindowResize: false,
    enableSmoothTransition: true,
    itemChangeCallback: () => this.queueLayoutSave(),
    itemResizeCallback: () => this.queueLayoutSave(),
  };

  dashboardWidgets: DashboardItem[] = [];
  private layoutSaveQueue: Subscription | null = null;
  private subscriptions: Subscription[] = [];

  constructor(
    private readonly microserviceConnector: MicroserviceConnectorService,
    private readonly dashboardService: DashboardService,
    private readonly fullscreenService: FullscreenService
  ) {}

  ngOnInit() {
    this.initLayoutSubscription();
    this.initDataSubscriptions();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.layoutSaveQueue?.unsubscribe();
  }

  trackByWidgetId(_index: number, widget: DashboardItem): string {
    return widget.id;
  }

  private initLayoutSubscription(): void {
    const layoutSub = this.dashboardService.layout$
      .subscribe(layout => {
        this.dashboardWidgets = layout?.length
          ? this.normalizeWidgetPositions(layout)
          : this.getDefaultLayout();
      });

    this.subscriptions.push(layoutSub);
  }

  private initDataSubscriptions(): void {
    // In development mode, use mock data instead of making API calls
    if (isDevMode()) {
      console.log('Running in development mode - using mock data for dashboard widgets');

      // Mock data for vulnerability scanner
      const mockVulnData = {
        icon: 'security',
        criticalCount: 12,
        highCount: 28,
        mediumCount: 45,
        lowCount: 67,
        trend: 'decreasing'
      };

      // Mock data for threat intel
      const mockThreatData = {
        icon: 'warning',
        alerts: [
          { severity: 'high', source: 'darkweb', description: 'Credentials leaked' },
          { severity: 'medium', source: 'osint', description: 'New vulnerability disclosed' }
        ],
        lastUpdated: new Date().toISOString()
      };

      // Update widgets with mock data
      this.updateWidgetData('vulnerability-chart', mockVulnData);
      this.updateWidgetData('threat-feed', mockThreatData);
    } else {
      // In production mode, make the actual API calls
      this.subscriptions.push(
        this.microserviceConnector.getRealTimeServiceData(MicroserviceType.VULNERABILITY_SCANNER)
          .subscribe(data => this.updateWidgetData('vulnerability-chart', data)),

        this.microserviceConnector.getRealTimeServiceData(MicroserviceType.THREAT_INTEL)
          .subscribe(data => this.updateWidgetData('threat-feed', data))
      );
    }
  }

  private normalizeWidgetPositions(layout: WidgetPosition[]): DashboardItem[] {
    return layout.map((widget) => ({
      ...this.DEFAULT_WIDGET_SIZE,
      componentType: 'generic',
      ...widget,
      config: widget.config || {},
      data: undefined
    }));
  }

  private getDefaultLayout(): DashboardItem[] {
    return [
      this.createWidget('vulnerability-chart', 0, 0, { cols: 2, rows: 1 }, 'chart1', { title: 'Vulnerability Trends' }),
      this.createWidget('threat-feed', 2, 0, { cols: 1, rows: 1 }, 'feed1', { dataSource: 'threat-api' }),
      this.createWidget('asm-heatmap', 0, 1, { cols: 2, rows: 2 }, 'asm1', { title: 'ASM Heatmap' }),
      this.createWidget('vi-radar', 2, 1, { cols: 2, rows: 2 }, 'vi1', { title: 'Vulnerability Radar' }),
      this.createWidget('cti-world-map', 0, 3, { cols: 3, rows: 2 }, 'cti1', { title: 'CTI World Threat Map' }),
      this.createWidget('soar-gantt', 3, 3, { cols: 3, rows: 2 }, 'soar1', { title: 'SOAR Workflow' })
    ];
  }

  private createWidget(
    type: string,
    x: number,
    y: number,
    size: { cols: number; rows: number },
    id: string,
    config?: Record<string, unknown>
  ): DashboardItem {
    return {
      id,
      type,
      x,
      y,
      cols: size.cols,
      rows: size.rows,
      componentType: type,
      config: config || {},
      data: undefined
    };
  }

  private updateWidgetData(widgetType: string, data: unknown): void {
    const widget = this.dashboardWidgets.find(w => w.componentType === widgetType);
    if (widget) {
      // Type guard to ensure data has 'icon' property, else assign default icon
      if (data && typeof data === 'object' && 'icon' in data) {
        widget.data = data as { icon: string; [key: string]: any };
      } else {
        widget.data = { icon: 'default-icon' };
      }
    }
  }

  private queueLayoutSave(): void {
    this.layoutSaveQueue?.unsubscribe();
    // Call saveLayout directly as it returns void
    this.dashboardService.saveLayout(this.dashboardWidgets);
  }
}
