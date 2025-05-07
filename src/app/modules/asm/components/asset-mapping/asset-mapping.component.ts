import { Component, Input, OnChanges, AfterViewInit, ElementRef, ViewChild, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import * as d3 from 'd3';

interface Asset {
  id: string;
  name: string;
  type: string;
  category: 'server' | 'network' | 'application' | 'endpoint' | 'cloud' | 'iot' | 'other';
  exposure: 'external' | 'internal' | 'both';
  criticality: 'critical' | 'high' | 'medium' | 'low';
  vulnerabilities: number;
  riskScore: number;
  tags: string[];
  details?: any;
}

interface AssetConnection {
  source: string;
  target: string;
  type: string;
  encrypted: boolean;
  riskLevel: 'high' | 'medium' | 'low';
}

interface AssetMappingData {
  assets: Asset[];
  connections: AssetConnection[];
}

@Component({
  selector: 'app-asset-mapping',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatBadgeModule
  ],
  template: `
    <div class="asset-mapping-container">
      <div class="mapping-header">
        <h3>Cartographie des actifs</h3>
        <div class="view-selector">
          <mat-button-toggle-group [(ngModel)]="currentView" (change)="onViewChange()">
            <mat-button-toggle value="external">Externe (EASM)</mat-button-toggle>
            <mat-button-toggle value="internal">Interne (IASM)</mat-button-toggle>
            <mat-button-toggle value="combined">Combiné</mat-button-toggle>
          </mat-button-toggle-group>
        </div>
      </div>
      
      <div class="mapping-controls">
        <div class="filter-controls">
          <div class="filter-group">
            <label>Catégories:</label>
            <div class="filter-options">
              <div 
                *ngFor="let category of categories" 
                class="filter-option"
                [class.active]="categoryFilters.includes(category.value)"
                (click)="toggleCategoryFilter(category.value)"
              >
                <i class="material-icons">{{ category.icon }}</i>
                <span>{{ category.label }}</span>
              </div>
            </div>
          </div>
          
          <div class="filter-group">
            <label>Criticité:</label>
            <div class="filter-options">
              <div 
                *ngFor="let criticality of criticalities" 
                class="filter-option"
                [class.active]="criticalityFilters.includes(criticality.value)"
                (click)="toggleCriticalityFilter(criticality.value)"
                [ngClass]="'criticality-' + criticality.value"
              >
                <span>{{ criticality.label }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Rechercher un actif..." 
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
          >
          <i class="material-icons">search</i>
        </div>
      </div>
      
      <div class="mapping-content">
        <div class="graph-container" #graphContainer></div>
        
        <div class="asset-metrics">
          <div class="metric-card">
            <div class="metric-value">{{ externalAssets }}</div>
            <div class="metric-label">Actifs externes</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">{{ internalAssets }}</div>
            <div class="metric-label">Actifs internes</div>
          </div>
          <div class="metric-card critical">
            <div class="metric-value">{{ criticalExposures }}</div>
            <div class="metric-label">Expositions critiques</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">{{ averageRiskScore.toFixed(1) }}</div>
            <div class="metric-label">Score de risque moyen</div>
          </div>
        </div>
      </div>
      
      <div class="asset-details" *ngIf="selectedAsset">
        <div class="details-header">
          <div class="asset-icon" [ngClass]="'category-' + selectedAsset.category">
            <i class="material-icons">{{ getCategoryIcon(selectedAsset.category) }}</i>
          </div>
          <div class="asset-title">
            <h4>{{ selectedAsset.name }}</h4>
            <div class="asset-tags">
              <span class="asset-tag" *ngFor="let tag of selectedAsset.tags">{{ tag }}</span>
            </div>
          </div>
          <div class="asset-exposure" [ngClass]="'exposure-' + selectedAsset.exposure">
            {{ getExposureLabel(selectedAsset.exposure) }}
          </div>
          <button class="close-btn" (click)="closeDetails()">
            <i class="material-icons">close</i>
          </button>
        </div>
        
        <div class="details-content">
          <div class="details-section">
            <div class="detail-item">
              <span class="detail-label">Type:</span>
              <span class="detail-value">{{ selectedAsset.type }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Criticité:</span>
              <span class="detail-value">
                <span class="criticality-badge" [ngClass]="'criticality-' + selectedAsset.criticality">
                  {{ getCriticalityLabel(selectedAsset.criticality) }}
                </span>
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Score de risque:</span>
              <span class="detail-value">{{ selectedAsset.riskScore }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Vulnérabilités:</span>
              <span class="detail-value">{{ selectedAsset.vulnerabilities }}</span>
            </div>
          </div>
          
          <div class="details-section">
            <h5>Connexions</h5>
            <div class="connections-list">
              <div class="connection-item" *ngFor="let connection of assetConnections">
                <div class="connection-info">
                  <span class="connection-name">{{ connection.asset.name }}</span>
                  <span class="connection-type">{{ connection.type }}</span>
                </div>
                <div class="connection-security">
                  <i class="material-icons" [matTooltip]="connection.encrypted ? 'Chiffré' : 'Non chiffré'">
                    {{ connection.encrypted ? 'lock' : 'lock_open' }}
                  </i>
                  <span class="risk-level" [ngClass]="'risk-' + connection.riskLevel"></span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="details-actions">
            <button class="action-btn primary">Voir détails complets</button>
            <button class="action-btn secondary">Analyser les vulnérabilités</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .asset-mapping-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      position: relative;
    }
    
    .mapping-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid var(--border-color);
    }
    
    .mapping-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
    
    .mapping-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-color);
      background-color: var(--bg-paper);
    }
    
    .filter-controls {
      display: flex;
      gap: 24px;
    }
    
    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .filter-group label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary);
    }
    
    .filter-options {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .filter-option {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border-radius: 16px;
      font-size: 12px;
      cursor: pointer;
      background-color: var(--bg-default);
      border: 1px solid var(--border-color);
      transition: all 0.2s ease;
    }
    
    .filter-option:hover {
      background-color: rgba(0, 0, 0, 0.03);
    }
    
    .filter-option.active {
      background-color: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }
    
    .filter-option i {
      font-size: 16px;
    }
    
    .criticality-critical {
      color: #d32f2f;
    }
    
    .criticality-high {
      color: #f57c00;
    }
    
    .criticality-medium {
      color: #fbc02d;
    }
    
    .criticality-low {
      color: #2e7d32;
    }
    
    .filter-option.active.criticality-critical {
      background-color: #d32f2f;
      border-color: #d32f2f;
      color: white;
    }
    
    .filter-option.active.criticality-high {
      background-color: #f57c00;
      border-color: #f57c00;
      color: white;
    }
    
    .filter-option.active.criticality-medium {
      background-color: #fbc02d;
      border-color: #fbc02d;
      color: white;
    }
    
    .filter-option.active.criticality-low {
      background-color: #2e7d32;
      border-color: #2e7d32;
      color: white;
    }
    
    .search-box {
      position: relative;
      width: 250px;
    }
    
    .search-box input {
      width: 100%;
      padding: 8px 12px 8px 36px;
      border: 1px solid var(--border-color);
      border-radius: 20px;
      font-size: 14px;
      outline: none;
      transition: all 0.2s ease;
    }
    
    .search-box input:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1);
    }
    
    .search-box i {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-secondary);
      font-size: 18px;
    }
    
    .mapping-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
    }
    
    .graph-container {
      flex: 1;
      overflow: hidden;
    }
    
    .asset-metrics {
      display: flex;
      justify-content: space-around;
      padding: 12px 16px;
      background-color: var(--bg-paper);
      border-top: 1px solid var(--border-color);
    }
    
    .metric-card {
      text-align: center;
    }
    
    .metric-value {
      font-size: 24px;
      font-weight: 700;
    }
    
    .metric-card.critical .metric-value {
      color: #d32f2f;
    }
    
    .metric-label {
      font-size: 12px;
      color: var(--text-secondary);
    }
    
    .asset-details {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 320px;
      background-color: var(--bg-paper);
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      z-index: 10;
    }
    
    .details-header {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-color);
      gap: 12px;
    }
    
    .asset-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    
    .category-server {
      background-color: #5c6bc0;
    }
    
    .category-network {
      background-color: #26a69a;
    }
    
    .category-application {
      background-color: #7e57c2;
    }
    
    .category-endpoint {
      background-color: #66bb6a;
    }
    
    .category-cloud {
      background-color: #29b6f6;
    }
    
    .category-iot {
      background-color: #ffa726;
    }
    
    .category-other {
      background-color: #78909c;
    }
    
    .asset-title {
      flex: 1;
    }
    
    .asset-title h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
    
    .asset-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 4px;
    }
    
    .asset-tag {
      padding: 2px 6px;
      border-radius: 12px;
      font-size: 10px;
      background-color: var(--bg-default);
      color: var(--text-secondary);
    }
    
    .asset-exposure {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
    }
    
    .exposure-external {
      background-color: #e3f2fd;
      color: #1565c0;
    }
    
    .exposure-internal {
      background-color: #e8f5e9;
      color: #2e7d32;
    }
    
    .exposure-both {
      background-color: #fff3e0;
      color: #f57c00;
    }
    
    .close-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }
    
    .close-btn:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
    
    .details-content {
      padding: 16px;
    }
    
    .details-section {
      margin-bottom: 24px;
    }
    
    .details-section h5 {
      margin: 0 0 12px;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-secondary);
    }
    
    .detail-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
    }
    
    .detail-label {
      color: var(--text-secondary);
    }
    
    .criticality-badge {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .criticality-critical {
      background-color: #ffebee;
      color: #d32f2f;
    }
    
    .criticality-high {
      background-color: #fff3e0;
      color: #f57c00;
    }
    
    .criticality-medium {
      background-color: #fffde7;
      color: #fbc02d;
    }
    
    .criticality-low {
      background-color: #e8f5e9;
      color: #2e7d32;
    }
    
    .connections-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .connection-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background-color: var(--bg-default);
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .connection-item:hover {
      background-color: rgba(0, 0, 0, 0.03);
    }
    
    .connection-info {
      display: flex;
      flex-direction: column;
    }
    
    .connection-name {
      font-weight: 500;
      font-size: 14px;
    }
    
    .connection-type {
      font-size: 12px;
      color: var(--text-secondary);
    }
    
    .connection-security {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .connection-security i {
      font-size: 16px;
      color: var(--text-secondary);
    }
    
    .risk-level {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    
    .risk-high {
      background-color: #d32f2f;
    }
    
    .risk-medium {
      background-color: #fbc02d;
    }
    
    .risk-low {
      background-color: #2e7d32;
    }
    
    .details-actions {
      display: flex;
      gap: 8px;
    }
    
    .action-btn {
      flex: 1;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .action-btn.primary {
      background-color: var(--primary-color);
      color: white;
      border: none;
    }
    
    .action-btn.primary:hover {
      background-color: var(--primary-color-dark);
    }
    
    .action-btn.secondary {
      background-color: transparent;
      color: var(--primary-color);
      border: 1px solid var(--primary-color);
    }
    
    .action-btn.secondary:hover {
      background-color: rgba(var(--primary-rgb), 0.05);
    }
  `]
})
export class AssetMappingComponent implements OnChanges, AfterViewInit {
  @ViewChild('graphContainer') graphContainer!: ElementRef;
  @Input() data: AssetMappingData = { assets: [], connections: [] };
  
