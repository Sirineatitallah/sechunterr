import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface DashboardWidget {
  id: string;
  name: string;
  type: string;
  icon: string;
  cols: number;
  rows: number;
  x?: number;
  y?: number;
  lastUpdated?: Date;
  data?: any;
  isLoading?: boolean;
  error?: string;
  exportable?: boolean;
  visible?: boolean;
}

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  createdAt: Date;
  updatedAt: Date;
  isDefault?: boolean;
}

export interface DashboardState {
  currentLayout: string;
  layouts: DashboardLayout[];
  selectedInstance: string;
  dateRange: {
    start: string;
    end: string;
  };
  viewMode: 'grid' | 'list';
  theme: 'light' | 'dark';
  refreshInterval: number; // in seconds, 0 means no auto-refresh
}

const DEFAULT_STATE: DashboardState = {
  currentLayout: 'default',
  layouts: [
    {
      id: 'default',
      name: 'Default Layout',
      widgets: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isDefault: true
    }
  ],
  selectedInstance: '',
  dateRange: {
    start: '',
    end: ''
  },
  viewMode: 'grid',
  theme: 'light',
  refreshInterval: 0
};

@Injectable({
  providedIn: 'root'
})
export class DashboardStateService {
  private readonly STORAGE_KEY = 'dashboard_state';
  private stateSubject = new BehaviorSubject<DashboardState>(DEFAULT_STATE);
  
  state$: Observable<DashboardState> = this.stateSubject.asObservable();
  
  constructor() {
    this.loadState();
  }
  
  /**
   * Get the current dashboard state
   */
  getState(): DashboardState {
    return this.stateSubject.value;
  }
  
  /**
   * Get the current layout
   */
  getCurrentLayout(): DashboardLayout | undefined {
    const state = this.getState();
    return state.layouts.find(layout => layout.id === state.currentLayout);
  }
  
  /**
   * Update the dashboard state
   */
  updateState(state: Partial<DashboardState>): void {
    const currentState = this.getState();
    const newState = { ...currentState, ...state };
    this.stateSubject.next(newState);
    this.saveState(newState);
  }
  
  /**
   * Update the current layout
   */
  updateCurrentLayout(layoutUpdates: Partial<DashboardLayout>): void {
    const state = this.getState();
    const currentLayoutIndex = state.layouts.findIndex(layout => layout.id === state.currentLayout);
    
    if (currentLayoutIndex === -1) return;
    
    const updatedLayouts = [...state.layouts];
    updatedLayouts[currentLayoutIndex] = {
      ...updatedLayouts[currentLayoutIndex],
      ...layoutUpdates,
      updatedAt: new Date()
    };
    
    this.updateState({ layouts: updatedLayouts });
  }
  
  /**
   * Update widgets in the current layout
   */
  updateWidgets(widgets: DashboardWidget[]): void {
    const currentLayout = this.getCurrentLayout();
    if (!currentLayout) return;
    
    this.updateCurrentLayout({ widgets });
  }
  
  /**
   * Add a new layout
   */
  addLayout(layout: Omit<DashboardLayout, 'createdAt' | 'updatedAt'>): void {
    const state = this.getState();
    const newLayout: DashboardLayout = {
      ...layout,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.updateState({
      layouts: [...state.layouts, newLayout]
    });
  }
  
  /**
   * Delete a layout
   */
  deleteLayout(layoutId: string): void {
    const state = this.getState();
    
    // Don't delete the default layout
    const isDefault = state.layouts.find(layout => layout.id === layoutId)?.isDefault;
    if (isDefault) return;
    
    const updatedLayouts = state.layouts.filter(layout => layout.id !== layoutId);
    
    // If deleting the current layout, switch to default
    let currentLayout = state.currentLayout;
    if (currentLayout === layoutId) {
      const defaultLayout = updatedLayouts.find(layout => layout.isDefault);
      currentLayout = defaultLayout?.id || updatedLayouts[0]?.id || '';
    }
    
    this.updateState({
      layouts: updatedLayouts,
      currentLayout
    });
  }
  
  /**
   * Switch to a different layout
   */
  switchLayout(layoutId: string): void {
    const state = this.getState();
    const layoutExists = state.layouts.some(layout => layout.id === layoutId);
    
    if (layoutExists) {
      this.updateState({ currentLayout: layoutId });
    }
  }
  
  /**
   * Reset to default layout
   */
  resetToDefault(): void {
    const state = this.getState();
    const defaultLayout = state.layouts.find(layout => layout.isDefault);
    
    if (defaultLayout) {
      this.switchLayout(defaultLayout.id);
    }
  }
  
  /**
   * Save state to local storage
   */
  private saveState(state: DashboardState): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving dashboard state:', error);
    }
  }
  
  /**
   * Load state from local storage
   */
  private loadState(): void {
    try {
      const savedState = localStorage.getItem(this.STORAGE_KEY);
      
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        
        // Convert date strings back to Date objects
        if (parsedState.layouts) {
          parsedState.layouts.forEach((layout: any) => {
            layout.createdAt = new Date(layout.createdAt);
            layout.updatedAt = new Date(layout.updatedAt);
            
            layout.widgets.forEach((widget: any) => {
              if (widget.lastUpdated) {
                widget.lastUpdated = new Date(widget.lastUpdated);
              }
            });
          });
        }
        
        this.stateSubject.next({
          ...DEFAULT_STATE,
          ...parsedState
        });
      }
    } catch (error) {
      console.error('Error loading dashboard state:', error);
      this.stateSubject.next(DEFAULT_STATE);
    }
  }
  
  /**
   * Clear all saved state
   */
  clearState(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.stateSubject.next(DEFAULT_STATE);
  }
}
