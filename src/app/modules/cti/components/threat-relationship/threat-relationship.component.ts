import { Component, Input, OnChanges, AfterViewInit, ElementRef, ViewChild, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';

interface ThreatNode {
  id: string;
  name: string;
  type: string;
  severity: string;
  group?: string;
  details?: any;
}

interface ThreatLink {
  source: string;
  target: string;
  type: string;
  strength: number;
}

interface ThreatRelationshipData {
  nodes: ThreatNode[];
  links: ThreatLink[];
}

@Component({
  selector: 'app-threat-relationship',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="visualization-container">
      <div class="visualization-header">
        <h3>Relations entre menaces</h3>
        <div class="visualization-controls">
          <div class="search-box">
            <input 
              type="text" 
              placeholder="Rechercher une menace..." 
              [(ngModel)]="searchQuery"
              (input)="onSearch()"
            >
            <i class="material-icons">search</i>
          </div>
          
          <div class="view-controls">
            <button 
              class="view-control-btn" 
              [class.active]="currentView === 'graph'" 
              (click)="setView('graph')"
              title="Vue graphe"
            >
              <i class="material-icons">bubble_chart</i>
            </button>
            <button 
              class="view-control-btn" 
              [class.active]="currentView === 'matrix'" 
              (click)="setView('matrix')"
              title="Vue matrice"
            >
              <i class="material-icons">grid_on</i>
            </button>
            <button 
              class="view-control-btn" 
              [class.active]="currentView === 'list'" 
              (click)="setView('list')"
              title="Vue liste"
            >
              <i class="material-icons">view_list</i>
            </button>
          </div>
        </div>
      </div>
      
      <div class="visualization-content">
        <div class="graph-container" #graphContainer [hidden]="currentView !== 'graph'"></div>
        
        <div class="matrix-container" [hidden]="currentView !== 'matrix'">
          <!-- Contenu de la vue matrice -->
          <div class="matrix-placeholder">Vue matrice à implémenter</div>
        </div>
        
        <div class="list-container" [hidden]="currentView !== 'list'">
          <!-- Contenu de la vue liste -->
          <table class="threat-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Type</th>
                <th>Sévérité</th>
                <th>Relations</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let node of filteredNodes" class="threat-row">
                <td>{{ node.name }}</td>
                <td>{{ node.type }}</td>
                <td>
                  <span class="severity-badge" [ngClass]="'severity-' + node.severity">
                    {{ node.severity }}
                  </span>
                </td>
                <td>
                  <div class="relations-count">
                    {{ getNodeRelationsCount(node.id) }}
                    <button class="show-relations-btn" (click)="showNodeRelations(node)">
                      <i class="material-icons">visibility</i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="node-details" *ngIf="selectedNode">
        <div class="details-header">
          <h4>{{ selectedNode.name }}</h4>
          <button class="close-btn" (click)="closeDetails()">
            <i class="material-icons">close</i>
          </button>
        </div>
        
        <div class="details-content">
          <div class="details-section">
            <div class="detail-item">
              <span class="detail-label">Type:</span>
              <span class="detail-value">{{ selectedNode.type }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Sévérité:</span>
              <span class="detail-value">
                <span class="severity-badge" [ngClass]="'severity-' + selectedNode.severity">
                  {{ selectedNode.severity }}
                </span>
              </span>
            </div>
            <div class="detail-item" *ngIf="selectedNode.group">
              <span class="detail-label">Groupe:</span>
              <span class="detail-value">{{ selectedNode.group }}</span>
            </div>
          </div>
          
          <div class="details-section">
            <h5>Relations</h5>
            <div class="relations-list">
              <div class="relation-item" *ngFor="let relation of nodeRelations">
                <div class="relation-info">
                  <span class="relation-name">{{ relation.node.name }}</span>
                  <span class="relation-type">{{ relation.type }}</span>
                </div>
                <span class="severity-badge" [ngClass]="'severity-' + relation.node.severity">
                  {{ relation.node.severity }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .visualization-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      position: relative;
    }
    
    .visualization-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid var(--border-color);
    }
    
    .visualization-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
    
    .visualization-controls {
      display: flex;
      align-items: center;
      gap: 16px;
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
    
    .view-controls {
      display: flex;
      gap: 4px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      overflow: hidden;
    }
    
    .view-control-btn {
      background: none;
      border: none;
      padding: 6px 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    
    .view-control-btn:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
    
    .view-control-btn.active {
      background-color: var(--primary-color);
      color: white;
    }
    
    .view-control-btn i {
      font-size: 18px;
    }
    
    .visualization-content {
      flex: 1;
      overflow: hidden;
      position: relative;
    }
    
    .graph-container, .matrix-container, .list-container {
      width: 100%;
      height: 100%;
      overflow: auto;
    }
    
    .matrix-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--text-secondary);
      font-style: italic;
    }
    
    .threat-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .threat-table th {
      text-align: left;
      padding: 12px 16px;
      background-color: var(--bg-paper);
      border-bottom: 1px solid var(--border-color);
      font-weight: 600;
      color: var(--text-secondary);
    }
    
    .threat-row {
      cursor: pointer;
      transition: background-color 0.2s ease;
    }
    
    .threat-row:hover {
      background-color: rgba(0, 0, 0, 0.02);
    }
    
    .threat-table td {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-color);
    }
    
    .severity-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
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
      color: #2e7d32;
    }
    
    .relations-count {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .show-relations-btn {
      background: none;
      border: none;
      color: var(--primary-color);
      cursor: pointer;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    
    .show-relations-btn:hover {
      background-color: rgba(var(--primary-rgb), 0.1);
    }
    
    .node-details {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 300px;
      background-color: var(--bg-paper);
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      z-index: 10;
    }
    
    .details-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-color);
    }
    
    .details-header h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
    
    .close-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    
    .close-btn:hover {
      background-color: rgba(0, 0, 0, 0.05);
      color: var(--text-primary);
    }
    
    .details-content {
      padding: 16px;
    }
    
    .details-section {
      margin-bottom: 16px;
    }
    
    .details-section h5 {
      margin: 0 0 8px;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-secondary);
    }
    
    .detail-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    
    .detail-label {
      color: var(--text-secondary);
    }
    
    .detail-value {
      font-weight: 500;
    }
    
    .relations-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .relation-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background-color: var(--bg-default);
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .relation-item:hover {
      background-color: rgba(0, 0, 0, 0.03);
    }
    
    .relation-info {
      display: flex;
      flex-direction: column;
    }
    
    .relation-name {
      font-weight: 500;
      font-size: 14px;
    }
    
    .relation-type {
      font-size: 12px;
      color: var(--text-secondary);
    }
  `]
})
export class ThreatRelationshipComponent implements OnChanges, AfterViewInit {
  @ViewChild('graphContainer') graphContainer!: ElementRef;
  @Input() data: ThreatRelationshipData = { nodes: [], links: [] };
  
  // Vue actuelle
  currentView: 'graph' | 'matrix' | 'list' = 'graph';
  
  // Recherche
  searchQuery: string = '';
  filteredNodes: ThreatNode[] = [];
  
  // Sélection
  selectedNode: ThreatNode | null = null;
  nodeRelations: { node: ThreatNode, type: string }[] = [];
  
  // D3 éléments
  private svg: any;
  private simulation: any;
  private nodeElements: any;
  private linkElements: any;
  private zoomBehavior: any;
  
  constructor() {}
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.filteredNodes = [...this.data.nodes];
      
      if (this.graphContainer && this.currentView === 'graph') {
        this.initializeGraph();
      }
    }
  }
  
  ngAfterViewInit(): void {
    if (this.data && this.currentView === 'graph') {
      this.initializeGraph();
    }
  }
  
  setView(view: 'graph' | 'matrix' | 'list'): void {
    this.currentView = view;
    
    if (view === 'graph' && this.data) {
      setTimeout(() => {
        this.initializeGraph();
      }, 0);
    }
  }
  
  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredNodes = [...this.data.nodes];
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredNodes = this.data.nodes.filter(node => 
        node.name.toLowerCase().includes(query) || 
        node.type.toLowerCase().includes(query)
      );
    }
    
    if (this.currentView === 'graph') {
      this.updateGraph();
    }
  }
  
  showNodeRelations(node: ThreatNode): void {
    this.selectedNode = node;
    this.nodeRelations = this.getNodeRelations(node.id);
  }
  
  closeDetails(): void {
    this.selectedNode = null;
    this.nodeRelations = [];
  }
  
  getNodeRelationsCount(nodeId: string): number {
    return this.data.links.filter(link => 
      link.source === nodeId || link.target === nodeId
    ).length;
  }
  
  getNodeRelations(nodeId: string): { node: ThreatNode, type: string }[] {
    const relations: { node: ThreatNode, type: string }[] = [];
    
    this.data.links.forEach(link => {
      if (link.source === nodeId) {
        const targetNode = this.data.nodes.find(node => node.id === link.target);
        if (targetNode) {
          relations.push({
            node: targetNode,
            type: link.type
          });
        }
      } else if (link.target === nodeId) {
        const sourceNode = this.data.nodes.find(node => node.id === link.source);
        if (sourceNode) {
          relations.push({
            node: sourceNode,
            type: link.type
          });
        }
      }
    });
    
    return relations;
  }
  
  private initializeGraph(): void {
    // Nettoyer le conteneur
    if (this.graphContainer.nativeElement.innerHTML) {
      this.graphContainer.nativeElement.innerHTML = '';
    }
    
    // Créer le SVG
    const width = this.graphContainer.nativeElement.clientWidth;
    const height = this.graphContainer.nativeElement.clientHeight;
    
    this.svg = d3.select(this.graphContainer.nativeElement)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto;');
    
    // Ajouter un groupe pour le zoom
    const g = this.svg.append('g');
    
    // Créer le comportement de zoom
    this.zoomBehavior = d3.zoom()
      .extent([[0, 0], [width, height]])
      .scaleExtent([0.1, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    
    this.svg.call(this.zoomBehavior);
    
    // Créer les liens
    this.linkElements = g.append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(this.data.links)
      .join('line')
      .attr('stroke-width', d => Math.sqrt(d.strength) * 2);
    
    // Créer les nœuds
    this.nodeElements = g.append('g')
      .selectAll('circle')
      .data(this.data.nodes)
      .join('circle')
      .attr('r', 8)
      .attr('fill', d => this.getNodeColor(d.severity))
      .call(this.drag())
      .on('click', (event, d) => {
        this.showNodeRelations(d);
      });
    
    // Ajouter des tooltips
    this.nodeElements.append('title')
      .text(d => d.name);
    
    // Créer la simulation
    this.simulation = d3.forceSimulation(this.data.nodes)
      .force('link', d3.forceLink(this.data.links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .on('tick', () => {
        this.linkElements
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);
        
        this.nodeElements
          .attr('cx', d => d.x)
          .attr('cy', d => d.y);
      });
  }
  
  private updateGraph(): void {
    // Mettre à jour le graphe en fonction des filtres
    if (!this.svg) return;
    
    // Filtrer les nœuds et les liens
    const nodeIds = new Set(this.filteredNodes.map(node => node.id));
    const filteredLinks = this.data.links.filter(link => 
      nodeIds.has(link.source as string) && nodeIds.has(link.target as string)
    );
    
    // Mettre à jour les éléments
    this.nodeElements = this.nodeElements.data(this.filteredNodes, d => d.id);
    this.nodeElements.exit().remove();
    
    this.linkElements = this.linkElements.data(filteredLinks, d => `${d.source}-${d.target}`);
    this.linkElements.exit().remove();
    
    // Mettre à jour la simulation
    this.simulation.nodes(this.filteredNodes);
    this.simulation.force('link').links(filteredLinks);
    this.simulation.alpha(1).restart();
  }
  
  private getNodeColor(severity: string): string {
    switch (severity) {
      case 'critical':
        return '#d32f2f';
      case 'high':
        return '#f57c00';
      case 'medium':
        return '#fbc02d';
      case 'low':
        return '#2e7d32';
      default:
        return '#2196f3';
    }
  }
  
  private drag(): any {
    const dragstarted = (event: any, d: any) => {
      if (!event.active) this.simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    };
    
    const dragged = (event: any, d: any) => {
      d.fx = event.x;
      d.fy = event.y;
    };
    
    const dragended = (event: any, d: any) => {
      if (!event.active) this.simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    };
    
    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }
}
