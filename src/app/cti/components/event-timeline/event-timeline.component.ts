import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VisualizationService } from '../../../shared/services/visualization.service';
import { Subscription } from 'rxjs';

declare var vis: any;

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  type: 'malware' | 'exploit' | 'vulnerability' | 'campaign' | 'threat-actor';
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: Date;
  source: string;
  relatedEvents?: string[];
  indicators?: string[];
  mitreTactics?: string[];
}

interface TimelineItem {
  id: string;
  content: string;
  start: Date;
  type?: string;
  group?: number;
  className?: string;
  title?: string;
  style?: string;
}

interface TimelineGroup {
  id: number;
  content: string;
  className?: string;
}

@Component({
  selector: 'app-event-timeline',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './event-timeline.component.html',
  styleUrls: ['./event-timeline.component.scss']
})
export class EventTimelineComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('timelineContainer') timelineContainer!: ElementRef;

  // Timeline data
  events: TimelineEvent[] = [];
  timelineItems: TimelineItem[] = [];
  timelineGroups: TimelineGroup[] = [];

  // Timeline instance
  private timeline: any;

  // Filter options
  selectedSeverities: string[] = ['critical', 'high', 'medium', 'low'];
  selectedTypes: string[] = ['malware', 'exploit', 'vulnerability', 'campaign', 'threat-actor'];
  timeRange: 'day' | 'week' | 'month' | 'year' = 'week';

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
    const now = new Date();
    const day = 24 * 60 * 60 * 1000;

    // Define groups
    this.timelineGroups = [
      { id: 1, content: 'Malware', className: 'group-malware' },
      { id: 2, content: 'Exploits', className: 'group-exploits' },
      { id: 3, content: 'Vulnérabilités', className: 'group-vulnerabilities' },
      { id: 4, content: 'Campagnes', className: 'group-campaigns' },
      { id: 5, content: 'Acteurs de menace', className: 'group-threat-actors' }
    ];

    // Define events
    this.events = [
      {
        id: '1',
        title: 'Nouvelle variante de ransomware BlackCat',
        description: 'Une nouvelle variante du ransomware BlackCat a été détectée avec des capacités améliorées de chiffrement et d\'exfiltration de données.',
        type: 'malware',
        severity: 'critical',
        timestamp: new Date(now.getTime() - 0.2 * day),
        source: 'CERT-FR',
        mitreTactics: ['TA0002', 'TA0005', 'TA0040']
      },
      {
        id: '2',
        title: 'Exploitation active de CVE-2023-1234',
        description: 'Des acteurs malveillants exploitent activement la vulnérabilité CVE-2023-1234 dans Apache Struts pour exécuter du code à distance.',
        type: 'exploit',
        severity: 'critical',
        timestamp: new Date(now.getTime() - 1.5 * day),
        source: 'CISA',
        relatedEvents: ['3'],
        indicators: ['45.55.32.11', 'malicious.domain.com']
      },
      {
        id: '3',
        title: 'Vulnérabilité critique dans Apache Struts (CVE-2023-1234)',
        description: 'Une vulnérabilité critique d\'exécution de code à distance a été découverte dans Apache Struts.',
        type: 'vulnerability',
        severity: 'critical',
        timestamp: new Date(now.getTime() - 3 * day),
        source: 'NVD',
        relatedEvents: ['2']
      },
      {
        id: '4',
        title: 'Campagne de phishing ciblant le secteur financier',
        description: 'Une campagne de phishing sophistiquée cible les employés du secteur financier avec des documents malveillants.',
        type: 'campaign',
        severity: 'high',
        timestamp: new Date(now.getTime() - 2 * day),
        source: 'ANSSI',
        indicators: ['evil.domain.net', 'document-important.xls']
      },
      {
        id: '5',
        title: 'Activité accrue du groupe APT29',
        description: 'Le groupe APT29 a été observé ciblant des organisations gouvernementales avec de nouvelles tactiques.',
        type: 'threat-actor',
        severity: 'high',
        timestamp: new Date(now.getTime() - 5 * day),
        source: 'MITRE',
        mitreTactics: ['TA0001', 'TA0003', 'TA0008']
      },
      {
        id: '6',
        title: 'Vulnérabilité dans Windows Print Spooler (CVE-2023-5678)',
        description: 'Une vulnérabilité d\'élévation de privilèges a été découverte dans Windows Print Spooler.',
        type: 'vulnerability',
        severity: 'medium',
        timestamp: new Date(now.getTime() - 4 * day),
        source: 'Microsoft'
      },
      {
        id: '7',
        title: 'Nouveau malware bancaire Android',
        description: 'Un nouveau malware bancaire ciblant les applications Android a été découvert dans plusieurs applications du Play Store.',
        type: 'malware',
        severity: 'high',
        timestamp: new Date(now.getTime() - 1 * day),
        source: 'Google'
      }
    ];

    // Convert events to timeline items
    this.timelineItems = this.events.map(event => {
      // Determine group based on event type
      let group = 1;
      switch (event.type) {
        case 'malware': group = 1; break;
        case 'exploit': group = 2; break;
        case 'vulnerability': group = 3; break;
        case 'campaign': group = 4; break;
        case 'threat-actor': group = 5; break;
      }

      // Determine class based on severity
      let className = `item-${event.type} severity-${event.severity}`;

      // Create timeline item
      return {
        id: event.id,
        content: `<div class="event-title">${event.title}</div>`,
        start: event.timestamp,
        group: group,
        className: className,
        title: `<div class="event-tooltip">
                  <div class="event-tooltip-title">${event.title}</div>
                  <div class="event-tooltip-severity ${event.severity}">${event.severity.toUpperCase()}</div>
                  <div class="event-tooltip-description">${event.description}</div>
                  <div class="event-tooltip-source">Source: ${event.source}</div>
                </div>`
      };
    });
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
      min: this.getTimeRangeStart(),
      max: new Date(),
      zoomMin: 1000 * 60 * 60 * 24, // 1 day
      zoomMax: 1000 * 60 * 60 * 24 * 365, // 1 year
      orientation: 'top',
      verticalScroll: true,
      stack: true,
      showCurrentTime: true,
      format: {
        minorLabels: {
          minute: 'HH:mm',
          hour: 'HH:mm',
          day: 'D MMM',
          month: 'MMM YYYY'
        },
        majorLabels: {
          minute: 'ddd D MMM',
          hour: 'ddd D MMM',
          day: 'MMMM YYYY',
          month: 'YYYY'
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
          const event = this.events.find(e => e.id === properties.item);
          if (event) {
            console.log('Clicked event:', event);
            // In a real application, you would show details or perform an action
            this.showEventDetails(event);
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
      this.timeline.setOptions({
        min: this.getTimeRangeStart(),
        max: new Date()
      });
    }
  }

  // Get time range start date based on selected time range
  getTimeRangeStart(): Date {
    const now = new Date();
    switch (this.timeRange) {
      case 'day':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'year':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  }

  // Filter events
  filterEvents(): void {
    // Filter events based on selected severities and types
    const filteredEvents = this.events.filter(event => 
      this.selectedSeverities.includes(event.severity) && 
      this.selectedTypes.includes(event.type)
    );

    // Convert filtered events to timeline items
    this.timelineItems = filteredEvents.map(event => {
      // Determine group based on event type
      let group = 1;
      switch (event.type) {
        case 'malware': group = 1; break;
        case 'exploit': group = 2; break;
        case 'vulnerability': group = 3; break;
        case 'campaign': group = 4; break;
        case 'threat-actor': group = 5; break;
      }

      // Determine class based on severity
      let className = `item-${event.type} severity-${event.severity}`;

      // Create timeline item
      return {
        id: event.id,
        content: `<div class="event-title">${event.title}</div>`,
        start: event.timestamp,
        group: group,
        className: className,
        title: `<div class="event-tooltip">
                  <div class="event-tooltip-title">${event.title}</div>
                  <div class="event-tooltip-severity ${event.severity}">${event.severity.toUpperCase()}</div>
                  <div class="event-tooltip-description">${event.description}</div>
                  <div class="event-tooltip-source">Source: ${event.source}</div>
                </div>`
      };
    });

    // Update timeline
    this.updateTimeline();
  }

  // Toggle severity filter
  toggleSeverity(severity: string): void {
    if (this.selectedSeverities.includes(severity)) {
      this.selectedSeverities = this.selectedSeverities.filter(s => s !== severity);
    } else {
      this.selectedSeverities.push(severity);
    }
    this.filterEvents();
  }

  // Toggle type filter
  toggleType(type: string): void {
    if (this.selectedTypes.includes(type)) {
      this.selectedTypes = this.selectedTypes.filter(t => t !== type);
    } else {
      this.selectedTypes.push(type);
    }
    this.filterEvents();
  }

  // Set time range
  setTimeRange(range: 'day' | 'week' | 'month' | 'year'): void {
    this.timeRange = range;
    this.updateTimeline();
  }

  // Refresh data
  refreshData(): void {
    this.loadData();
    this.filterEvents();
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

  // Move to now
  moveToNow(): void {
    if (this.timeline) {
      this.timeline.moveTo(new Date());
    }
  }

  // Show event details
  showEventDetails(event: TimelineEvent): void {
    // In a real application, you would show a modal or navigate to a details page
    console.log('Show details for event:', event);
    // For demo purposes, we'll just log the event
  }
}
