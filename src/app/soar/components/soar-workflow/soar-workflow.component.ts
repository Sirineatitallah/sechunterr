import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { VisualizationService } from '../../../shared/services/visualization.service';
import { Subscription } from 'rxjs';

declare var mxGraph: any;
declare var mxEvent: any;
declare var mxUtils: any;
declare var mxClient: any;
declare var mxRubberband: any;
declare var mxConstants: any;
declare var mxPerimeter: any;
declare var mxEdgeStyle: any;
declare var mxGraphHandler: any;
declare var mxImage: any;
declare var mxCellState: any;
declare var mxPoint: any;
declare var mxHierarchicalLayout: any;

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'enrichment' | 'notification';
  title: string;
  description: string;
  status?: 'active' | 'inactive' | 'error';
  config?: any;
  position?: { x: number, y: number };
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'draft' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

@Component({
  selector: 'app-soar-workflow',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
    MatDialogModule,
    FormsModule
  ],
  templateUrl: './soar-workflow.component.html',
  styleUrls: ['./soar-workflow.component.scss']
})
export class SoarWorkflowComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('graphContainer') graphContainer!: ElementRef;

  // Workflow data
  workflows: Workflow[] = [];
  selectedWorkflow: Workflow | null = null;

  // Graph
  private graph: any;
  private parent: any;

  // Loading state
  loading: boolean = true;

  // Edit mode
  editMode: boolean = false;

  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor(private visualizationService: VisualizationService) { }

  ngOnInit(): void {
    // Load initial data
    this.loadData();

    // Subscribe to refresh trigger
    this.subscriptions.push(
      this.visualizationService.refreshTrigger$.subscribe(trigger => {
        if (trigger) {
          this.loadData();
          if (this.graph) {
            this.renderWorkflow();
          }
        }
      })
    );

    // Load mxGraph script
    this.loadMxGraphScript().then(() => {
      this.loading = false;
      // Script loaded, graph will be rendered in ngAfterViewInit
    });
  }

  ngAfterViewInit(): void {
    // Render graph
    setTimeout(() => {
      this.initGraph();
      this.renderWorkflow();
    }, 100);
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Load mxGraph script
  loadMxGraphScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof mxGraph !== 'undefined') {
        resolve();
        return;
      }

      // Load CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://jgraph.github.io/mxgraph/javascript/examples/grapheditor/www/styles/grapheditor.css';
      document.head.appendChild(link);

      // Load JS
      const script = document.createElement('script');
      script.src = 'https://jgraph.github.io/mxgraph/javascript/mxClient.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = (error) => reject(error);
      document.head.appendChild(script);
    });
  }

  // Load workflow data
  loadData(): void {
    // In a real application, this would fetch data from an API
    // For demo purposes, we'll use mock data
    this.workflows = [
      {
        id: 'wf1',
        name: 'Incident Response - Malware Detection',
        description: 'Workflow automatisé pour la détection et la réponse aux incidents de malware',
        status: 'active',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        nodes: [
          {
            id: 'n1',
            type: 'trigger',
            title: 'Alerte Malware',
            description: 'Déclencheur sur alerte de détection de malware',
            status: 'active',
            position: { x: 50, y: 100 }
          },
          {
            id: 'n2',
            type: 'enrichment',
            title: 'Enrichissement IOC',
            description: 'Enrichir les IOCs avec des données de threat intelligence',
            status: 'active',
            position: { x: 250, y: 100 }
          },
          {
            id: 'n3',
            type: 'condition',
            title: 'Vérification Sévérité',
            description: 'Vérifier si la sévérité est élevée ou critique',
            status: 'active',
            position: { x: 450, y: 100 }
          },
          {
            id: 'n4',
            type: 'action',
            title: 'Isolation Machine',
            description: 'Isoler la machine du réseau',
            status: 'active',
            position: { x: 650, y: 50 }
          },
          {
            id: 'n5',
            type: 'action',
            title: 'Scan Antivirus',
            description: 'Lancer un scan antivirus complet',
            status: 'active',
            position: { x: 650, y: 150 }
          },
          {
            id: 'n6',
            type: 'notification',
            title: 'Notification Équipe',
            description: 'Notifier l\'équipe de sécurité',
            status: 'active',
            position: { x: 850, y: 100 }
          }
        ],
        edges: [
          {
            id: 'e1',
            source: 'n1',
            target: 'n2',
            label: 'Nouvelle alerte'
          },
          {
            id: 'e2',
            source: 'n2',
            target: 'n3',
            label: 'IOCs enrichis'
          },
          {
            id: 'e3',
            source: 'n3',
            target: 'n4',
            label: 'Sévérité élevée',
            condition: 'severity >= 7'
          },
          {
            id: 'e4',
            source: 'n3',
            target: 'n5',
            label: 'Sévérité moyenne',
            condition: 'severity < 7'
          },
          {
            id: 'e5',
            source: 'n4',
            target: 'n6',
            label: 'Machine isolée'
          },
          {
            id: 'e6',
            source: 'n5',
            target: 'n6',
            label: 'Scan terminé'
          }
        ]
      },
      {
        id: 'wf2',
        name: 'Phishing Response',
        description: 'Workflow pour la gestion des incidents de phishing',
        status: 'draft',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        nodes: [
          {
            id: 'n1',
            type: 'trigger',
            title: 'Rapport Phishing',
            description: 'Rapport utilisateur ou détection automatique de phishing',
            status: 'active',
            position: { x: 50, y: 100 }
          },
          {
            id: 'n2',
            type: 'enrichment',
            title: 'Analyse Email',
            description: 'Analyser l\'email pour extraire les URLs et pièces jointes',
            status: 'active',
            position: { x: 250, y: 100 }
          },
          {
            id: 'n3',
            type: 'action',
            title: 'Blocage URLs',
            description: 'Bloquer les URLs malveillantes dans le proxy',
            status: 'active',
            position: { x: 450, y: 50 }
          },
          {
            id: 'n4',
            type: 'action',
            title: 'Suppression Emails',
            description: 'Supprimer les emails similaires des boîtes de réception',
            status: 'active',
            position: { x: 450, y: 150 }
          },
          {
            id: 'n5',
            type: 'notification',
            title: 'Notification Utilisateurs',
            description: 'Notifier les utilisateurs concernés',
            status: 'active',
            position: { x: 650, y: 100 }
          }
        ],
        edges: [
          {
            id: 'e1',
            source: 'n1',
            target: 'n2',
            label: 'Nouveau rapport'
          },
          {
            id: 'e2',
            source: 'n2',
            target: 'n3',
            label: 'URLs détectées'
          },
          {
            id: 'e3',
            source: 'n2',
            target: 'n4',
            label: 'Email analysé'
          },
          {
            id: 'e4',
            source: 'n3',
            target: 'n5',
            label: 'URLs bloquées'
          },
          {
            id: 'e5',
            source: 'n4',
            target: 'n5',
            label: 'Emails supprimés'
          }
        ]
      }
    ];

    // Select first workflow by default
    if (this.workflows.length > 0 && !this.selectedWorkflow) {
      this.selectedWorkflow = this.workflows[0];
    }
  }

  // Initialize graph
  initGraph(): void {
    if (typeof mxGraph === 'undefined') {
      console.error('mxGraph not loaded');
      return;
    }

    const container = this.graphContainer.nativeElement;
    if (!container) {
      console.error('Graph container not found');
      return;
    }

    // Checks if the browser is supported
    if (!mxClient.isBrowserSupported()) {
      mxUtils.error('Browser is not supported!', 200, false);
      return;
    }

    // Creates the graph inside the given container
    this.graph = new mxGraph(container);
    this.parent = this.graph.getDefaultParent();

    // Enables rubberband selection
    new mxRubberband(this.graph);

    // Enables tooltips
    this.graph.setTooltips(true);

    // Enables panning with left mouse button
    this.graph.setPanning(true);
    this.graph.panningHandler.useLeftButtonForPanning = true;

    // Changes the default vertex style
    const style = this.graph.getStylesheet().getDefaultVertexStyle();
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
    style[mxConstants.STYLE_ROUNDED] = true;
    style[mxConstants.STYLE_ARCSIZE] = 10;
    style[mxConstants.STYLE_FILLCOLOR] = '#1A1A2E';
    style[mxConstants.STYLE_STROKECOLOR] = '#4A4A6A';
    style[mxConstants.STYLE_STROKEWIDTH] = 1;
    style[mxConstants.STYLE_FONTCOLOR] = '#FFFFFF';
    style[mxConstants.STYLE_FONTSIZE] = 12;
    style[mxConstants.STYLE_FONTSTYLE] = 0;
    style[mxConstants.STYLE_SPACING_TOP] = 4;
    style[mxConstants.STYLE_SPACING_BOTTOM] = 4;
    style[mxConstants.STYLE_SPACING_LEFT] = 4;
    style[mxConstants.STYLE_SPACING_RIGHT] = 4;
    style[mxConstants.STYLE_SHADOW] = true;
    style[mxConstants.STYLE_GLASS] = true;

    // Changes the default edge style
    const edgeStyle = this.graph.getStylesheet().getDefaultEdgeStyle();
    edgeStyle[mxConstants.STYLE_ROUNDED] = true;
    edgeStyle[mxConstants.STYLE_STROKECOLOR] = '#4A4A6A';
    edgeStyle[mxConstants.STYLE_STROKEWIDTH] = 2;
    edgeStyle[mxConstants.STYLE_FONTCOLOR] = '#CCCCCC';
    edgeStyle[mxConstants.STYLE_FONTSIZE] = 10;
    edgeStyle[mxConstants.STYLE_EDGE] = mxEdgeStyle.OrthConnector;
    edgeStyle[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_CLASSIC;
    edgeStyle[mxConstants.STYLE_ENDSIZE] = 6;

    // Define custom styles for node types
    this.graph.getStylesheet().putCellStyle('trigger', {
      [mxConstants.STYLE_SHAPE]: mxConstants.SHAPE_RECTANGLE,
      [mxConstants.STYLE_FILLCOLOR]: '#4361EE',
      [mxConstants.STYLE_STROKECOLOR]: '#3A56D4',
      [mxConstants.STYLE_STROKEWIDTH]: 2,
      [mxConstants.STYLE_FONTCOLOR]: '#FFFFFF',
      [mxConstants.STYLE_ROUNDED]: true,
      [mxConstants.STYLE_ARCSIZE]: 10,
      [mxConstants.STYLE_SHADOW]: true
    });

    this.graph.getStylesheet().putCellStyle('condition', {
      [mxConstants.STYLE_SHAPE]: mxConstants.SHAPE_RHOMBUS,
      [mxConstants.STYLE_FILLCOLOR]: '#F72585',
      [mxConstants.STYLE_STROKECOLOR]: '#D91E70',
      [mxConstants.STYLE_STROKEWIDTH]: 2,
      [mxConstants.STYLE_FONTCOLOR]: '#FFFFFF',
      [mxConstants.STYLE_SHADOW]: true
    });

    this.graph.getStylesheet().putCellStyle('action', {
      [mxConstants.STYLE_SHAPE]: mxConstants.SHAPE_RECTANGLE,
      [mxConstants.STYLE_FILLCOLOR]: '#7209B7',
      [mxConstants.STYLE_STROKECOLOR]: '#6208A0',
      [mxConstants.STYLE_STROKEWIDTH]: 2,
      [mxConstants.STYLE_FONTCOLOR]: '#FFFFFF',
      [mxConstants.STYLE_ROUNDED]: true,
      [mxConstants.STYLE_ARCSIZE]: 10,
      [mxConstants.STYLE_SHADOW]: true
    });

    this.graph.getStylesheet().putCellStyle('enrichment', {
      [mxConstants.STYLE_SHAPE]: mxConstants.SHAPE_RECTANGLE,
      [mxConstants.STYLE_FILLCOLOR]: '#4CC9F0',
      [mxConstants.STYLE_STROKECOLOR]: '#3EAFD3',
      [mxConstants.STYLE_STROKEWIDTH]: 2,
      [mxConstants.STYLE_FONTCOLOR]: '#FFFFFF',
      [mxConstants.STYLE_ROUNDED]: true,
      [mxConstants.STYLE_ARCSIZE]: 10,
      [mxConstants.STYLE_SHADOW]: true
    });

    this.graph.getStylesheet().putCellStyle('notification', {
      [mxConstants.STYLE_SHAPE]: mxConstants.SHAPE_RECTANGLE,
      [mxConstants.STYLE_FILLCOLOR]: '#F9C80E',
      [mxConstants.STYLE_STROKECOLOR]: '#E0B50C',
      [mxConstants.STYLE_STROKEWIDTH]: 2,
      [mxConstants.STYLE_FONTCOLOR]: '#333333',
      [mxConstants.STYLE_ROUNDED]: true,
      [mxConstants.STYLE_ARCSIZE]: 10,
      [mxConstants.STYLE_SHADOW]: true
    });

    // Disables editing by default
    this.graph.setEnabled(this.editMode);

    // Enables HTML labels
    this.graph.setHtmlLabels(true);

    // Enables connect preview
    this.graph.connectionHandler.createEdgeState = function(me: any) {
      const edge = this.graph.createEdge(null, null, null, null, null);
      return new mxCellState(this.graph.view, edge, this.graph.getCellStyle(edge));
    };

    // Specifies the default edge style
    this.graph.getStylesheet().getDefaultEdgeStyle()[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_CLASSIC;

    // Enables snapping to grid
    mxGraphHandler.prototype.guidesEnabled = true;

    // Enables guides
    mxGraphHandler.prototype.useGuidesForEvent = function(me: any) {
      return !mxEvent.isAltDown(me.getEvent());
    };

    // Enables tooltips
    this.graph.setTooltips(true);

    // Adds cells to the model in a single step
    this.graph.getModel().beginUpdate();
    try {
      // Add nodes and edges
      if (this.selectedWorkflow) {
        this.renderWorkflow();
      }
    } finally {
      // Updates the display
      this.graph.getModel().endUpdate();
    }

    // Adds a click listener for cells
    this.graph.addListener(mxEvent.CLICK, (sender: any, evt: any) => {
      const cell = evt.getProperty('cell');
      if (cell) {
        // Handle cell click
        console.log('Cell clicked:', cell);
        // In a real application, you would show details or perform an action
      }
      evt.consume();
    });
  }

  // Render workflow
  renderWorkflow(): void {
    if (!this.graph || !this.selectedWorkflow) {
      return;
    }

    // Clear graph
    this.graph.removeCells(this.graph.getChildVertices(this.parent));

    // Begin update
    this.graph.getModel().beginUpdate();
    try {
      // Map to store node cells by ID
      const nodeCells: { [key: string]: any } = {};

      // Add nodes
      this.selectedWorkflow.nodes.forEach(node => {
        const style = node.type;
        const label = `<div style="text-align: center; padding: 4px;">
                        <div style="font-weight: bold; margin-bottom: 4px;">${node.title}</div>
                        <div style="font-size: 10px; color: #CCCCCC;">${node.description}</div>
                      </div>`;

        const vertex = this.graph.insertVertex(
          this.parent, node.id, label,
          node.position?.x || 0, node.position?.y || 0,
          160, 60, style
        );

        nodeCells[node.id] = vertex;
      });

      // Add edges
      this.selectedWorkflow.edges.forEach(edge => {
        const sourceCell = nodeCells[edge.source];
        const targetCell = nodeCells[edge.target];

        if (sourceCell && targetCell) {
          const label = edge.label || '';
          this.graph.insertEdge(this.parent, edge.id, label, sourceCell, targetCell);
        }
      });

      // Auto layout if no positions are defined
      const hasPositions = this.selectedWorkflow.nodes.every(node => node.position);
      if (!hasPositions) {
        const layout = new mxHierarchicalLayout(this.graph);
        layout.execute(this.parent);
      }
    } finally {
      // End update
      this.graph.getModel().endUpdate();
    }
  }

  // Select workflow
  selectWorkflow(workflow: Workflow): void {
    this.selectedWorkflow = workflow;
    this.renderWorkflow();
  }

  // Toggle edit mode
  toggleEditMode(): void {
    this.editMode = !this.editMode;
    this.graph.setEnabled(this.editMode);
  }

  // Refresh data
  refreshData(): void {
    this.loadData();
    this.renderWorkflow();
  }

  // Format date
  formatDate(date: Date): string {
    return date.toLocaleDateString();
  }

  // Get workflow status class
  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'status-active';
      case 'draft': return 'status-draft';
      case 'inactive': return 'status-inactive';
      default: return '';
    }
  }
}
