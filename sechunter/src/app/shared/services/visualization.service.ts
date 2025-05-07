import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FilterOptions } from '../components/visualization-filter/visualization-filter.component';

export interface TimeRange {
  id: string;
  label: string;
  days: number;
}

export interface ChartTheme {
  background: string;
  textColor: string;
  gridColor: string;
  tooltipBackground: string;
  tooltipTextColor: string;
  colorScheme: string[];
}

@Injectable({
  providedIn: 'root'
})
export class VisualizationService {
  // Default time ranges
  private timeRanges: TimeRange[] = [
    { id: '7d', label: '7 jours', days: 7 },
    { id: '30d', label: '30 jours', days: 30 },
    { id: '6m', label: '6 mois', days: 180 },
    { id: '1y', label: '1 an', days: 365 }
  ];

  // Default chart theme
  private darkTheme: ChartTheme = {
    background: 'rgba(26, 27, 38, 0.8)',
    textColor: '#e1e1e6',
    gridColor: 'rgba(255, 255, 255, 0.1)',
    tooltipBackground: 'rgba(16, 18, 27, 0.8)',
    tooltipTextColor: '#ffffff',
    colorScheme: [
      '#00f3ff', // Cyan
      '#bc13fe', // Purple
      '#ff4757', // Red
      '#ffa502', // Orange
      '#2ed573', // Green
      '#70a1ff', // Blue
      '#ffdb58'  // Yellow
    ]
  };

  // Selected time range
  private selectedTimeRangeSubject = new BehaviorSubject<TimeRange>(this.timeRanges[0]);

  // Chart refresh trigger
  private refreshTriggerSubject = new BehaviorSubject<boolean>(false);

  // Current filters
  private filtersSubject = new BehaviorSubject<FilterOptions>({
    severities: [],
    dateRange: {
      start: null,
      end: null
    },
    searchTerm: '',
    sortBy: 'value',
    sortDirection: 'desc'
  });

  constructor() { }

  // Get available time ranges
  getTimeRanges(): TimeRange[] {
    return this.timeRanges;
  }

  // Get current theme
  getTheme(): ChartTheme {
    return this.darkTheme;
  }

  // Get selected time range
  getSelectedTimeRange(): TimeRange {
    return this.selectedTimeRangeSubject.getValue();
  }

  // Get selected time range as observable
  get selectedTimeRange$(): Observable<TimeRange> {
    return this.selectedTimeRangeSubject.asObservable();
  }

  // Get refresh trigger as observable
  get refreshTrigger$(): Observable<boolean> {
    return this.refreshTriggerSubject.asObservable();
  }

  // Get filters as observable
  get filters$(): Observable<FilterOptions> {
    return this.filtersSubject.asObservable();
  }

  // Get current filters
  getFilters(): FilterOptions {
    return this.filtersSubject.getValue();
  }

  // Set selected time range
  setTimeRange(rangeId: string): void {
    const range = this.timeRanges.find(r => r.id === rangeId);
    if (range) {
      this.selectedTimeRangeSubject.next(range);
    }
  }

  // Trigger refresh for all charts
  triggerRefresh(): void {
    this.refreshTriggerSubject.next(true);
    // Reset after a short delay
    setTimeout(() => {
      this.refreshTriggerSubject.next(false);
    }, 100);
  }

  // Set filters
  setFilters(filters: FilterOptions): void {
    this.filtersSubject.next(filters);
    // Trigger refresh to apply filters
    this.triggerRefresh();
  }

  // Get color for severity level
  getSeverityColor(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'critique':
        return '#ff4757';
      case 'high':
      case 'haute':
        return '#ffa502';
      case 'medium':
      case 'moyenne':
        return '#ffdb58';
      case 'low':
      case 'faible':
        return '#2ed573';
      case 'info':
        return '#70a1ff';
      default:
        return '#e1e1e6';
    }
  }

  // Format date for display
  formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Generate random data for demo purposes
  generateRandomData(categories: string[], min: number = 10, max: number = 100): any[] {
    return categories.map(category => ({
      name: category,
      value: Math.floor(Math.random() * (max - min + 1)) + min
    }));
  }

  // Generate random time series data
  generateTimeSeriesData(days: number, categories: string[]): any[] {
    const result = [];
    const now = new Date();

    for (let i = 0; i < categories.length; i++) {
      const series = [];
      for (let j = days; j >= 0; j--) {
        const date = new Date();
        date.setDate(now.getDate() - j);
        series.push({
          name: date.toISOString().split('T')[0],
          value: Math.floor(Math.random() * 50) + 10
        });
      }
      result.push({
        name: categories[i],
        series: series
      });
    }

    return result;
  }
}
