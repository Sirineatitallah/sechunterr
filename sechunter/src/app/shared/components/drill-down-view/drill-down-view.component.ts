import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { NgApexchartsModule } from 'ng-apexcharts';
import { RouterModule } from '@angular/router';

export interface DrillDownData {
  title: string;
  subtitle?: string;
  type: 'vulnerability' | 'threat' | 'asset' | 'incident' | 'playbook' | 'generic';
  id: string;
  summary?: {
    [key: string]: {
      label: string;
      value: string | number;
      color?: string;
      icon?: string;
      trend?: number;
    }
  };
  details?: any;
  relatedItems?: any[];
  timeline?: {
    date: Date;
    event: string;
    description?: string;
    icon?: string;
    color?: string;
  }[];
  charts?: {
    id: string;
    title: string;
    type: 'bar' | 'line' | 'pie' | 'radar' | 'heatmap';
    data: any;
  }[];
  tables?: {
    id: string;
    title: string;
    columns: { key: string; header: string }[];
    data: any[];
  }[];
  actions?: {
    label: string;
    icon?: string;
    action: string;
    color?: 'primary' | 'accent' | 'warn';
    disabled?: boolean;
  }[];
}

@Component({
  selector: 'app-drill-down-view',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressBarModule,
    MatDividerModule,
    NgApexchartsModule,
    RouterModule
  ],
  templateUrl: './drill-down-view.component.html',
  styleUrls: ['./drill-down-view.component.scss']
})
export class DrillDownViewComponent implements OnInit {
  @Input() data!: DrillDownData;
  @Input() loading: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() action = new EventEmitter<{ action: string; data: any }>();

  // Make Math available to the template
  Math = Math;

  activeTab = 0;
  tablePagination: { [key: string]: { pageIndex: number; pageSize: number } } = {};
  tableSorting: { [key: string]: { active: string; direction: 'asc' | 'desc' } } = {};

  constructor() { }

  ngOnInit(): void {
    // Initialize pagination and sorting for tables
    if (this.data?.tables) {
      this.data.tables.forEach(table => {
        this.tablePagination[table.id] = { pageIndex: 0, pageSize: 10 };
        this.tableSorting[table.id] = { active: '', direction: 'asc' };
      });
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onAction(actionName: string): void {
    this.action.emit({ action: actionName, data: this.data });
  }

  onTabChange(index: number): void {
    this.activeTab = index;
  }

  onPageChange(event: PageEvent, tableId: string): void {
    this.tablePagination[tableId] = {
      pageIndex: event.pageIndex,
      pageSize: event.pageSize
    };
  }

  onSortChange(sort: Sort, tableId: string): void {
    this.tableSorting[tableId] = {
      active: sort.active,
      direction: sort.direction as 'asc' | 'desc'
    };
  }

  getDisplayedColumns(table: any): string[] {
    return table.columns.map((col: any) => col.key);
  }

  getColumnHeaders(table: any): { [key: string]: string } {
    const headers: { [key: string]: string } = {};
    table.columns.forEach((col: any) => {
      headers[col.key] = col.header;
    });
    return headers;
  }

  getPaginatedData(tableId: string, data: any[]): any[] {
    const pagination = this.tablePagination[tableId];
    if (!pagination) return data;

    const startIndex = pagination.pageIndex * pagination.pageSize;
    return data.slice(startIndex, startIndex + pagination.pageSize);
  }

  getSortedData(tableId: string, data: any[]): any[] {
    const sorting = this.tableSorting[tableId];
    if (!sorting || !sorting.active || !sorting.direction) return data;

    return [...data].sort((a, b) => {
      const isAsc = sorting.direction === 'asc';
      const valueA = a[sorting.active];
      const valueB = b[sorting.active];

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return (valueA - valueB) * (isAsc ? 1 : -1);
      }

      const strA = String(valueA).toLowerCase();
      const strB = String(valueB).toLowerCase();
      return strA.localeCompare(strB) * (isAsc ? 1 : -1);
    });
  }

  getTypeIcon(): string {
    switch (this.data.type) {
      case 'vulnerability': return 'bug_report';
      case 'threat': return 'security';
      case 'asset': return 'devices';
      case 'incident': return 'warning';
      case 'playbook': return 'play_circle';
      default: return 'info';
    }
  }

  getTypeColor(): string {
    switch (this.data.type) {
      case 'vulnerability': return '#f44336'; // Red
      case 'threat': return '#ff9800'; // Orange
      case 'asset': return '#2196f3'; // Blue
      case 'incident': return '#ff5722'; // Deep Orange
      case 'playbook': return '#4caf50'; // Green
      default: return '#9e9e9e'; // Grey
    }
  }

  getTrendIcon(trend: number): string {
    if (trend > 0) return 'trending_up';
    if (trend < 0) return 'trending_down';
    return 'trending_flat';
  }

  getTrendClass(trend: number, isPositiveGood: boolean = false): string {
    if (trend === 0) return 'trend-neutral';

    const isPositive = trend > 0;
    if (isPositiveGood) {
      return isPositive ? 'trend-positive' : 'trend-negative';
    } else {
      return isPositive ? 'trend-negative' : 'trend-positive';
    }
  }

  formatValue(value: any): string {
    if (value === null || value === undefined) return '-';

    if (typeof value === 'number') {
      // Format large numbers with commas
      if (value >= 1000) {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }
      return value.toString();
    }

    if (value instanceof Date) {
      return value.toLocaleString();
    }

    return String(value);
  }

  // Check if a value is an object
  isObject(value: any): boolean {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  // Convert an object to an array of key-value pairs
  objectToKeyValue(obj: any): { key: string; value: any }[] {
    if (!this.isObject(obj)) {
      return [];
    }

    return Object.entries(obj as Record<string, any>).map(([key, value]) => ({ key, value }));
  }

  // Get a property from tablePagination with a default value
  getTablePaginationProperty(tableId: string, property: 'pageSize' | 'pageIndex', defaultValue: number): number {
    if (!this.tablePagination[tableId]) {
      return defaultValue;
    }

    return this.tablePagination[tableId][property] !== undefined
      ? this.tablePagination[tableId][property]
      : defaultValue;
  }
}
