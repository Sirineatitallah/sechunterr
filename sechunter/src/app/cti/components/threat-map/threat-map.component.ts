import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VisualizationService } from '../../../shared/services/visualization.service';
import { Subscription } from 'rxjs';
import * as L from 'leaflet';

interface ThreatSource {
  country: string;
  code: string;
  count: number;
  percentage: number;
  color: string;
  visible?: boolean;
}

@Component({
  selector: 'app-threat-map',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './threat-map.component.html',
  styleUrls: ['./threat-map.component.scss']
})
export class ThreatMapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  // Leaflet map
  private map!: L.Map;
  private geoJsonLayer!: L.GeoJSON;

  // Threat data
  threatSources: ThreatSource[] = [];
  totalThreats = 0;

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
    // In a real application, this would fetch data from an API
    // For demo purposes, we'll use mock data
    this.threatSources = [
      { country: 'United States', code: 'USA', count: 450, percentage: 45, color: '#ff4757' },
      { country: 'China', code: 'CHN', count: 300, percentage: 30, color: '#ffa502' },
      { country: 'Russia', code: 'RUS', count: 250, percentage: 25, color: '#ffdb58' },
      { country: 'North Korea', code: 'PRK', count: 120, percentage: 12, color: '#2ed573' },
      { country: 'Iran', code: 'IRN', count: 80, percentage: 8, color: '#70a1ff' }
    ];

    this.totalThreats = this.threatSources.reduce((sum, source) => sum + source.count, 0);
  }

  // Initialize Leaflet map
  private initMap(): void {
    // Create map
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 6,
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
        style: (feature) => {
          const countryCode = feature?.properties?.iso_a3;
          const threatSource = this.threatSources.find(source => source.code === countryCode);

          return {
            fillColor: threatSource ? threatSource.color : 'transparent',
            weight: 1,
            opacity: 0.5,
            color: 'rgba(255, 255, 255, 0.2)',
            fillOpacity: threatSource ? 0.7 : 0
          };
        },
        onEachFeature: (feature, layer) => {
          const countryCode = feature.properties.iso_a3;
          const threatSource = this.threatSources.find(source => source.code === countryCode);

          if (threatSource) {
            layer.bindTooltip(`
              <div class="map-tooltip">
                <div class="tooltip-country">${threatSource.country}</div>
                <div class="tooltip-count">${threatSource.count} menaces</div>
                <div class="tooltip-percentage">${threatSource.percentage}% du total</div>
              </div>
            `, {
              direction: 'top',
              className: 'custom-tooltip'
            });
          }
        }
      }).addTo(this.map);

      // Add threat markers
      this.addThreatMarkers();
    } catch (error) {
      console.error('Error loading GeoJSON:', error);
    }
  }

  // Add threat markers to the map
  private addThreatMarkers(): void {
    // In a real application, you would add markers based on actual threat data
    // For demo purposes, we'll add some random markers

    // Define marker icon
    const threatIcon = L.divIcon({
      html: '<div class="threat-marker"></div>',
      className: 'threat-marker-container',
      iconSize: [10, 10]
    });

    // Add markers for each threat source
    this.threatSources.forEach(source => {
      // Get random coordinates for the country
      const coordinates = this.getRandomCoordinatesForCountry(source.code);

      // Add markers
      for (let i = 0; i < Math.min(source.count / 50, 5); i++) {
        const markerCoords = this.getRandomNearby(coordinates[0], coordinates[1], 5);

        L.marker([markerCoords[0], markerCoords[1]], {
          icon: threatIcon
        }).addTo(this.map);
      }
    });
  }

  // Update map with new data
  private updateMap(): void {
    // In a real application, you would update the map with new data
    // For demo purposes, we'll just refresh the page
    if (this.map) {
      this.map.remove();
      setTimeout(() => {
        this.initMap();
      }, 100);
    }
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
  refreshData(): void {
    this.loadData();
    this.updateMap();
  }

  // Toggle country visibility
  toggleCountry(country: ThreatSource): void {
    country.visible = !country.visible;
    this.updateMap();
  }
}
