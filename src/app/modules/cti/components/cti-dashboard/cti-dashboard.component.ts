import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

// Import des composants de visualisation
import { ThreatMapComponent } from '../threat-map/threat-map.component';
import { MitreHeatmapComponent } from '../mitre-heatmap/mitre-heatmap.component';
import { ThreatEvolutionComponent } from '../threat-evolution/threat-evolution.component';

// Import des composants partagés
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { ErrorDisplayComponent } from '../../../../shared/components/error-display/error-display.component';

// Import des services
import { DashboardDataService } from '../../../../dashboard/services/dashboard-data.service';
import { ExportService } from '../../../../dashboard/services/export.service';

@Component({
  selector: 'app-cti-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule,
    ThreatMapComponent,
    MitreHeatmapComponent,
    ThreatEvolutionComponent,
    LoadingComponent,
    ErrorDisplayComponent
  ],
  template: `
    <div class="cti-dashboard">
      <div class="dashboard-header">
        <div class="header-title">
          <h1>Cyber Threat Intelligence</h1>
          <div class="subtitle">
            <span class="domain-badge ctd">CTD</span>
            <span class="domain-badge ctp">CTP</span>
            <span class="date-range">{{ startDate }} - {{ endDate }}</span>
          </div>
        </div>
        
        <div class="header-actions">
          <button mat-button class="refresh-btn" (click)="refreshDashboard()">
            <mat-icon>refresh</mat-icon>
            Actualiser
          </button>
          
          <button mat-button [matMenuTriggerFor]="exportMenu" class="export-btn">
            <mat-icon>download</mat-icon>
            Exporter
          </button>
          <mat-menu #exportMenu="matMenu">
            <button mat-menu-item (click)="exportDashboard('pdf')">
              <mat-icon>picture_as_pdf</mat-icon>
              PDF
            </button>
            <button mat-menu-item (click)="exportDashboard('excel')">
              <mat-icon>grid_on</mat-icon>
              Excel
            </button>
            <button mat-menu-item (click)="exportDashboard('image')">
              <mat-icon>image</mat-icon>
              Image
            </button>
          </mat-menu>
          
          <button mat-button [matMenuTriggerFor]="filterMenu" class="filter-btn">
            <mat-icon>filter_list</mat-icon>
            Filtres
          </button>
          <mat-menu #filterMenu="matMenu">
            <div class="filter-menu-content" (click)="$event.stopPropagation()">
              <div class="filter-section">
                <h3>Sévérité</h3>
                <div class="filter-options">
                  <mat-chip-listbox multiple [(ngModel)]="severityFilters">
                    <mat-chip-option value="critical" class="severity-critical">Critique</mat-chip-option>
                    <mat-chip-option value="high" class="severity-high">Élevée</mat-chip-option>
                    <mat-chip-option value="medium" class="severity-medium">Moyenne</mat-chip-option>
                    <mat-chip-option value="low" class="severity-low">Faible</mat-chip-option>
                  </mat-chip-listbox>
                </div>
              </div>
              
              <div class="filter-section">
                <h3>Types de menaces</h3>
                <div class="filter-options">
                  <mat-chip-listbox multiple [(ngModel)]="threatTypeFilters">
                    <mat-chip-option value="apt">APT</mat-chip-option>
                    <mat-chip-option value="malware">Malware</mat-chip-option>
                    <mat-chip-option value="ransomware">Ransomware</mat-chip-option>
                    <mat-chip-option value="phishing">Phishing</mat-chip-option>
                  </mat-chip-listbox>
                </div>
              </div>
              
              <div class="filter-actions">
                <button mat-button (click)="resetFilters()">Réinitialiser</button>
                <button mat-raised-button color="primary" (click)="applyFilters()">Appliquer</button>
              </div>
            </div>
          </mat-menu>
        </div>
      </div>
      
      <div class="dashboard-content">
        <mat-tab-group animationDuration="0ms" (selectedTabChange)="onTabChange($event)">
          <mat-tab label="Vue d'ensemble">
            <div class="tab-content">
              <div class="metrics-row">
                <mat-card class="metric-card">
                  <mat-card-content>
                    <div class="metric-value critical">{{ metrics.criticalThreats }}</div>
                    <div class="metric-label">Menaces critiques</div>
                    <div class="metric-trend" [ngClass]="metrics.criticalThreatsTrend > 0 ? 'trend-up' : 'trend-down'">
                      {{ metrics.criticalThreatsTrend > 0 ? '+' : '' }}{{ metrics.criticalThreatsTrend }}%
                    </div>
                  </mat-card-content>
                </mat-card>
                
                <mat-card class="metric-card">
                  <mat-card-content>
                    <div class="metric-value">{{ metrics.activeThreats }}</div>
                    <div class="metric-label">Menaces actives</div>
                    <div class="metric-trend" [ngClass]="metrics.activeThreatsTrend > 0 ? 'trend-up' : 'trend-down'">
                      {{ metrics.activeThreatsTrend > 0 ? '+' : '' }}{{ metrics.activeThreatsTrend }}%
                    </div>
                  </mat-card-content>
                </mat-card>
                
                <mat-card class="metric-card">
                  <mat-card-content>
                    <div class="metric-value">{{ metrics.mitigatedThreats }}</div>
                    <div class="metric-label">Menaces atténuées</div>
                    <div class="metric-trend" [ngClass]="metrics.mitigatedThreatsTrend > 0 ? 'trend-down' : 'trend-up'">
                      {{ metrics.mitigatedThreatsTrend > 0 ? '+' : '' }}{{ metrics.mitigatedThreatsTrend }}%
                    </div>
                  </mat-card-content>
                </mat-card>
                
                <mat-card class="metric-card">
                  <mat-card-content>
                    <div class="metric-value">{{ metrics.newIOCs }}</div>
                    <div class="metric-label">Nouveaux IOCs</div>
                    <div class="metric-trend" [ngClass]="metrics.newIOCsTrend > 0 ? 'trend-up' : 'trend-down'">
                      {{ metrics.newIOCsTrend > 0 ? '+' : '' }}{{ metrics.newIOCsTrend }}%
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
              
              <div class="widgets-row">
                <mat-card class="widget-card large">
                  <mat-card-header>
                    <mat-card-title>Carte des menaces</mat-card-title>
                    <div class="card-actions">
                      <button mat-icon-button [matMenuTriggerFor]="mapMenu">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #mapMenu="matMenu">
                        <button mat-menu-item (click)="exportWidget('threat-map', 'image')">
                          <mat-icon>image</mat-icon>
                          Exporter comme image
                        </button>
                        <button mat-menu-item (click)="exportWidget('threat-map', 'data')">
                          <mat-icon>download</mat-icon>
                          Exporter les données
                        </button>
                      </mat-menu>
                    </div>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="widget-container" [class.loading]="isLoading.threatMap" [class.error]="hasError.threatMap">
                      <app-loading *ngIf="isLoading.threatMap" [type]="'skeleton'" [skeletonType]="'chart'"></app-loading>
                      <app-error-display 
                        *ngIf="hasError.threatMap && !isLoading.threatMap" 
                        [message]="'Erreur lors du chargement de la carte des menaces'"
                        (retry)="loadThreatMap()"
                      ></app-error-display>
                      <app-threat-map 
                        *ngIf="!isLoading.threatMap && !hasError.threatMap"
                        [data]="data.threatMap"
                      ></app-threat-map>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
              
              <div class="widgets-row">
                <mat-card class="widget-card">
                  <mat-card-header>
                    <mat-card-title>Heatmap MITRE ATT&CK</mat-card-title>
                    <div class="card-actions">
                      <button mat-icon-button [matMenuTriggerFor]="mitreMenu">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #mitreMenu="matMenu">
                        <button mat-menu-item (click)="exportWidget('mitre-heatmap', 'image')">
                          <mat-icon>image</mat-icon>
                          Exporter comme image
                        </button>
                        <button mat-menu-item (click)="exportWidget('mitre-heatmap', 'data')">
                          <mat-icon>download</mat-icon>
                          Exporter les données
                        </button>
                      </mat-menu>
                    </div>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="widget-container" [class.loading]="isLoading.mitreHeatmap" [class.error]="hasError.mitreHeatmap">
                      <app-loading *ngIf="isLoading.mitreHeatmap" [type]="'skeleton'" [skeletonType]="'chart'"></app-loading>
                      <app-error-display 
                        *ngIf="hasError.mitreHeatmap && !isLoading.mitreHeatmap" 
                        [message]="'Erreur lors du chargement de la heatmap MITRE'"
                        (retry)="loadMitreHeatmap()"
                      ></app-error-display>
                      <app-mitre-heatmap 
                        *ngIf="!isLoading.mitreHeatmap && !hasError.mitreHeatmap"
                        [data]="data.mitreHeatmap"
                      ></app-mitre-heatmap>
                    </div>
                  </mat-card-content>
                </mat-card>
                
                <mat-card class="widget-card">
                  <mat-card-header>
                    <mat-card-title>Évolution des menaces</mat-card-title>
                    <div class="card-actions">
                      <button mat-icon-button [matMenuTriggerFor]="evolutionMenu">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #evolutionMenu="matMenu">
                        <button mat-menu-item (click)="exportWidget('threat-evolution', 'image')">
                          <mat-icon>image</mat-icon>
                          Exporter comme image
                        </button>
                        <button mat-menu-item (click)="exportWidget('threat-evolution', 'data')">
                          <mat-icon>download</mat-icon>
                          Exporter les données
                        </button>
                      </mat-menu>
                    </div>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="widget-container" [class.loading]="isLoading.threatEvolution" [class.error]="hasError.threatEvolution">
                      <app-loading *ngIf="isLoading.threatEvolution" [type]="'skeleton'" [skeletonType]="'chart'"></app-loading>
                      <app-error-display 
                        *ngIf="hasError.threatEvolution && !isLoading.threatEvolution" 
                        [message]="'Erreur lors du chargement de l\\'évolution des menaces'"
                        (retry)="loadThreatEvolution()"
                      ></app-error-display>
                      <app-threat-evolution 
                        *ngIf="!isLoading.threatEvolution && !hasError.threatEvolution"
                        [data]="data.threatEvolution"
                      ></app-threat-evolution>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-tab>
          
          <mat-tab label="Détection (CTD)">
            <div class="tab-content">
              <!-- Contenu de l'onglet CTD -->
              <p>Contenu de l'onglet Détection (CTD) à implémenter</p>
            </div>
          </mat-tab>
          
          <mat-tab label="Prévention (CTP)">
            <div class="tab-content">
              <!-- Contenu de l'onglet CTP -->
              <p>Contenu de l'onglet Prévention (CTP) à implémenter</p>
            </div>
          </mat-tab>
          
          <mat-tab label="Indicateurs (IOCs)">
            <div class="tab-content">
              <!-- Contenu de l'onglet IOCs -->
              <p>Contenu de l'onglet Indicateurs (IOCs) à implémenter</p>
            </div>
          </mat-tab>
          
          <mat-tab label="Corrélation">
            <div class="tab-content">
              <!-- Contenu de l'onglet Corrélation -->
              <p>Contenu de l'onglet Corrélation à implémenter</p>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .cti-dashboard {
      height: 100%;
      display: flex;
      flex-direction: column;
      background-color: var(--bg-default);
    }
    
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background-color: var(--bg-paper);
      border-bottom: 1px solid var(--border-color);
    }
    
    .header-title h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    
    .subtitle {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 4px;
    }
    
    .domain-badge {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    
    .ctd {
      background-color: #e8f5e9;
      color: #2e7d32;
    }
    
    .ctp {
      background-color: #e3f2fd;
      color: #1565c0;
    }
    
    .date-range {
      font-size: 12px;
      color: var(--text-secondary);
    }
    
    .header-actions {
      display: flex;
      gap: 8px;
    }
    
    .dashboard-content {
      flex: 1;
      overflow: hidden;
    }
    
    ::ng-deep .mat-mdc-tab-body-wrapper {
      flex: 1;
      overflow: hidden;
    }
    
    .tab-content {
      height: 100%;
      padding: 24px;
      overflow-y: auto;
    }
    
    .metrics-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .metric-card {
      padding: 16px;
    }
    
    .metric-value {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    
    .metric-value.critical {
      color: #d32f2f;
    }
    
    .metric-label {
      font-size: 14px;
      color: var(--text-secondary);
      margin-bottom: 8px;
    }
    
    .metric-trend {
      font-size: 12px;
      font-weight: 600;
    }
    
    .trend-up {
      color: #d32f2f;
    }
    
    .trend-down {
      color: #2e7d32;
    }
    
    .widgets-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .widgets-row .large {
      grid-column: span 2;
    }
    
    .widget-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    .widget-container {
      flex: 1;
      min-height: 300px;
      position: relative;
    }
    
    .widget-container.loading, .widget-container.error {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    ::ng-deep .mat-mdc-card-header {
      padding: 16px;
      border-bottom: 1px solid var(--border-color);
    }
    
    ::ng-deep .mat-mdc-card-content {
      padding: 0 !important;
      flex: 1;
      overflow: hidden;
    }
    
    .card-actions {
      margin-left: auto;
    }
    
    .filter-menu-content {
      padding: 16px;
      min-width: 300px;
    }
    
    .filter-section {
      margin-bottom: 16px;
    }
    
    .filter-section h3 {
      margin: 0 0 8px;
      font-size: 14px;
      font-weight: 500;
    }
    
    .filter-options {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .filter-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
    }
    
    ::ng-deep .severity-critical {
      background-color: #ffebee !important;
      color: #d32f2f !important;
    }
    
    ::ng-deep .severity-high {
      background-color: #fff3e0 !important;
      color: #f57c00 !important;
    }
    
    ::ng-deep .severity-medium {
      background-color: #fffde7 !important;
      color: #fbc02d !important;
    }
    
    ::ng-deep .severity-low {
      background-color: #e8f5e9 !important;
      color: #2e7d32 !important;
    }
  `]
})
export class CtiDashboardComponent implements OnInit {
  // Filtres
  severityFilters: string[] = ['critical', 'high', 'medium', 'low'];
  threatTypeFilters: string[] = ['apt', 'malware', 'ransomware', 'phishing'];
  
