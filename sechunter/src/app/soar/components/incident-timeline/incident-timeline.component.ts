import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VisualizationService } from '../../../shared/services/visualization.service';
import { Subscription } from 'rxjs';

declare var vis: any;

interface TimelineItem {
  id: string;
  content: string;
  start: Date;
  end?: Date;
  type?: string;
  group?: number;
  className?: string;
  title?: string;
}

interface TimelineGroup {
  id: number;
  content: string;
  className?: string;
}

@Component({
  selector: 'app-incident-timeline',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './incident-timeline.component.html',
  styleUrls: ['./incident-timeline.component.scss']
})
export class IncidentTimelineComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('timelineContainer') timelineContainer!: ElementRef;

  // Timeline data
  timelineItems: TimelineItem[] = [];
  timelineGroups: TimelineGroup[] = [];

  // Timeline instance
  private timeline: any;

  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor(private visualizationService: VisualizationService) { }

  ngOnInit(): void {
    // Load initial data
    this.loadData();

    // Subscribe to time range changes
    this.subscriptions.push(
      this.visualizationService.selectedTimeRange$.subscribe(() => {
        this.loadData();
        this.updateTimeline();
      })
    );

    // Subscribe to refresh trigger
    this.subscriptions.push(
      this.visualizationService.refreshTrigger$.subscribe(trigger => {
        if (trigger) {
          this.loadData();
          this.updateTimeline();
        }
      })
    );

    // Load vis.js script
    this.loadVisScript().then(() => {
      // Script loaded, timeline will be rendered in ngAfterViewInit
    });
  }

  ngAfterViewInit(): void {
    // Render timeline
    setTimeout(() => {
      this.renderTimeline();
    }, 100);
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());

    // Destroy timeline
    if (this.timeline) {
      this.timeline.destroy();
    }
  }

  // Load vis.js script
  loadVisScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof vis !== 'undefined') {
        resolve();
        return;
      }

      // Load CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/vis-timeline@7.7.0/dist/vis-timeline-graph2d.min.css';
      document.head.appendChild(link);

      // Load JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/vis-timeline@7.7.0/dist/vis-timeline-graph2d.min.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = (error) => reject(error);
      document.head.appendChild(script);
    });
  }

  // Load timeline data
  loadData(): void {
    // In a real application, this would fetch data from an API
    // For demo purposes, we'll use mock data

    // Define groups
    this.timelineGroups = [
      { id: 1, content: 'Détection', className: 'group-detection' },
      { id: 2, content: 'Analyse', className: 'group-analysis' },
      { id: 3, content: 'Remédiation', className: 'group-remediation' },
      { id: 4, content: 'Résolution', className: 'group-resolution' }
    ];

    // Define items
    const now = new Date();
    const hour = 60 * 60 * 1000;

    this.timelineItems = [
      {
        id: '1',
        content: 'Alerte IDS détectée',
        start: new Date(now.getTime() - 5 * hour),
        group: 1,
        className: 'item-alert',
        title: 'Alerte IDS: Tentative d\'accès non autorisé détectée'
      },
      {
        id: '2',
        content: 'Analyse des logs',
        start: new Date(now.getTime() - 4.5 * hour),
        end: new Date(now.getTime() - 4 * hour),
        group: 2,
        className: 'item-analysis',
        title: 'Analyse des logs de connexion et des journaux d\'événements'
      },
      {
        id: '3',
        content: 'Identification de l\'attaquant',
        start: new Date(now.getTime() - 4 * hour),
        group: 2,
        className: 'item-discovery',
        title: 'IP source identifiée: 192.168.1.100'
      },
      {
        id: '4',
        content: 'Blocage de l\'IP',
        start: new Date(now.getTime() - 3.5 * hour),
        group: 3,
        className: 'item-action',
        title: 'Blocage de l\'IP 192.168.1.100 au niveau du pare-feu'
      },
      {
        id: '5',
        content: 'Analyse de vulnérabilité',
        start: new Date(now.getTime() - 3 * hour),
        end: new Date(now.getTime() - 2 * hour),
        group: 2,
        className: 'item-analysis',
        title: 'Analyse des vulnérabilités exploitées'
      },
      {
        id: '6',
        content: 'Déploiement du patch',
        start: new Date(now.getTime() - 2 * hour),
        group: 3,
        className: 'item-action',
        title: 'Déploiement du correctif de sécurité'
      },
      {
        id: '7',
        content: 'Vérification',
        start: new Date(now.getTime() - 1.5 * hour),
        end: new Date(now.getTime() - 1 * hour),
        group: 4,
        className: 'item-verification',
        title: 'Vérification de l\'efficacité des mesures prises'
      },
      {
        id: '8',
        content: 'Incident résolu',
        start: new Date(now.getTime() - 1 * hour),
        group: 4,
        className: 'item-resolution',
        title: 'Incident résolu et documenté'
      }
    ];
  }

  // Render timeline
  renderTimeline(): void {
    if (typeof vis === 'undefined') {
      console.error('vis.js not loaded');
      return;
    }

    const container = this.timelineContainer.nativeElement;
    if (!container) {
      console.error('Timeline container not found');
      return;
    }

    // Create timeline
    const items = new vis.DataSet(this.timelineItems);
    const groups = new vis.DataSet(this.timelineGroups);

    const options = {
      height: '100%',
      min: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      max: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour from now
      zoomMin: 1000 * 60 * 60, // 1 hour
      zoomMax: 1000 * 60 * 60 * 24, // 24 hours
      orientation: 'top',
      verticalScroll: true,
      stack: true,
      showCurrentTime: true,
      format: {
        minorLabels: {
          minute: 'HH:mm',
          hour: 'HH:mm'
        },
        majorLabels: {
          hour: 'ddd D MMM',
          day: 'ddd D MMM'
        }
      },
      groupOrder: 'id',
      groupEditable: false,
      editable: false,
      tooltip: {
        followMouse: true,
        overflowMethod: 'cap'
      }
    };

    this.timeline = new vis.Timeline(container, items, groups, options);

    // Add click event
    if (this.timeline) {
      this.timeline.on('click', (properties: any) => {
        if (properties.item) {
          const item = this.timelineItems.find(i => i.id === properties.item);
          if (item) {
            console.log('Clicked item:', item);
            // In a real application, you would show details or perform an action
          }
        }
      });
    }
  }

  // Update timeline
  updateTimeline(): void {
    if (this.timeline) {
      const items = new vis.DataSet(this.timelineItems);
      this.timeline.setItems(items);
    }
  }

  // Refresh data
  refreshData(): void {
    this.loadData();
    this.updateTimeline();
  }

  // Zoom in
  zoomIn(): void {
    if (this.timeline) {
      this.timeline.zoomIn(0.5);
    }
  }

  // Zoom out
  zoomOut(): void {
    if (this.timeline) {
      this.timeline.zoomOut(0.5);
    }
  }

  // Move to current time
  moveToNow(): void {
    if (this.timeline) {
      this.timeline.moveTo(new Date());
    }
  }
}
