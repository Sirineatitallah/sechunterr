// src/app/core/models/widget-position.model.ts
export interface WidgetPosition {
  id: string;
  x: number;
  y: number;
  cols: number;
  rows: number;
  type: string;
  config?: any;
}