  // Dates
  startDate: string = '';
  endDate: string = '';
  
  // États de chargement
  isLoading: { [key: string]: boolean } = {
    threatMap: true,
    mitreHeatmap: true,
    threatEvolution: true
  };
  
  hasError: { [key: string]: boolean } = {
    threatMap: false,
    mitreHeatmap: false,
    threatEvolution: false
  };
  
  // Données
  data: { [key: string]: any } = {
    threatMap: null,
    mitreHeatmap: null,
    threatEvolution: null
  };
  
  // Métriques
  metrics = {
    criticalThreats: 12,
    criticalThreatsTrend: 15,
    activeThreats: 87,
    activeThreatsTrend: 8,
    mitigatedThreats: 45,
    mitigatedThreatsTrend: 12,
    newIOCs: 156,
    newIOCsTrend: 23
  };
  
  constructor(
    private dashboardDataService: DashboardDataService,
    private exportService: ExportService
  ) {}
  
  ngOnInit(): void {
    // Initialiser les dates
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    this.startDate = this.formatDate(thirtyDaysAgo);
    this.endDate = this.formatDate(today);
    
    // Charger les données
    this.loadDashboardData();
  }
  
  loadDashboardData(): void {
    this.loadThreatMap();
    this.loadMitreHeatmap();
    this.loadThreatEvolution();
  }
  
