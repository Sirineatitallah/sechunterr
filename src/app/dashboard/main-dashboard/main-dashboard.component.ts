import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Router, RouterModule, RouterLink } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { DashboardDataService } from '../services/dashboard-data.service';
import { ExportService, ExportFormat } from '../services/export.service';
import { DashboardStateService, DashboardWidget as StateWidget } from '../services/dashboard-state.service';
import { RealTimeService } from '../services/real-time.service';
import { Subscription } from 'rxjs';

// Import shared components
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ErrorDisplayComponent } from '../../shared/components/error-display/error-display.component';
import { LayoutManagerComponent } from '../components/layout-manager/layout-manager.component';
import { AutoRefreshComponent } from '../components/auto-refresh/auto-refresh.component';

// Import visualization components
import { TopVulnerabilitiesComponent } from '../../modules/vi/components/top-vulnerabilities/top-vulnerabilities.component';
import { SeverityDistributionComponent } from '../../modules/vi/components/severity-distribution/severity-distribution.component';
import { MonthlyTrendsComponent } from '../../modules/vi/components/monthly-trends/monthly-trends.component';
import { ThreatMapComponent } from '../../modules/cti/components/threat-map/threat-map.component';
import { MitreHeatmapComponent } from '../../modules/cti/components/mitre-heatmap/mitre-heatmap.component';
import { ThreatEvolutionComponent } from '../../modules/cti/components/threat-evolution/threat-evolution.component';
import { AttackSurfaceComponent } from '../../modules/asm/components/attack-surface/attack-surface.component';
import { ExternalRisksComponent } from '../../modules/asm/components/external-risks/external-risks.component';
import { RiskScoreComponent } from '../../modules/asm/components/risk-score/risk-score.component';
import { IncidentTimelineComponent } from '../../modules/soar/components/incident-timeline/incident-timeline.component';
import { ResolutionRateComponent } from '../../modules/soar/components/resolution-rate/resolution-rate.component';
import { ActivePlaybooksComponent } from '../../modules/soar/components/active-playbooks/active-playbooks.component';

interface DashboardWidget {
  id: string;
  name: string;
  type: string;
  icon: string;
  cols: number;
  rows: number;
  lastUpdated?: Date;
  data?: any;
  isLoading?: boolean;
  error?: string;
  exportable?: boolean;
}

interface GalleryWidget {
  id: string;
  name: string;
  description: string;
  type: string;
  icon: string;
  defaultCols: number;
  defaultRows: number;
  module: 'vi' | 'asm' | 'cti' | 'soar';
}

interface WidgetSection {
  id: string;
  title: string;
  collapsed: boolean;
  widgets: DashboardWidget[];
}

interface Instance {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
}

