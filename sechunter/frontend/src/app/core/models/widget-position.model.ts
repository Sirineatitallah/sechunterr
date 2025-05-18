// src/app/core/models/widget-position.model.ts
export interface WidgetPosition {
    id: string;
    type: string;
    x: number;
    y: number;
    cols: number;
    rows: number;
    title?: string;
    isResizing?: boolean;  // Already correct
    config?: {
      refreshInterval?: number;
      title?: string;
      dataSource?: string;
    };
    data?: { 
      icon: string;
      [key: string]: any;
    };
  }