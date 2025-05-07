import { WidgetPosition } from './widget-position.model';

export interface DashboardWidget extends WidgetPosition {
  id: string;
  title: string;
  type: WidgetType;
  icon?: string;
  data?: any;
  config?: any;
  userRole: string[];
  clientId?: string;
}

export enum WidgetType {
  VULNERABILITY_CHART = 'vulnerability-chart',
  THREAT_FEED = 'threat-feed',
  ASM_HEATMAP = 'asm-heatmap',
  VI_RADAR = 'vi-radar',
  CTI_WORLD_MAP = 'cti-world-map',
  SOAR_GANTT = 'soar-gantt',
  COMPLIANCE_DASHBOARD = 'compliance-dashboard',
  TOP_VULNERABILITIES = 'top-vulnerabilities',
  THREAT_INTEL_DIGEST = 'threat-intel-digest',
  ASM_SURFACE_REPORT = 'asm-surface-report',
  SOC_ACTIVITY_LOGS = 'soc-activity-logs',
  AGGREGATED_THREAT_MAP = 'aggregated-threat-map'
}

export interface WidgetAction {
  id: string;
  widgetId: string;
  action: string;
  data?: any;
  timestamp: Date;
}