@Component({
  selector: 'app-main-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    RouterModule,
    RouterLink,

    // Shared Components
    LoadingComponent,
    ErrorDisplayComponent,
    LayoutManagerComponent,
    AutoRefreshComponent,

    // VI Components
    TopVulnerabilitiesComponent,
    SeverityDistributionComponent,
    MonthlyTrendsComponent,

    // CTI Components
    ThreatMapComponent,
    MitreHeatmapComponent,
    ThreatEvolutionComponent,

    // ASM Components
    AttackSurfaceComponent,
    ExternalRisksComponent,
    RiskScoreComponent,

    // SOAR Components
    IncidentTimelineComponent,
    ResolutionRateComponent,
    ActivePlaybooksComponent
  ],
  templateUrl: './main-dashboard.component.html',
  styleUrls: ['./main-dashboard.component.scss']
})
export class MainDashboardComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  // Theme
  darkMode = false;

  // Dashboard state
  currentView: 'grid' | 'list' = 'grid';
  showWidgetGallery = false;
  activeGalleryTab: 'all' | 'vi' | 'asm' | 'cti' | 'soar' = 'all';
  widgetSearchTerm = '';
  expandedWidget: DashboardWidget | null = null;

  // Date range
  showDatePicker = false;
  startDate = '';
  endDate = '';
  currentDateRange = 'Derniers 30 jours';

  // Instance
  selectedInstance: Instance | null = null;
  instances: Instance[] = [
    { id: 'inst1', name: 'Client Instance 1', status: 'healthy' },
    { id: 'inst2', name: 'Client Instance 2', status: 'warning' },
    { id: 'inst3', name: 'Client Instance 3', status: 'critical' },
    { id: 'inst4', name: 'Client Instance 4', status: 'offline' }
  ];

  // Dashboard widgets
  dashboardWidgets: DashboardWidget[] = [
    {
      id: 'widget1',
      name: 'Top Vulnérabilités',
      type: 'vi-top',
      icon: 'bug_report',
      cols: 4,
      rows: 2,
      lastUpdated: new Date(),
      isLoading: false,
      error: null,
      exportable: true
    },
    {
      id: 'widget2',
      name: 'Distribution par Sévérité',
      type: 'vi-severity',
      icon: 'pie_chart',
      cols: 2,
      rows: 2,
      lastUpdated: new Date(),
      isLoading: false,
      error: null,
      exportable: true
    },
    {
      id: 'widget3',
      name: 'Carte des Menaces',
      type: 'cti-map',
      icon: 'public',
      cols: 6,
      rows: 3,
      lastUpdated: new Date(),
      isLoading: false,
      error: null,
      exportable: true
    },
    {
      id: 'widget4',
      name: 'Score de Risque',
      type: 'asm-score',
      icon: 'speed',
      cols: 2,
      rows: 2,
      lastUpdated: new Date(),
      isLoading: false,
      error: null,
      exportable: true
    },
    {
      id: 'widget5',
      name: 'Timeline des Incidents',
      type: 'soar-timeline',
      icon: 'timeline',
      cols: 6,
      rows: 2,
      lastUpdated: new Date(),
      isLoading: false,
      error: null,
      exportable: true
    },
    {
      id: 'widget6',
      name: 'Tendances Mensuelles',
      type: 'vi-trends',
      icon: 'trending_up',
      cols: 4,
      rows: 2,
      lastUpdated: new Date(),
      isLoading: false,
      error: null,
      exportable: true
    }
  ];

  // Widget gallery
  galleryWidgets: GalleryWidget[] = [
    {
      id: 'gallery1',
      name: 'Top Vulnérabilités',
      description: 'Affiche les vulnérabilités les plus critiques',
      type: 'vi-top',
      icon: 'bug_report',
      defaultCols: 4,
      defaultRows: 2,
      module: 'vi'
    },
    {
      id: 'gallery2',
      name: 'Distribution par Sévérité',
      description: 'Répartition des vulnérabilités par niveau de sévérité',
      type: 'vi-severity',
      icon: 'pie_chart',
      defaultCols: 2,
      defaultRows: 2,
      module: 'vi'
    },
    {
      id: 'gallery3',
      name: 'Tendances Mensuelles',
      description: 'Évolution des vulnérabilités sur les derniers mois',
      type: 'vi-trends',
      icon: 'trending_up',
      defaultCols: 4,
      defaultRows: 2,
      module: 'vi'
    },
    {
      id: 'gallery4',
      name: 'Carte des Menaces',
      description: 'Visualisation géographique des menaces',
      type: 'cti-map',
      icon: 'public',
      defaultCols: 6,
      defaultRows: 3,
      module: 'cti'
    },
    {
      id: 'gallery5',
      name: 'Heatmap MITRE ATT&CK',
      description: 'Heatmap des techniques d\'attaque selon MITRE',
      type: 'cti-mitre',
      icon: 'grid_view',
      defaultCols: 4,
      defaultRows: 3,
      module: 'cti'
    },
    {
      id: 'gallery6',
      name: 'Évolution des Menaces',
      description: 'Évolution des menaces dans le temps',
      type: 'cti-evolution',
      icon: 'show_chart',
      defaultCols: 4,
      defaultRows: 2,
      module: 'cti'
    },
    {
      id: 'gallery7',
      name: 'Surface d\'Attaque',
      description: 'Visualisation de la surface d\'attaque',
      type: 'asm-surface',
      icon: 'radar',
      defaultCols: 4,
      defaultRows: 3,
      module: 'asm'
    },
    {
      id: 'gallery8',
      name: 'Risques Externes',
      description: 'Analyse des risques externes',
      type: 'asm-risks',
      icon: 'security',
      defaultCols: 4,
      defaultRows: 2,
      module: 'asm'
    },
    {
      id: 'gallery9',
      name: 'Score de Risque',
      description: 'Score global de risque',
      type: 'asm-score',
      icon: 'speed',
      defaultCols: 2,
      defaultRows: 2,
      module: 'asm'
    },
    {
      id: 'gallery10',
      name: 'Timeline des Incidents',
      description: 'Chronologie des incidents',
      type: 'soar-timeline',
      icon: 'timeline',
      defaultCols: 6,
      defaultRows: 2,
      module: 'soar'
    },
    {
      id: 'gallery11',
      name: 'Taux de Résolution',
      description: 'Taux de résolution des incidents',
      type: 'soar-resolution',
      icon: 'check_circle',
      defaultCols: 2,
      defaultRows: 2,
      module: 'soar'
    },
    {
      id: 'gallery12',
      name: 'Playbooks Actifs',
      description: 'Playbooks de réponse actifs',
      type: 'soar-playbooks',
      icon: 'play_circle',
      defaultCols: 4,
      defaultRows: 2,
      module: 'soar'
    }
  ];

  // Widget sections for list view
  widgetSections: WidgetSection[] = [
    {
      id: 'section1',
      title: 'Vulnerability Intelligence',
      collapsed: false,
      widgets: []
    },
    {
      id: 'section2',
      title: 'Cyber Threat Intelligence',
      collapsed: false,
      widgets: []
    },
    {
      id: 'section3',
      title: 'Attack Surface Management',
      collapsed: false,
      widgets: []
    },
    {
      id: 'section4',
      title: 'Security Orchestration & Response',
      collapsed: false,
      widgets: []
    }
  ];

  // Export options
  showExportOptions = false;
  activeExportWidget: DashboardWidget | null = null;
  exportFormats: { id: ExportFormat; name: string; icon: string }[] = [
    { id: 'csv', name: 'CSV', icon: 'table_view' },
    { id: 'excel', name: 'Excel', icon: 'grid_on' },
    { id: 'pdf', name: 'PDF', icon: 'picture_as_pdf' },
    { id: 'image', name: 'Image', icon: 'image' },
    { id: 'json', name: 'JSON', icon: 'code' }
  ];

  // Layout manager
  showLayoutManager = false;

  constructor(
    private themeService: ThemeService,
    private dashboardDataService: DashboardDataService,
    private exportService: ExportService,
    private dashboardStateService: DashboardStateService,
    private realTimeService: RealTimeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to theme changes
    this.subscriptions.push(
      this.themeService.theme$.subscribe(theme => {
        this.darkMode = theme === 'dark';
      })
    );

    // Subscribe to dashboard state changes
    this.subscriptions.push(
      this.dashboardStateService.state$.subscribe(state => {
        // Update theme
        if (state.theme) {
          this.themeService.setTheme(state.theme);
        }

        // Update view mode
        this.viewMode = state.viewMode;

        // Update date range
        if (state.dateRange.start && state.dateRange.end) {
          this.startDate = state.dateRange.start;
          this.endDate = state.dateRange.end;
          this.currentDateRange = `${this.startDate} - ${this.endDate}`;
        }

        // Update selected instance
        if (state.selectedInstance) {
          const instance = this.instances.find(i => i.id === state.selectedInstance);
          if (instance) {
            this.selectedInstance = instance;
          }
        }

        // Update widgets from current layout
        const currentLayout = this.dashboardStateService.getCurrentLayout();
        if (currentLayout && currentLayout.widgets.length > 0) {
          this.dashboardWidgets = this.mapStateWidgetsToDashboardWidgets(currentLayout.widgets);
        }
      })
    );

    // Initialize with first instance
    this.selectedInstance = this.instances[0];

    // Initialize date range
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.startDate = this.formatDate(thirtyDaysAgo);
    this.endDate = this.formatDate(today);

    // Save initial state if no state exists
    const currentState = this.dashboardStateService.getState();
    if (!currentState.layouts[0].widgets.length) {
      this.saveCurrentStateToLayout();
    }

    // Organize widgets for list view
    this.organizeWidgetsForListView();

    // Load data for all widgets
    this.loadAllWidgetData();

    // Subscribe to loading and error states
    this.subscribeToWidgetStates();
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Load data for all dashboard widgets
   */
  loadAllWidgetData(): void {
    this.dashboardWidgets.forEach(widget => {
      this.loadWidgetData(widget);
    });
  }

  /**
   * Load data for a specific widget
   */
  loadWidgetData(widget: DashboardWidget, forceRefresh = false): void {
    widget.isLoading = true;
    widget.error = null;

    this.dashboardDataService.getWidgetData(widget.id, widget.type, forceRefresh)
      .subscribe({
        next: (data) => {
          widget.data = data;
          widget.lastUpdated = new Date();
          widget.isLoading = false;
        },
        error: (error) => {
          console.error(`Error loading widget ${widget.id}:`, error);
          widget.error = error.message || 'Failed to load data';
          widget.isLoading = false;
        }
      });
  }

  /**
   * Subscribe to widget loading and error states
   */
  subscribeToWidgetStates(): void {
    this.dashboardDataService.loading$.subscribe(loadingState => {
      this.dashboardWidgets.forEach(widget => {
        if (loadingState[widget.id] !== undefined) {
          widget.isLoading = loadingState[widget.id];
        }
      });
    });

    this.dashboardDataService.errors$.subscribe(errorState => {
      this.dashboardWidgets.forEach(widget => {
        if (errorState[widget.id]) {
          widget.error = errorState[widget.id];
        }
      });
    });
  }

  // Date methods
  toggleDatePicker(): void {
    this.showDatePicker = !this.showDatePicker;
  }

  selectDatePreset(preset: string): void {
    const today = new Date();
    let start = new Date();

    switch (preset) {
      case 'today':
        this.currentDateRange = 'Aujourd\'hui';
        start = today;
        break;
      case 'yesterday':
        start.setDate(today.getDate() - 1);
        this.currentDateRange = 'Hier';
        break;
      case 'week':
        start.setDate(today.getDate() - 7);
        this.currentDateRange = 'Derniers 7 jours';
        break;
      case 'month':
        start.setDate(today.getDate() - 30);
        this.currentDateRange = 'Derniers 30 jours';
        break;
      case 'quarter':
        start.setMonth(today.getMonth() - 3);
        this.currentDateRange = 'Ce trimestre';
        break;
    }

    this.startDate = this.formatDate(start);
    this.endDate = this.formatDate(today);
    this.showDatePicker = false;

    // Refresh dashboard with new date range
    this.refreshDashboard();
  }

  applyDateRange(): void {
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);

      // Format for display
      const startFormatted = start.toLocaleDateString();
      const endFormatted = end.toLocaleDateString();

      this.currentDateRange = `${startFormatted} - ${endFormatted}`;
      this.showDatePicker = false;

      // Refresh dashboard with new date range
      this.refreshDashboard();
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Dashboard view methods
  changeView(view: 'grid' | 'list'): void {
    this.currentView = view;

    if (view === 'list') {
      this.organizeWidgetsForListView();
    }
  }

  organizeWidgetsForListView(): void {
    // Reset sections
    this.widgetSections.forEach(section => {
      section.widgets = [];
    });

    // Organize widgets by type
    this.dashboardWidgets.forEach(widget => {
      if (widget.type.startsWith('vi-')) {
        this.widgetSections[0].widgets.push(widget);
      } else if (widget.type.startsWith('cti-')) {
        this.widgetSections[1].widgets.push(widget);
      } else if (widget.type.startsWith('asm-')) {
        this.widgetSections[2].widgets.push(widget);
      } else if (widget.type.startsWith('soar-')) {
        this.widgetSections[3].widgets.push(widget);
      }
    });
  }

  toggleSection(section: WidgetSection): void {
    section.collapsed = !section.collapsed;
  }

  // Widget gallery methods
  toggleWidgetGallery(): void {
    this.showWidgetGallery = !this.showWidgetGallery;
    this.activeGalleryTab = 'all';
    this.widgetSearchTerm = '';
  }

  setGalleryTab(tab: 'all' | 'vi' | 'asm' | 'cti' | 'soar'): void {
    this.activeGalleryTab = tab;
  }

  get filteredGalleryWidgets(): GalleryWidget[] {
    let widgets = this.galleryWidgets;

    // Filter by tab
    if (this.activeGalleryTab !== 'all') {
      widgets = widgets.filter(widget => widget.module === this.activeGalleryTab);
    }

    // Filter by search term
    if (this.widgetSearchTerm) {
      const term = this.widgetSearchTerm.toLowerCase();
      widgets = widgets.filter(widget =>
        widget.name.toLowerCase().includes(term) ||
        widget.description.toLowerCase().includes(term)
      );
    }

    return widgets;
  }

  // Widget actions
  addWidget(galleryWidget: GalleryWidget): void {
    // Check if widget already exists
    const existingWidget = this.dashboardWidgets.find(w => w.type === galleryWidget.type);

    if (!existingWidget) {
      const newWidget: DashboardWidget = {
        id: `widget${Date.now()}`,
        name: galleryWidget.name,
        type: galleryWidget.type,
        icon: galleryWidget.icon,
        cols: galleryWidget.defaultCols,
        rows: galleryWidget.defaultRows,
        lastUpdated: new Date()
      };

      this.dashboardWidgets.push(newWidget);

      // Update list view if active
      if (this.currentView === 'list') {
        this.organizeWidgetsForListView();
      }
    }

    this.showWidgetGallery = false;
  }

  refreshWidget(widget: DashboardWidget): void {
    console.log(`Refreshing widget: ${widget.name}`);
    this.loadWidgetData(widget, true);
  }

  /**
   * Show export options for a widget
   */
  showExportOptionsFor(widget: DashboardWidget, event: Event): void {
    event.stopPropagation();
    this.activeExportWidget = widget;
    this.showExportOptions = true;
  }

  /**
   * Hide export options
   */
  hideExportOptions(): void {
    this.showExportOptions = false;
    this.activeExportWidget = null;
  }

  /**
   * Export widget data
   */
  exportWidgetData(format: ExportFormat): void {
    if (!this.activeExportWidget) return;

    const widget = this.activeExportWidget;
    const filename = `${widget.name.replace(/\s+/g, '_').toLowerCase()}_${this.formatDate(new Date()).replace(/-/g, '')}`;

    // Get the widget data
    const data = widget.data?.data || [];

    try {
      this.exportService.exportData(data, format, filename);
      console.log(`Exported ${widget.name} as ${format}`);
    } catch (error) {
      console.error(`Error exporting widget data:`, error);
    }

    this.hideExportOptions();
  }

  /**
   * Export chart as image
   */
  exportWidgetAsImage(widget: DashboardWidget): void {
    // In a real implementation, you would get the chart element and export it
    const widgetElement = document.querySelector(`#widget-${widget.id} .widget-content`) as HTMLElement;
    if (widgetElement) {
      const filename = `${widget.name.replace(/\s+/g, '_').toLowerCase()}_${this.formatDate(new Date()).replace(/-/g, '')}`;
      this.exportService.exportChart(widgetElement, filename);
    }
  }

  expandWidget(widget: DashboardWidget): void {
    this.expandedWidget = widget;
  }

  closeExpandedWidget(): void {
    this.expandedWidget = null;
  }

  removeWidget(widget: DashboardWidget): void {
    this.dashboardWidgets = this.dashboardWidgets.filter(w => w.id !== widget.id);

    // Update list view if active
    if (this.currentView === 'list') {
      this.organizeWidgetsForListView();
    }
  }

  // Dashboard actions
  refreshDashboard(): void {
    console.log('Refreshing dashboard with date range:', this.currentDateRange);

    // Use real-time service to refresh data
    this.realTimeService.refreshData();

    // Load all widget data
    this.loadAllWidgetData();
  }

  /**
   * Handle widget error retry
   */
  retryLoadingWidget(widget: DashboardWidget): void {
    this.loadWidgetData(widget, true);
  }

  /**
   * Map state widgets to dashboard widgets
   */
  private mapStateWidgetsToDashboardWidgets(stateWidgets: StateWidget[]): DashboardWidget[] {
    return stateWidgets.map(widget => ({
      ...widget,
      isLoading: false,
      error: null
    }));
  }

  /**
   * Map dashboard widgets to state widgets
   */
  private mapDashboardWidgetsToStateWidgets(): StateWidget[] {
    return this.dashboardWidgets.map(widget => ({
      id: widget.id,
      name: widget.name,
      type: widget.type,
      icon: widget.icon,
      cols: widget.cols,
      rows: widget.rows,
      x: widget.x,
      y: widget.y,
      lastUpdated: widget.lastUpdated,
      exportable: widget.exportable,
      visible: true
    }));
  }

  /**
   * Save current dashboard state to layout
   */
  saveCurrentStateToLayout(): void {
    const stateWidgets = this.mapDashboardWidgetsToStateWidgets();
    this.dashboardStateService.updateWidgets(stateWidgets);

    // Save other state
    this.dashboardStateService.updateState({
      selectedInstance: this.selectedInstance?.id || '',
      dateRange: {
        start: this.startDate,
        end: this.endDate
      },
      viewMode: this.viewMode,
      theme: this.darkMode ? 'dark' : 'light',
      refreshInterval: 0 // No auto-refresh by default
    });
  }

  /**
   * Show layout manager
   */
  openLayoutManager(): void {
    // Save current state before opening layout manager
    this.saveCurrentStateToLayout();
    this.showLayoutManager = true;
  }

  /**
   * Close layout manager
   */
  closeLayoutManager(): void {
    this.showLayoutManager = false;
  }

  /**
   * Check if current route is a child route
   */
  isChildRoute(): boolean {
    const url = this.router.url;
    return url.includes('/dashboard/cti') ||
           url.includes('/dashboard/vi') ||
           url.includes('/dashboard/asm') ||
           url.includes('/dashboard/soar');
  }

  /**
   * Get view mode
   */
  get viewMode(): 'grid' | 'list' {
    return this.currentView;
  }

  /**
   * Set view mode
   */
  set viewMode(mode: 'grid' | 'list') {
    this.currentView = mode;
  }
}
