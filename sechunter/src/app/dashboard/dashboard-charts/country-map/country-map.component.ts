import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-country-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './country-map.component.html',
  styleUrl: './country-map.component.css'
})
export class CountryMapComponent implements OnInit, AfterViewInit {
  private map: L.Map | null = null;

  // Sample data for countries
  countryData = [
    { name: 'United States', value: 85, lat: 37.0902, lng: -95.7129, color: '#FFC107' },
    { name: 'Brazil', value: 65, lat: -14.235, lng: -51.9253, color: '#F44336' },
    { name: 'China', value: 78, lat: 35.8617, lng: 104.1954, color: '#9C27B0' },
    { name: 'India', value: 72, lat: 20.5937, lng: 78.9629, color: '#673AB7' },
    { name: 'Indonesia', value: 58, lat: -0.7893, lng: 113.9213, color: '#009688' },
    { name: 'Russia', value: 45, lat: 61.5240, lng: 105.3188, color: '#3F51B5' },
    { name: 'France', value: 62, lat: 46.2276, lng: 2.2137, color: '#2196F3' }
  ];

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    // Create map
    this.map = L.map('map', {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 6,
      zoomControl: false,
      attributionControl: false
    });

    // Add dark theme tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(this.map);

    // Add markers for each country
    this.countryData.forEach(country => {
      const marker = L.circleMarker([country.lat, country.lng], {
        radius: this.getRadius(country.value),
        fillColor: country.color,
        color: country.color,
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7
      }).addTo(this.map!);

      // Add popup
      marker.bindPopup(`
        <div class="country-popup">
          <h3>${country.name}</h3>
          <p>Value: ${country.value}</p>
        </div>
      `);

      // Add hover effect
      marker.on('mouseover', (e) => {
        marker.openPopup();
        marker.setStyle({ fillOpacity: 0.9, weight: 2 });
      });

      marker.on('mouseout', (e) => {
        marker.closePopup();
        marker.setStyle({ fillOpacity: 0.7, weight: 1 });
      });
    });
  }

  // Calculate radius based on value
  private getRadius(value: number): number {
    return (value / 10) + 5; // Scale the radius based on value
  }
}
