export interface WidgetConfig {
    type: string;
    title: string;
    cols: number;
    minCols?: number;
    maxCols?: number;
    rows: number;
    minRows?: number;
    maxRows?: number;
    component: string;
    dataSource?: string;
    refreshInterval?: number;
    permissions?: string[];
    theme?: 'light' | 'dark' | 'auto';
    allowedActions?: ('refresh' | 'expand' | 'configure')[];
    defaultPosition?: { x: number; y: number };
  }
  
  // Default configurations
  export const DEFAULT_WIDGET_CONFIGS: { [key: string]: WidgetConfig } = {
    'threat-intel': {
      type: 'threat-intel',
      title: 'Threat Intelligence Feed',
      cols: 6,
      rows: 4,
      minCols: 4,
      maxCols: 8,
      component: 'ThreatFeedComponent',
      refreshInterval: 60,
      theme: 'dark'
    },
    'vulnerability-scanner': {
      type: 'vulnerability-scanner',
      title: 'Vulnerability Scanner',
      cols: 4,
      rows: 3,
      component: 'VulnerabilityScannerComponent',
      refreshInterval: 300
    }
  };