  loadThreatMap(): void {
    this.isLoading.threatMap = true;
    this.hasError.threatMap = false;
    
    this.dashboardDataService.getWidgetData('threat-map', 'cti-map')
      .subscribe({
        next: (data) => {
          this.data.threatMap = data.data;
          this.isLoading.threatMap = false;
        },
        error: (error) => {
          console.error('Error loading threat map:', error);
          this.hasError.threatMap = true;
          this.isLoading.threatMap = false;
        }
      });
  }
  
  loadMitreHeatmap(): void {
    this.isLoading.mitreHeatmap = true;
    this.hasError.mitreHeatmap = false;
    
    this.dashboardDataService.getWidgetData('mitre-heatmap', 'cti-mitre')
      .subscribe({
        next: (data) => {
          this.data.mitreHeatmap = data.data;
          this.isLoading.mitreHeatmap = false;
        },
        error: (error) => {
          console.error('Error loading MITRE heatmap:', error);
          this.hasError.mitreHeatmap = true;
          this.isLoading.mitreHeatmap = false;
        }
      });
  }
  
  loadThreatEvolution(): void {
    this.isLoading.threatEvolution = true;
    this.hasError.threatEvolution = false;
    
    this.dashboardDataService.getWidgetData('threat-evolution', 'cti-evolution')
      .subscribe({
        next: (data) => {
          this.data.threatEvolution = data.data;
          this.isLoading.threatEvolution = false;
        },
        error: (error) => {
          console.error('Error loading threat evolution:', error);
          this.hasError.threatEvolution = true;
          this.isLoading.threatEvolution = false;
        }
      });
  }
  
  refreshDashboard(): void {
    this.loadDashboardData();
  }
  
  exportDashboard(format: string): void {
    console.log(`Exporting dashboard as ${format}`);
    // Implémenter l'export du dashboard
  }
  
  exportWidget(widgetId: string, format: string): void {
    console.log(`Exporting widget ${widgetId} as ${format}`);
    // Implémenter l'export d'un widget
  }
  
  resetFilters(): void {
    this.severityFilters = ['critical', 'high', 'medium', 'low'];
    this.threatTypeFilters = ['apt', 'malware', 'ransomware', 'phishing'];
  }
  
  applyFilters(): void {
    console.log('Applying filters:', {
      severity: this.severityFilters,
      threatType: this.threatTypeFilters
    });
    // Implémenter l'application des filtres
    this.loadDashboardData();
  }
  
  onTabChange(event: any): void {
    console.log('Tab changed:', event.index);
    // Charger les données spécifiques à l'onglet si nécessaire
  }
  
  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