  // Vue actuelle
  currentView: 'external' | 'internal' | 'combined' = 'combined';
  
  // Filtres
  categoryFilters: string[] = ['server', 'network', 'application', 'endpoint', 'cloud', 'iot', 'other'];
  criticalityFilters: string[] = ['critical', 'high', 'medium', 'low'];
  searchQuery: string = '';
  
  // Données filtrées
  filteredAssets: Asset[] = [];
  filteredConnections: AssetConnection[] = [];
  
  // Métriques
  externalAssets: number = 0;
  internalAssets: number = 0;
  criticalExposures: number = 0;
  averageRiskScore: number = 0;
  
  // Sélection
  selectedAsset: Asset | null = null;
  assetConnections: { asset: Asset, type: string, encrypted: boolean, riskLevel: string }[] = [];
  
  // Options de filtres
  categories = [
    { value: 'server', label: 'Serveurs', icon: 'dns' },
    { value: 'network', label: 'Réseau', icon: 'router' },
    { value: 'application', label: 'Applications', icon: 'apps' },
    { value: 'endpoint', label: 'Endpoints', icon: 'computer' },
    { value: 'cloud', label: 'Cloud', icon: 'cloud' },
    { value: 'iot', label: 'IoT', icon: 'devices' },
    { value: 'other', label: 'Autres', icon: 'more_horiz' }
  ];
  
