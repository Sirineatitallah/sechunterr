import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import * as d3 from 'd3';

interface CorrelationNode {
  id: string;
  name: string;
  type: 'threat' | 'vulnerability' | 'asset' | 'incident' | 'playbook';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  domain: 'cti' | 'vi' | 'asm' | 'soar';
  details?: any;
}

interface CorrelationLink {
  source: string;
  target: string;
  type: 'affects' | 'exploits' | 'mitigates' | 'contains' | 'triggers' | 'related';
  strength: number; // 0-1
}

interface CorrelationData {
  nodes: CorrelationNode[];
  links: CorrelationLink[];
}

@Component({
  selector: 'app-correlation-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="correlation-container">
      <div class="correlation-header">
        <h2>Vue de corrélation</h2>
        <div class="correlation-controls">
          <div class="domain-filters">
            <label>Domaines:</label>
            <div class="filter-buttons">
              <button 
                [class.active]="domainFilters.includes('cti')" 
                (click)="toggleDomainFilter('cti')"
                class="domain-btn cti-btn"
              >
                CTI
              </button>
              <button 
                [class.active]="domainFilters.includes('vi')" 
                (click)="toggleDomainFilter('vi')"
                class="domain-btn vi-btn"
              >
                VI
              </button>
              <button 
                [class.active]="domainFilters.includes('asm')" 
                (click)="toggleDomainFilter('asm')"
                class="domain-btn asm-btn"
              >
                ASM
              </button>
              <button 
                [class.active]="domainFilters.includes('soar')" 
                (click)="toggleDomainFilter('soar')"
                class="domain-btn soar-btn"
              >
                SOAR
              </button>
            </div>
          </div>
          
          <div class="type-filters">
            <label>Types:</label>
            <div class="filter-buttons">
              <button 
                [class.active]="typeFilters.includes('threat')" 
                (click)="toggleTypeFilter('threat')"
                class="type-btn threat-btn"
              >
                Menaces
              </button>
              <button 
                [class.active]="typeFilters.includes('vulnerability')" 
                (click)="toggleTypeFilter('vulnerability')"
                class="type-btn vulnerability-btn"
              >
                Vulnérabilités
              </button>
              <button 
                [class.active]="typeFilters.includes('asset')" 
                (click)="toggleTypeFilter('asset')"
                class="type-btn asset-btn"
              >
                Actifs
              </button>
              <button 
                [class.active]="typeFilters.includes('incident')" 
                (click)="toggleTypeFilter('incident')"
                class="type-btn incident-btn"
              >
                Incidents
              </button>
              <button 
                [class.active]="typeFilters.includes('playbook')" 
                (click)="toggleTypeFilter('playbook')"
                class="type-btn playbook-btn"
              >
                Playbooks
              </button>
            </div>
          </div>
          
          <div class="severity-filters">
            <label>Sévérité:</label>
            <div class="filter-buttons">
              <button 
                [class.active]="severityFilters.includes('critical')" 
                (click)="toggleSeverityFilter('critical')"
                class="severity-btn critical-btn"
              >
                Critique
              </button>
              <button 
                [class.active]="severityFilters.includes('high')" 
                (click)="toggleSeverityFilter('high')"
                class="severity-btn high-btn"
              >
                Élevée
              </button>
              <button 
                [class.active]="severityFilters.includes('medium')" 
                (click)="toggleSeverityFilter('medium')"
                class="severity-btn medium-btn"
              >
                Moyenne
              </button>
              <button 
                [class.active]="severityFilters.includes('low')" 
                (click)="toggleSeverityFilter('low')"
                class="severity-btn low-btn"
              >
                Faible
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="correlation-content">
        <div class="graph-container" #graphContainer></div>
        
        <div class="details-panel" *ngIf="selectedNode">
          <div class="details-header">
            <div class="node-icon" [ngClass]="selectedNode.type"></div>
            <div class="node-title">
              <h3>{{ selectedNode.name }}</h3>
              <span class="node-type" [ngClass]="selectedNode.domain">{{ getDomainLabel(selectedNode.domain) }} - {{ getTypeLabel(selectedNode.type) }}</span>
            </div>
            <div class="severity-badge" [ngClass]="'severity-' + selectedNode.severity">
              {{ getSeverityLabel(selectedNode.severity) }}
            </div>
            <button class="close-btn" (click)="closeDetails()">
              <i class="material-icons">close</i>
            </button>
          </div>
          
          <div class="details-content">
            <div class="details-section">
              <h4>Détails</h4>
              <div class="details-properties">
                <!-- Propriétés dynamiques basées sur le type de nœud -->
                <ng-container [ngSwitch]="selectedNode.type">
                  <!-- Threat details -->
                  <ng-container *ngSwitchCase="'threat'">
                    <div class="property-item">
                      <span class="property-label">Origine:</span>
                      <span class="property-value">{{ selectedNode.details?.origin || 'Inconnue' }}</span>
                    </div>
                    <div class="property-item">
                      <span class="property-label">Type:</span>
                      <span class="property-value">{{ selectedNode.details?.threatType || 'Non spécifié' }}</span>
                    </div>
                    <div class="property-item">
                      <span class="property-label">Tactiques:</span>
                      <span class="property-value">{{ selectedNode.details?.tactics?.join(', ') || 'Non spécifiées' }}</span>
                    </div>
                  </ng-container>
                  
                  <!-- Vulnerability details -->
                  <ng-container *ngSwitchCase="'vulnerability'">
                    <div class="property-item">
                      <span class="property-label">CVE:</span>
                      <span class="property-value">{{ selectedNode.details?.cve || 'Non spécifié' }}</span>
                    </div>
                    <div class="property-item">
                      <span class="property-label">CVSS:</span>
                      <span class="property-value">{{ selectedNode.details?.cvss || 'Non spécifié' }}</span>
                    </div>
                    <div class="property-item">
                      <span class="property-label">Statut:</span>
                      <span class="property-value">{{ selectedNode.details?.status || 'Non spécifié' }}</span>
                    </div>
                  </ng-container>
                  
                  <!-- Asset details -->
                  <ng-container *ngSwitchCase="'asset'">
                    <div class="property-item">
                      <span class="property-label">Type:</span>
                      <span class="property-value">{{ selectedNode.details?.assetType || 'Non spécifié' }}</span>
                    </div>
                    <div class="property-item">
                      <span class="property-label">Exposition:</span>
                      <span class="property-value">{{ selectedNode.details?.exposure || 'Non spécifiée' }}</span>
                    </div>
                    <div class="property-item">
                      <span class="property-label">Criticité:</span>
                      <span class="property-value">{{ selectedNode.details?.criticality || 'Non spécifiée' }}</span>
                    </div>
                  </ng-container>
                  
                  <!-- Incident details -->
                  <ng-container *ngSwitchCase="'incident'">
                    <div class="property-item">
                      <span class="property-label">Statut:</span>
                      <span class="property-value">{{ selectedNode.details?.status || 'Non spécifié' }}</span>
                    </div>
                    <div class="property-item">
                      <span class="property-label">Date:</span>
                      <span class="property-value">{{ selectedNode.details?.date || 'Non spécifiée' }}</span>
                    </div>
                    <div class="property-item">
                      <span class="property-label">Assigné à:</span>
                      <span class="property-value">{{ selectedNode.details?.assignee || 'Non spécifié' }}</span>
                    </div>
                  </ng-container>
                  
                  <!-- Playbook details -->
                  <ng-container *ngSwitchCase="'playbook'">
                    <div class="property-item">
                      <span class="property-label">Statut:</span>
                      <span class="property-value">{{ selectedNode.details?.status || 'Non spécifié' }}</span>
                    </div>
                    <div class="property-item">
                      <span class="property-label">Étapes:</span>
                      <span class="property-value">{{ selectedNode.details?.steps || 'Non spécifiées' }}</span>
                    </div>
                    <div class="property-item">
                      <span class="property-label">Automatisé:</span>
                      <span class="property-value">{{ selectedNode.details?.automated ? 'Oui' : 'Non' }}</span>
                    </div>
                  </ng-container>
                </ng-container>
              </div>
            </div>
            
            <div class="details-section">
              <h4>Relations</h4>
              <div class="relations-list">
                <div class="relation-item" *ngFor="let relation of nodeRelations">
                  <div class="relation-icon" [ngClass]="relation.node.type"></div>
                  <div class="relation-details">
                    <div class="relation-name">{{ relation.node.name }}</div>
                    <div class="relation-type">{{ getRelationLabel(relation.type) }}</div>
                  </div>
                  <div class="relation-severity" [ngClass]="'severity-' + relation.node.severity"></div>
                </div>
              </div>
            </div>
            
            <div class="details-actions">
              <button class="action-btn primary" (click)="navigateToDetails()">
                Voir détails complets
              </button>
              <button class="action-btn secondary" (click)="focusOnNode()">
                Centrer sur le graphe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .correlation-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      background-color: var(--bg-paper);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .correlation-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color);
    }
    
    .correlation-header h2 {
      margin: 0 0 16px;
      font-size: 20px;
      font-weight: 600;
    }
    
    .correlation-controls {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }
    
    .domain-filters,
    .type-filters,
    .severity-filters {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .filter-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .domain-btn,
    .type-btn,
    .severity-btn {
      padding: 6px 12px;
      border-radius: 16px;
      border: none;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      background-color: var(--bg-default);
      color: var(--text-secondary);
    }
    
    .domain-btn.active,
    .type-btn.active,
    .severity-btn.active {
      color: white;
    }
    
    /* Domain buttons */
    .cti-btn.active {
      background-color: #5c6bc0;
    }
    
    .vi-btn.active {
      background-color: #ef5350;
    }
    
    .asm-btn.active {
      background-color: #66bb6a;
    }
    
    .soar-btn.active {
      background-color: #ffa726;
    }
    
    /* Type buttons */
    .threat-btn.active {
      background-color: #7e57c2;
    }
    
    .vulnerability-btn.active {
      background-color: #ef5350;
    }
    
    .asset-btn.active {
      background-color: #26a69a;
    }
    
    .incident-btn.active {
      background-color: #ff7043;
    }
    
    .playbook-btn.active {
      background-color: #29b6f6;
    }
    
    /* Severity buttons */
    .critical-btn.active {
      background-color: #d32f2f;
    }
    
    .high-btn.active {
      background-color: #f57c00;
    }
    
    .medium-btn.active {
      background-color: #fbc02d;
    }
    
    .low-btn.active {
      background-color: #388e3c;
    }
    
    .correlation-content {
      flex: 1;
      display: flex;
      overflow: hidden;
    }
    
    .graph-container {
      flex: 1;
      overflow: hidden;
    }
    
    .details-panel {
      width: 350px;
      border-left: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      background-color: var(--bg-default);
    }
    
    .details-header {
      display: flex;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid var(--border-color);
      gap: 12px;
    }
    
    .node-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    
    .node-title {
      flex: 1;
    }
    
    .node-title h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
    
    .node-type {
      font-size: 12px;
      color: var(--text-secondary);
    }
    
    .severity-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
    }
    
    .severity-critical {
      background-color: #ffebee;
      color: #d32f2f;
    }
    
    .severity-high {
      background-color: #fff3e0;
      color: #f57c00;
    }
    
    .severity-medium {
      background-color: #fffde7;
      color: #fbc02d;
    }
    
    .severity-low {
      background-color: #e8f5e9;
      color: #388e3c;
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
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }
    
    .details-section {
      margin-bottom: 24px;
    }
    
    .details-section h4 {
      margin: 0 0 12px;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-secondary);
    }
    
    .details-properties {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .property-item {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
    }
    
    .property-label {
      color: var(--text-secondary);
    }
    
    .property-value {
      font-weight: 500;
    }
    
    .relations-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .relation-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      border-radius: 6px;
      background-color: var(--bg-paper);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .relation-item:hover {
      background-color: rgba(0, 0, 0, 0.03);
    }
    
    .relation-icon {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    
    .relation-details {
      flex: 1;
    }
    
    .relation-name {
      font-size: 13px;
      font-weight: 500;
    }
    
    .relation-type {
      font-size: 11px;
      color: var(--text-secondary);
    }
    
    .relation-severity {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    
    .details-actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
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
export class CorrelationViewComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('graphContainer') graphContainer!: ElementRef;
  
  // Filtres
  domainFilters: string[] = ['cti', 'vi', 'asm', 'soar'];
  typeFilters: string[] = ['threat', 'vulnerability', 'asset', 'incident', 'playbook'];
  severityFilters: string[] = ['critical', 'high', 'medium', 'low'];
  
  // Données
  correlationData: CorrelationData = { nodes: [], links: [] };
  filteredData: CorrelationData = { nodes: [], links: [] };
  
  // Sélection
  selectedNode: CorrelationNode | null = null;
  nodeRelations: { node: CorrelationNode, type: string }[] = [];
  
  // D3 éléments
  private svg: any;
  private simulation: any;
  private nodeElements: any;
  private linkElements: any;
  
  private subscriptions: Subscription[] = [];
  
  constructor() {}
  
  ngOnInit(): void {
    // Charger les données de corrélation (à remplacer par un appel API réel)
    this.loadMockData();
    this.applyFilters();
  }
  
  ngAfterViewInit(): void {
    this.initializeGraph();
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.simulation) {
      this.simulation.stop();
    }
  }
  
  toggleDomainFilter(domain: string): void {
    if (this.domainFilters.includes(domain)) {
      this.domainFilters = this.domainFilters.filter(d => d !== domain);
    } else {
      this.domainFilters.push(domain);
    }
    this.applyFilters();
    this.updateGraph();
  }
  
  toggleTypeFilter(type: string): void {
    if (this.typeFilters.includes(type)) {
      this.typeFilters = this.typeFilters.filter(t => t !== type);
    } else {
      this.typeFilters.push(type);
    }
    this.applyFilters();
    this.updateGraph();
  }
  
  toggleSeverityFilter(severity: string): void {
    if (this.severityFilters.includes(severity)) {
      this.severityFilters = this.severityFilters.filter(s => s !== severity);
    } else {
      this.severityFilters.push(severity);
    }
    this.applyFilters();
    this.updateGraph();
  }
  
  closeDetails(): void {
    this.selectedNode = null;
    this.nodeRelations = [];
  }
  
  navigateToDetails(): void {
    // Naviguer vers la page de détails du nœud sélectionné
    console.log('Navigate to details for:', this.selectedNode);
  }
  
  focusOnNode(): void {
    // Centrer le graphe sur le nœud sélectionné
    if (this.selectedNode) {
      // Logique pour centrer le graphe
    }
  }
  
  getDomainLabel(domain: string): string {
    const labels: { [key: string]: string } = {
      'cti': 'CTI',
      'vi': 'VI',
      'asm': 'ASM',
      'soar': 'SOAR'
    };
    return labels[domain] || domain;
  }
  
  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'threat': 'Menace',
      'vulnerability': 'Vulnérabilité',
      'asset': 'Actif',
      'incident': 'Incident',
      'playbook': 'Playbook'
    };
    return labels[type] || type;
  }
  
  getSeverityLabel(severity: string): string {
    const labels: { [key: string]: string } = {
      'critical': 'Critique',
      'high': 'Élevée',
      'medium': 'Moyenne',
      'low': 'Faible',
      'info': 'Info'
    };
    return labels[severity] || severity;
  }
  
  getRelationLabel(relation: string): string {
    const labels: { [key: string]: string } = {
      'affects': 'Affecte',
      'exploits': 'Exploite',
      'mitigates': 'Atténue',
      'contains': 'Contient',
      'triggers': 'Déclenche',
      'related': 'Lié à'
    };
    return labels[relation] || relation;
  }
  
  private applyFilters(): void {
    // Filtrer les nœuds
    this.filteredData.nodes = this.correlationData.nodes.filter(node => 
      this.domainFilters.includes(node.domain) && 
      this.typeFilters.includes(node.type) && 
      this.severityFilters.includes(node.severity)
    );
    
    // Filtrer les liens (ne garder que ceux dont les deux extrémités sont visibles)
    const visibleNodeIds = new Set(this.filteredData.nodes.map(node => node.id));
    this.filteredData.links = this.correlationData.links.filter(link => 
      visibleNodeIds.has(link.source as string) && 
      visibleNodeIds.has(link.target as string)
    );
  }
  
  private initializeGraph(): void {
    // À implémenter avec D3.js
  }
  
  private updateGraph(): void {
    // À implémenter avec D3.js
  }
  
  private loadMockData(): void {
    // Données de test pour le développement
    this.correlationData = {
      nodes: [
        // Nœuds CTI
        { id: 'threat1', name: 'APT28', type: 'threat', severity: 'critical', domain: 'cti', details: { origin: 'Russie', threatType: 'APT', tactics: ['Initial Access', 'Execution', 'Persistence'] } },
        { id: 'threat2', name: 'Emotet', type: 'threat', severity: 'high', domain: 'cti', details: { origin: 'Unknown', threatType: 'Malware', tactics: ['Initial Access', 'Execution'] } },
        
        // Nœuds VI
        { id: 'vuln1', name: 'CVE-2023-1234', type: 'vulnerability', severity: 'critical', domain: 'vi', details: { cve: 'CVE-2023-1234', cvss: 9.8, status: 'Non corrigée' } },
        { id: 'vuln2', name: 'CVE-2023-5678', type: 'vulnerability', severity: 'high', domain: 'vi', details: { cve: 'CVE-2023-5678', cvss: 8.5, status: 'En cours de correction' } },
        
        // Nœuds ASM
        { id: 'asset1', name: 'Serveur Web', type: 'asset', severity: 'medium', domain: 'asm', details: { assetType: 'Server', exposure: 'External', criticality: 'High' } },
        { id: 'asset2', name: 'Base de données', type: 'asset', severity: 'high', domain: 'asm', details: { assetType: 'Database', exposure: 'Internal', criticality: 'Critical' } },
        
        // Nœuds SOAR
        { id: 'incident1', name: 'Incident-2023-001', type: 'incident', severity: 'critical', domain: 'soar', details: { status: 'En cours', date: '2023-10-15', assignee: 'John Doe' } },
        { id: 'playbook1', name: 'Playbook-Ransomware', type: 'playbook', severity: 'medium', domain: 'soar', details: { status: 'Actif', steps: 12, automated: true } }
      ],
      links: [
        // Relations entre les nœuds
        { source: 'threat1', target: 'vuln1', type: 'exploits', strength: 0.9 },
        { source: 'vuln1', target: 'asset1', type: 'affects', strength: 0.8 },
        { source: 'asset1', target: 'incident1', type: 'contains', strength: 0.7 },
        { source: 'incident1', target: 'playbook1', type: 'triggers', strength: 0.9 },
        { source: 'playbook1', target: 'vuln1', type: 'mitigates', strength: 0.6 },
        { source: 'threat2', target: 'vuln2', type: 'exploits', strength: 0.7 },
        { source: 'vuln2', target: 'asset2', type: 'affects', strength: 0.8 },
        { source: 'asset1', target: 'asset2', type: 'related', strength: 0.5 }
      ]
    };
  }
}
