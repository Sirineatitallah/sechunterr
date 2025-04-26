export interface WidgetPosition {
    id: string;
    type: string;
    x: number;
    y: number;
    cols: number;
    rows: number;
    config?: {
        refreshInterval?: number;
        title?: string;
        dataSource?: string;
        refreshRate?: number; 
    };
  }