  criticalities = [
    { value: 'critical', label: 'Critique' },
    { value: 'high', label: 'Élevée' },
    { value: 'medium', label: 'Moyenne' },
    { value: 'low', label: 'Faible' }
  ];
  
  // D3 éléments
  private svg: any;
  private simulation: any;
  private nodeElements: any;
  private linkElements: any;
  private zoomBehavior: any;
  
  constructor() {}
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.applyFilters();
      this.updateMetrics();
      
      if (this.graphContainer && this.graphContainer.nativeElement) {
        this.initializeGraph();
      }
    }
  }
  
  ngAfterViewInit(): void {
    if (this.data && this.data.assets.length > 0) {
      this.initializeGraph();
    }
  }
  
  onViewChange(): void {
    this.applyFilters();
    this.updateMetrics();
    this.initializeGraph();
  }
  
  toggleCategoryFilter(category: string): void {
    if (this.categoryFilters.includes(category)) {
      this.categoryFilters = this.categoryFilters.filter(c => c !== category);
    } else {
      this.categoryFilters.push(category);
    }
    
    this.applyFilters();
    this.updateMetrics();
    this.updateGraph();
  }
  
  toggleCriticalityFilter(criticality: string): void {
    if (this.criticalityFilters.includes(criticality)) {
      this.criticalityFilters = this.criticalityFilters.filter(c => c !== criticality);
    } else {
      this.criticalityFilters.push(criticality);
    }
    
    this.applyFilters();
    this.updateMetrics();
    this.updateGraph();
  }
  
  onSearch(): void {
    this.applyFilters();
    this.updateMetrics();
    this.updateGraph();
  }
  
  closeDetails(): void {
    this.selectedAsset = null;
    this.assetConnections = [];
  }
  
  getCategoryIcon(category: string): string {
    const categoryObj = this.categories.find(c => c.value === category);
    return categoryObj ? categoryObj.icon : 'help';
  }
  
  getExposureLabel(exposure: string): string {
    switch (exposure) {
      case 'external':
        return 'Externe';
      case 'internal':
        return 'Interne';
      case 'both':
        return 'Externe & Interne';
      default:
        return exposure;
    }
  }
  
  getCriticalityLabel(criticality: string): string {
    switch (criticality) {
      case 'critical':
        return 'Critique';
      case 'high':
        return 'Élevée';
      case 'medium':
        return 'Moyenne';
      case 'low':
        return 'Faible';
      default:
        return criticality;
    }
  }
  
  private applyFilters(): void {
    // Filtrer par vue (externe/interne/combinée)
    let assetsFiltered = [...this.data.assets];
    
    if (this.currentView === 'external') {
      assetsFiltered = assetsFiltered.filter(asset => 
        asset.exposure === 'external' || asset.exposure === 'both'
      );
    } else if (this.currentView === 'internal') {
      assetsFiltered = assetsFiltered.filter(asset => 
        asset.exposure === 'internal' || asset.exposure === 'both'
      );
    }
    
    // Filtrer par catégorie
    if (this.categoryFilters.length > 0) {
      assetsFiltered = assetsFiltered.filter(asset => 
        this.categoryFilters.includes(asset.category)
      );
    }
    
    // Filtrer par criticité
    if (this.criticalityFilters.length > 0) {
      assetsFiltered = assetsFiltered.filter(asset => 
        this.criticalityFilters.includes(asset.criticality)
      );
    }
    
    // Filtrer par recherche
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      assetsFiltered = assetsFiltered.filter(asset => 
        asset.name.toLowerCase().includes(query) || 
        asset.type.toLowerCase().includes(query) ||
        asset.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    this.filteredAssets = assetsFiltered;
    
    // Filtrer les connexions pour ne garder que celles entre les actifs filtrés
    const assetIds = new Set(this.filteredAssets.map(asset => asset.id));
    this.filteredConnections = this.data.connections.filter(conn => 
      assetIds.has(conn.source) && assetIds.has(conn.target)
    );
  }
  
  private updateMetrics(): void {
    // Calculer les métriques
    this.externalAssets = this.filteredAssets.filter(asset => 
      asset.exposure === 'external' || asset.exposure === 'both'
    ).length;
    
    this.internalAssets = this.filteredAssets.filter(asset => 
      asset.exposure === 'internal' || asset.exposure === 'both'
    ).length;
    
    this.criticalExposures = this.filteredAssets.filter(asset => 
      asset.criticality === 'critical' && 
      (asset.exposure === 'external' || asset.exposure === 'both')
    ).length;
    
    // Calculer le score de risque moyen
    if (this.filteredAssets.length > 0) {
      const totalRiskScore = this.filteredAssets.reduce((sum, asset) => sum + asset.riskScore, 0);
      this.averageRiskScore = totalRiskScore / this.filteredAssets.length;
    } else {
      this.averageRiskScore = 0;
    }
  }
  
  private initializeGraph(): void {
    // Implémenter avec D3.js
  }
  
  private updateGraph(): void {
    // Mettre à jour le graphe avec les données filtrées
  }
}
