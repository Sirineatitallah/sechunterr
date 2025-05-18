import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { VisualizationService } from '../../../shared/services/visualization.service';
import { Subscription } from 'rxjs';
import * as L from 'leaflet';
import { DrillDownViewComponent, DrillDownData } from '../../../shared/components/drill-down-view/drill-down-view.component';

interface ThreatSource {
  country: string;
  code: string;
  count: number;
  percentage: number;
  color: string;
  visible?: boolean;
  threatTypes?: { type: string; count: number }[];
  recentActivity?: { date: Date; description: string }[];
  riskScore?: number;
  trend?: number;
  coordinates?: [number, number];
}

interface ThreatEvent {
  id: string;
  country: string;
  countryCode: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: Date;
  description: string;
  ip?: string;
  latitude: number;
  longitude: number;
  indicators?: string[];
  relatedEvents?: string[];
}

@Component({
  selector: 'app-threat-map',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    DrillDownViewComponent
  ],
  templateUrl: './threat-map.component.html',
  styleUrls: ['./threat-map.component.scss']
})
export class ThreatMapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @Output() drillDown = new EventEmitter<DrillDownData>();

  // Leaflet map
  private map!: L.Map;
  private geoJsonLayer!: L.GeoJSON;
  private markerLayer!: L.LayerGroup;
  private heatLayer: any; // Leaflet.heat layer

  // Threat data
  threatSources: ThreatSource[] = [];
  threatEvents: ThreatEvent[] = [];
  totalThreats = 0;

  // Filter options
  filterOptions = {
    severityLevels: [
      { value: 'all', label: 'Toutes les sévérités' },
      { value: 'critical', label: 'Critique' },
      { value: 'high', label: 'Élevée' },
      { value: 'medium', label: 'Moyenne' },
      { value: 'low', label: 'Faible' }
    ],
    threatTypes: [
      { value: 'all', label: 'Tous les types' },
      { value: 'malware', label: 'Malware' },
      { value: 'phishing', label: 'Phishing' },
      { value: 'ransomware', label: 'Ransomware' },
      { value: 'ddos', label: 'DDoS' },
      { value: 'apt', label: 'APT' }
    ],
    timeRanges: [
      { value: '24h', label: '24 heures' },
      { value: '7d', label: '7 jours' },
      { value: '30d', label: '30 jours' },
      { value: '90d', label: '90 jours' }
    ]
  };

  // Selected filters
  selectedSeverity = 'all';
  selectedThreatType = 'all';
  selectedTimeRange = '7d';

  // View options
  showHeatmap = false;
  showMarkers = true;
  showCountryHighlight = true;

  // Drill-down data
  selectedThreatSource: ThreatSource | null = null;
  selectedThreatEvent: ThreatEvent | null = null;
  showDrillDown = false;
  drillDownData: DrillDownData | null = null;

  // Loading state
  loading = false;

  // Make Math available to the template
  Math = Math;

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
        this.updateMap();
      })
    );

    // Subscribe to refresh trigger
    this.subscriptions.push(
      this.visualizationService.refreshTrigger$.subscribe(trigger => {
        if (trigger) {
          this.loadData();
          this.updateMap();
        }
      })
    );
  }

  ngAfterViewInit(): void {
    // Initialize map
    this.initMap();
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());

    // Destroy map
    if (this.map) {
      this.map.remove();
    }
  }

  // Load threat data
  loadData(): void {
    this.loading = true;

    // In a real application, this would fetch data from an API
    // For demo purposes, we'll use mock data
    setTimeout(() => {
      // Generate threat sources with more detailed data
      this.threatSources = [
        {
          country: 'United States',
          code: 'USA',
          count: 450,
          percentage: 45,
          color: '#ff4757',
          coordinates: [37.0902, -95.7129],
          threatTypes: [
            { type: 'malware', count: 180 },
            { type: 'phishing', count: 120 },
            { type: 'ransomware', count: 90 },
            { type: 'ddos', count: 60 }
          ],
          recentActivity: [
            { date: new Date(Date.now() - 2 * 60 * 60 * 1000), description: 'Campagne de phishing détectée' },
            { date: new Date(Date.now() - 8 * 60 * 60 * 1000), description: 'Nouvelle variante de ransomware' },
            { date: new Date(Date.now() - 24 * 60 * 60 * 1000), description: 'Attaque DDoS sur infrastructure cloud' }
          ],
          riskScore: 85,
          trend: 12
        },
        {
          country: 'China',
          code: 'CHN',
          count: 300,
          percentage: 30,
          color: '#ffa502',
          coordinates: [35.8617, 104.1954],
          threatTypes: [
            { type: 'apt', count: 150 },
            { type: 'malware', count: 80 },
            { type: 'phishing', count: 70 }
          ],
          recentActivity: [
            { date: new Date(Date.now() - 4 * 60 * 60 * 1000), description: 'Activité APT détectée' },
            { date: new Date(Date.now() - 12 * 60 * 60 * 1000), description: 'Nouvelle campagne de cyberespionnage' }
          ],
          riskScore: 78,
          trend: -5
        },
        {
          country: 'Russia',
          code: 'RUS',
          count: 250,
          percentage: 25,
          color: '#ffdb58',
          coordinates: [61.5240, 105.3188],
          threatTypes: [
            { type: 'apt', count: 120 },
            { type: 'ransomware', count: 80 },
            { type: 'malware', count: 50 }
          ],
          recentActivity: [
            { date: new Date(Date.now() - 6 * 60 * 60 * 1000), description: 'Nouvelle variante de ransomware' },
            { date: new Date(Date.now() - 18 * 60 * 60 * 1000), description: 'Activité APT ciblant le secteur financier' }
          ],
          riskScore: 82,
          trend: 8
        },
        {
          country: 'North Korea',
          code: 'PRK',
          count: 120,
          percentage: 12,
          color: '#2ed573',
          coordinates: [40.3399, 127.5101],
          threatTypes: [
            { type: 'apt', count: 70 },
            { type: 'malware', count: 50 }
          ],
          recentActivity: [
            { date: new Date(Date.now() - 10 * 60 * 60 * 1000), description: 'Activité APT ciblant le secteur financier' }
          ],
          riskScore: 75,
          trend: 3
        },
        {
          country: 'Iran',
          code: 'IRN',
          count: 80,
          percentage: 8,
          color: '#70a1ff',
          coordinates: [32.4279, 53.6880],
          threatTypes: [
            { type: 'apt', count: 40 },
            { type: 'malware', count: 25 },
            { type: 'ddos', count: 15 }
          ],
          recentActivity: [
            { date: new Date(Date.now() - 14 * 60 * 60 * 1000), description: 'Activité APT ciblant le secteur énergétique' }
          ],
          riskScore: 68,
          trend: -2
        }
      ];

      // Generate threat events
      this.threatEvents = [];
      this.threatSources.forEach(source => {
        // Generate random events for each threat source
        const eventCount = Math.min(source.count / 50, 10);
        for (let i = 0; i < eventCount; i++) {
          const coordinates = this.getRandomNearby(source.coordinates![0], source.coordinates![1], 5);
          const severity = this.getRandomSeverity();
          const type = this.getRandomThreatType(source.threatTypes || []);

          this.threatEvents.push({
            id: `event-${source.code}-${i}`,
            country: source.country,
            countryCode: source.code,
            type: type,
            severity: severity,
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in the last week
            description: `${severity} ${type} threat detected from ${source.country}`,
            ip: this.generateRandomIP(),
            latitude: coordinates[0],
            longitude: coordinates[1],
            indicators: this.generateRandomIndicators(type),
            relatedEvents: []
          });
        }
      });

      // Link related events
      this.threatEvents.forEach(event => {
        // Randomly link some events as related
        const relatedCount = Math.floor(Math.random() * 3);
        for (let i = 0; i < relatedCount; i++) {
          const randomEvent = this.threatEvents[Math.floor(Math.random() * this.threatEvents.length)];
          if (randomEvent.id !== event.id && !event.relatedEvents?.includes(randomEvent.id)) {
            event.relatedEvents?.push(randomEvent.id);
          }
        }
      });

      this.totalThreats = this.threatSources.reduce((sum, source) => sum + source.count, 0);
      this.loading = false;

      // Update map with new data
      if (this.map) {
        this.updateMap();
      }
    }, 1000); // Simulate API delay
  }

  // Generate random severity
  private getRandomSeverity(): 'critical' | 'high' | 'medium' | 'low' {
    const rand = Math.random();
    if (rand < 0.1) return 'critical';
    if (rand < 0.3) return 'high';
    if (rand < 0.7) return 'medium';
    return 'low';
  }

  // Get random threat type based on source's threat types
  private getRandomThreatType(threatTypes: { type: string; count: number }[]): string {
    if (threatTypes.length === 0) return 'unknown';

    // Weight by count
    const totalCount = threatTypes.reduce((sum, t) => sum + t.count, 0);
    let rand = Math.random() * totalCount;

    for (const threatType of threatTypes) {
      rand -= threatType.count;
      if (rand <= 0) return threatType.type;
    }

    return threatTypes[0].type;
  }

  // Generate random IP address
  private generateRandomIP(): string {
    return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
  }

  // Generate random indicators based on threat type
  private generateRandomIndicators(threatType: string): string[] {
    const indicators: string[] = [];

    // Add type-specific indicators
    switch (threatType) {
      case 'malware':
        indicators.push(`hash:${this.generateRandomHash()}`);
        indicators.push(`filename:${this.generateRandomFilename()}`);
        break;
      case 'phishing':
        indicators.push(`url:${this.generateRandomURL()}`);
        indicators.push(`subject:${this.generateRandomSubject()}`);
        break;
      case 'ransomware':
        indicators.push(`hash:${this.generateRandomHash()}`);
        indicators.push(`extension:${this.generateRandomExtension()}`);
        break;
      case 'ddos':
        indicators.push(`protocol:${this.generateRandomProtocol()}`);
        indicators.push(`port:${Math.floor(Math.random() * 65535)}`);
        break;
      case 'apt':
        indicators.push(`tool:${this.generateRandomTool()}`);
        indicators.push(`hash:${this.generateRandomHash()}`);
        break;
    }

    // Add common indicators
    indicators.push(`ip:${this.generateRandomIP()}`);

    return indicators;
  }

  // Helper methods for generating random indicators
  private generateRandomHash(): string {
    return Array(32).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  private generateRandomFilename(): string {
    const names = ['setup', 'document', 'invoice', 'update', 'installer'];
    const extensions = ['.exe', '.dll', '.pdf', '.doc', '.zip'];
    return `${names[Math.floor(Math.random() * names.length)]}${extensions[Math.floor(Math.random() * extensions.length)]}`;
  }

  private generateRandomURL(): string {
    const domains = ['malicious-site', 'secure-banking', 'account-verify', 'login-confirm', 'document-share'];
    const tlds = ['.com', '.net', '.org', '.info', '.xyz'];
    return `http://${domains[Math.floor(Math.random() * domains.length)]}${tlds[Math.floor(Math.random() * tlds.length)]}`;
  }

  private generateRandomSubject(): string {
    const subjects = [
      'Your account has been locked',
      'Urgent: Security alert',
      'Document shared with you',
      'Invoice payment required',
      'Password reset request'
    ];
    return subjects[Math.floor(Math.random() * subjects.length)];
  }

  private generateRandomExtension(): string {
    return ['.encrypted', '.locked', '.ransom', '.crypt', '.pay'][Math.floor(Math.random() * 5)];
  }

  private generateRandomProtocol(): string {
    return ['TCP', 'UDP', 'ICMP', 'HTTP', 'DNS'][Math.floor(Math.random() * 5)];
  }

  private generateRandomTool(): string {
    return ['Cobalt Strike', 'Mimikatz', 'Empire', 'Metasploit', 'PoisonIvy'][Math.floor(Math.random() * 5)];
  }

  // Initialize Leaflet map
  private initMap(): void {
    // Create map
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 8,
      zoomControl: false,
      attributionControl: false
    });

    // Add dark theme tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(this.map);

    // Add zoom control to top-right
    L.control.zoom({
      position: 'topright'
    }).addTo(this.map);

    // Add scale control
    L.control.scale({
      position: 'bottomleft',
      imperial: false
    }).addTo(this.map);

    // Create marker layer group
    this.markerLayer = L.layerGroup().addTo(this.map);

    // Add map click handler for closing drill-down
    this.map.on('click', () => {
      if (this.showDrillDown) {
        this.closeDrillDown();
      }
    });

    // Load GeoJSON data
    this.loadGeoJson();
  }

  // Load GeoJSON data
  private async loadGeoJson(): Promise<void> {
    try {
      // In a real application, you would load a GeoJSON file
      // For demo purposes, we'll use a simplified approach

      // Create a simple GeoJSON layer
      this.geoJsonLayer = L.geoJSON(undefined, {
        style: (feature) => this.getCountryStyle(feature),
        onEachFeature: (feature, layer) => {
          const countryCode = feature.properties.iso_a3;
          const threatSource = this.threatSources.find(source => source.code === countryCode);

          if (threatSource) {
            // Add tooltip
            layer.bindTooltip(`
              <div class="map-tooltip">
                <div class="tooltip-country">${threatSource.country}</div>
                <div class="tooltip-count">${threatSource.count} menaces</div>
                <div class="tooltip-percentage">${threatSource.percentage}% du total</div>
                <div class="tooltip-risk">Risque: ${threatSource.riskScore}/100</div>
              </div>
            `, {
              direction: 'top',
              className: 'custom-tooltip'
            });

            // Add click handler for drill-down
            layer.on('click', (e) => {
              // Stop propagation to prevent map click handler from firing
              L.DomEvent.stopPropagation(e);

              this.showThreatSourceDetails(threatSource);
            });
          }
        }
      }).addTo(this.map);

      // Add threat markers
      this.addThreatMarkers();

      // Add heat map if enabled
      if (this.showHeatmap) {
        this.addHeatMap();
      }
    } catch (error) {
      console.error('Error loading GeoJSON:', error);
    }
  }

  // Get country style based on filters and options
  private getCountryStyle(feature: any): L.PathOptions {
    if (!feature || !feature.properties) {
      return {
        fillColor: 'transparent',
        weight: 1,
        opacity: 0.5,
        color: 'rgba(255, 255, 255, 0.2)',
        fillOpacity: 0
      };
    }

    const countryCode = feature.properties.iso_a3;
    const threatSource = this.threatSources.find(source => source.code === countryCode);

    // If country is not a threat source or doesn't match filters, make it transparent
    if (!threatSource || threatSource.visible === false) {
      return {
        fillColor: 'transparent',
        weight: 1,
        opacity: 0.3,
        color: 'rgba(255, 255, 255, 0.1)',
        fillOpacity: 0
      };
    }

    // Apply filters
    if (this.selectedThreatType !== 'all') {
      const hasType = threatSource.threatTypes?.some(t => t.type === this.selectedThreatType);
      if (!hasType) {
        return {
          fillColor: 'transparent',
          weight: 1,
          opacity: 0.3,
          color: 'rgba(255, 255, 255, 0.1)',
          fillOpacity: 0
        };
      }
    }

    // Country matches all filters, show it with appropriate style
    return {
      fillColor: threatSource.color,
      weight: 1,
      opacity: 0.7,
      color: 'rgba(255, 255, 255, 0.3)',
      fillOpacity: this.showCountryHighlight ? 0.7 : 0.3
    };
  }

  // Add threat markers to the map
  private addThreatMarkers(): void {
    // Clear existing markers
    this.markerLayer.clearLayers();

    // Skip if markers are disabled
    if (!this.showMarkers) {
      return;
    }

    // Filter events based on selected filters
    const filteredEvents = this.filterThreatEvents();

    // Define marker icons for different severities
    const markerIcons = {
      critical: L.divIcon({
        html: '<div class="threat-marker critical"></div>',
        className: 'threat-marker-container',
        iconSize: [12, 12]
      }),
      high: L.divIcon({
        html: '<div class="threat-marker high"></div>',
        className: 'threat-marker-container',
        iconSize: [10, 10]
      }),
      medium: L.divIcon({
        html: '<div class="threat-marker medium"></div>',
        className: 'threat-marker-container',
        iconSize: [8, 8]
      }),
      low: L.divIcon({
        html: '<div class="threat-marker low"></div>',
        className: 'threat-marker-container',
        iconSize: [6, 6]
      })
    };

    // Add markers for each threat event
    filteredEvents.forEach(event => {
      const marker = L.marker([event.latitude, event.longitude], {
        icon: markerIcons[event.severity]
      });

      // Add tooltip
      marker.bindTooltip(`
        <div class="event-tooltip">
          <div class="event-severity ${event.severity}">${event.severity.toUpperCase()}</div>
          <div class="event-type">${event.type}</div>
          <div class="event-description">${event.description}</div>
          <div class="event-time">${event.timestamp.toLocaleString()}</div>
        </div>
      `, {
        direction: 'top',
        className: 'event-tooltip'
      });

      // Add click handler for drill-down
      marker.on('click', () => {
        this.showThreatEventDetails(event);
      });

      // Add to marker layer
      marker.addTo(this.markerLayer);
    });
  }

  // Add heat map layer
  private addHeatMap(): void {
    // Skip if heatmap.js is not available
    if (!L.heatLayer) {
      console.warn('Leaflet.heat plugin not available');
      return;
    }

    // Filter events based on selected filters
    const filteredEvents = this.filterThreatEvents();

    // Convert events to heat map points
    const heatPoints: [number, number, number][] = filteredEvents.map(event => {
      // Weight by severity
      let intensity = 0.3; // Default for low
      if (event.severity === 'medium') intensity = 0.5;
      if (event.severity === 'high') intensity = 0.8;
      if (event.severity === 'critical') intensity = 1.0;

      return [event.latitude, event.longitude, intensity];
    });

    // Create heat layer
    if (this.heatLayer) {
      this.map.removeLayer(this.heatLayer);
    }

    this.heatLayer = L.heatLayer(heatPoints, {
      radius: 25,
      blur: 15,
      maxZoom: 10,
      gradient: {
        0.2: 'blue',
        0.4: 'lime',
        0.6: 'yellow',
        0.8: 'orange',
        1.0: 'red'
      }
    }).addTo(this.map);
  }

  // Filter threat events based on selected filters
  private filterThreatEvents(): ThreatEvent[] {
    return this.threatEvents.filter(event => {
      // Filter by severity
      if (this.selectedSeverity !== 'all' && event.severity !== this.selectedSeverity) {
        return false;
      }

      // Filter by threat type
      if (this.selectedThreatType !== 'all' && event.type !== this.selectedThreatType) {
        return false;
      }

      // Filter by time range
      const now = Date.now();
      let timeRangeMs = 0;

      switch (this.selectedTimeRange) {
        case '24h':
          timeRangeMs = 24 * 60 * 60 * 1000;
          break;
        case '7d':
          timeRangeMs = 7 * 24 * 60 * 60 * 1000;
          break;
        case '30d':
          timeRangeMs = 30 * 24 * 60 * 60 * 1000;
          break;
        case '90d':
          timeRangeMs = 90 * 24 * 60 * 60 * 1000;
          break;
      }

      if (now - event.timestamp.getTime() > timeRangeMs) {
        return false;
      }

      // Event passed all filters
      return true;
    });
  }

  // Update map with new data
  private updateMap(): void {
    // In a real application, you would update the map with new data
    // For demo purposes, we'll just reload the GeoJSON
    if (this.geoJsonLayer) {
      this.map.removeLayer(this.geoJsonLayer);
    }

    // Clear marker layer
    if (this.markerLayer) {
      this.markerLayer.clearLayers();
    }

    // Remove heat layer if it exists
    if (this.heatLayer) {
      this.map.removeLayer(this.heatLayer);
    }

    this.loadGeoJson();
  }

  // Apply filters and update map
  public applyFilters(): void {
    this.updateMap();
  }

  // Toggle view options
  public toggleViewOption(option: 'heatmap' | 'markers' | 'countries'): void {
    switch (option) {
      case 'heatmap':
        this.showHeatmap = !this.showHeatmap;
        if (this.showHeatmap) {
          this.addHeatMap();
        } else if (this.heatLayer) {
          this.map.removeLayer(this.heatLayer);
        }
        break;
      case 'markers':
        this.showMarkers = !this.showMarkers;
        if (this.showMarkers) {
          this.addThreatMarkers();
        } else {
          this.markerLayer.clearLayers();
        }
        break;
      case 'countries':
        this.showCountryHighlight = !this.showCountryHighlight;
        this.updateMap();
        break;
    }
  }

  // Show threat source details in drill-down view
  public showThreatSourceDetails(source: ThreatSource): void {
    this.selectedThreatSource = source;
    this.selectedThreatEvent = null;

    // Create drill-down data
    const drillDownData: DrillDownData = {
      title: `Menaces depuis ${source.country}`,
      subtitle: `Analyse des activités malveillantes`,
      type: 'threat',
      id: source.code,
      summary: {
        count: {
          label: 'Nombre de menaces',
          value: source.count,
          icon: 'security',
          color: source.color
        },
        percentage: {
          label: 'Pourcentage du total',
          value: `${source.percentage}%`,
          icon: 'pie_chart',
          color: '#70a1ff'
        },
        riskScore: {
          label: 'Score de risque',
          value: source.riskScore || 0,
          icon: 'assessment',
          color: '#ff6b6b',
          trend: source.trend
        }
      },
      details: {
        'Informations générales': {
          'Pays': source.country,
          'Code': source.code,
          'Coordonnées': source.coordinates ? `${source.coordinates[0]}, ${source.coordinates[1]}` : 'N/A'
        },
        'Types de menaces': source.threatTypes?.reduce((acc, type) => {
          acc[type.type] = type.count;
          return acc;
        }, {} as Record<string, number>) || {}
      },
      timeline: source.recentActivity?.map(activity => ({
        date: activity.date,
        event: activity.description,
        icon: 'warning',
        color: source.color
      })) || [],
      charts: [
        {
          id: 'threatTypes',
          title: 'Distribution des types de menaces',
          type: 'pie',
          data: source.threatTypes || []
        },
        {
          id: 'threatTrend',
          title: 'Tendance des menaces',
          type: 'line',
          data: [] // Would be populated with real data in a production app
        }
      ],
      tables: [
        {
          id: 'recentEvents',
          title: 'Événements récents',
          columns: [
            { key: 'timestamp', header: 'Date' },
            { key: 'type', header: 'Type' },
            { key: 'severity', header: 'Sévérité' },
            { key: 'description', header: 'Description' }
          ],
          data: this.threatEvents
            .filter(event => event.countryCode === source.code)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        }
      ],
      actions: [
        {
          label: 'Analyser en détail',
          icon: 'analytics',
          action: 'analyze',
          color: 'primary'
        },
        {
          label: 'Ajouter à la surveillance',
          icon: 'visibility',
          action: 'monitor',
          color: 'accent'
        }
      ]
    };

    this.drillDownData = drillDownData;
    this.showDrillDown = true;
  }

  // Show threat event details in drill-down view
  private showThreatEventDetails(event: ThreatEvent): void {
    this.selectedThreatEvent = event;
    this.selectedThreatSource = null;

    // Get related events
    const relatedEvents = event.relatedEvents?.map(id =>
      this.threatEvents.find(e => e.id === id)
    ).filter(Boolean) as ThreatEvent[];

    // Create drill-down data
    const drillDownData: DrillDownData = {
      title: `${event.severity.toUpperCase()} ${event.type} Threat`,
      subtitle: `Détecté depuis ${event.country}`,
      type: 'incident',
      id: event.id,
      summary: {
        severity: {
          label: 'Sévérité',
          value: event.severity.toUpperCase(),
          icon: 'warning',
          color: this.getSeverityColor(event.severity)
        },
        type: {
          label: 'Type',
          value: event.type,
          icon: 'category',
          color: '#70a1ff'
        },
        time: {
          label: 'Détecté',
          value: this.getTimeAgo(event.timestamp),
          icon: 'access_time',
          color: '#1dd1a1'
        }
      },
      details: {
        'Informations générales': {
          'ID': event.id,
          'Pays': event.country,
          'IP': event.ip || 'N/A',
          'Coordonnées': `${event.latitude}, ${event.longitude}`,
          'Horodatage': event.timestamp.toLocaleString()
        },
        'Indicateurs': event.indicators?.reduce((acc, indicator) => {
          const [key, value] = indicator.split(':');
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>) || {}
      },
      relatedItems: relatedEvents.map(relEvent => ({
        id: relEvent.id,
        title: `${relEvent.severity.toUpperCase()} ${relEvent.type}`,
        description: relEvent.description,
        icon: 'link',
        color: this.getSeverityColor(relEvent.severity),
        meta: {
          'Sévérité': relEvent.severity.toUpperCase(),
          'Détecté': this.getTimeAgo(relEvent.timestamp)
        }
      })),
      actions: [
        {
          label: 'Investiguer',
          icon: 'search',
          action: 'investigate',
          color: 'primary'
        },
        {
          label: 'Bloquer IP',
          icon: 'block',
          action: 'block',
          color: 'warn'
        }
      ]
    };

    this.drillDownData = drillDownData;
    this.showDrillDown = true;
  }

  // Close drill-down view
  public closeDrillDown(): void {
    this.showDrillDown = false;
    this.drillDownData = null;
    this.selectedThreatSource = null;
    this.selectedThreatEvent = null;
  }

  // Handle drill-down actions
  public onDrillDownAction(event: { action: string; data: any }): void {
    console.log('Drill-down action:', event.action, event.data);

    // In a real application, you would handle the action
    // For demo purposes, we'll just log it

    // Close the drill-down after action
    this.closeDrillDown();
  }

  // Get severity color
  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return '#ff4757';
      case 'high': return '#ff6b6b';
      case 'medium': return '#ffa502';
      case 'low': return '#1dd1a1';
      default: return '#70a1ff';
    }
  }

  // Get time ago string
  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    if (diffSec < 60) return `${diffSec} secondes`;
    if (diffMin < 60) return `${diffMin} minutes`;
    if (diffHour < 24) return `${diffHour} heures`;
    return `${diffDay} jours`;
  }

  // Toggle country visibility
  public toggleCountry(source: ThreatSource): void {
    // Toggle visibility
    source.visible = source.visible === false ? undefined : false;

    // Update map
    this.updateMap();
  }

  // Get random coordinates for a country (simplified)
  private getRandomCoordinatesForCountry(countryCode: string): [number, number] {
    // In a real application, you would use a more accurate approach
    // For demo purposes, we'll use hardcoded coordinates
    switch (countryCode) {
      case 'USA':
        return [37.0902, -95.7129];
      case 'CHN':
        return [35.8617, 104.1954];
      case 'RUS':
        return [61.5240, 105.3188];
      case 'PRK':
        return [40.3399, 127.5101];
      case 'IRN':
        return [32.4279, 53.6880];
      default:
        return [0, 0];
    }
  }

  // Get random coordinates nearby a point
  private getRandomNearby(lat: number, lng: number, radiusDegrees: number): [number, number] {
    const randomLat = lat + (Math.random() - 0.5) * radiusDegrees;
    const randomLng = lng + (Math.random() - 0.5) * radiusDegrees;
    return [randomLat, randomLng];
  }

  // Refresh data
  public refreshData(): void {
    this.loadData();
    this.updateMap();
  }
}
