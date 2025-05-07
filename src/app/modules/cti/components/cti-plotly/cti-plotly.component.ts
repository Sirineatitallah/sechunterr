import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription } from 'rxjs';
import { Router, RouterModule } from '@angular/router';

// Import existing CTI components
import { ThreatMapComponent } from '../../../../cti/components/threat-map/threat-map.component';
import { MitreHeatmapComponent } from '../../../../cti/components/mitre-heatmap/mitre-heatmap.component';
import { ThreatEvolutionComponent } from '../../../../cti/components/threat-evolution/threat-evolution.component';

declare var Plotly: any;

@Component({
  selector: 'app-cti-plotly',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    ThreatMapComponent,
    MitreHeatmapComponent,
    ThreatEvolutionComponent
  ],
  templateUrl: './cti-plotly.component.html',
  styleUrls: ['./cti-plotly.component.scss']
})
export class CtiPlotlyComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('communityDetectionContainer') communityDetectionContainer!: ElementRef;
  @ViewChild('pageRankContainer') pageRankContainer!: ElementRef;
  @ViewChild('nodeSimilarityContainer') nodeSimilarityContainer!: ElementRef;
  @ViewChild('osintTreemapContainer') osintTreemapContainer!: ElementRef;
  @ViewChild('emergingThreatsContainer') emergingThreatsContainer!: ElementRef;
  @ViewChild('anomaliesContainer') anomaliesContainer!: ElementRef;
  @ViewChild('eventTimelineContainer') eventTimelineContainer!: ElementRef;

  private subscriptions: Subscription[] = [];
  isLoading = true;

  constructor(private router: Router) { }

  ngOnInit(): void {
    console.log('CTI Plotly component initialized');
    // Load Plotly.js dynamically
    this.loadPlotlyScript().then(() => {
      console.log('Plotly script loaded successfully');
      this.isLoading = false;
    }).catch(error => {
      console.error('Error loading Plotly script:', error);
    });
  }

  ngAfterViewInit(): void {
    console.log('CTI Plotly component after view init');
    // Wait for Plotly to load
    this.loadPlotlyScript().then(() => {
      console.log('Plotly script loaded in ngAfterViewInit');
      // Render all charts
      setTimeout(() => {
        console.log('Rendering charts...');
        try {
          this.renderCommunityDetection();
          this.renderPageRank();
          this.renderNodeSimilarity();
          this.renderOsintTreemap();
          this.renderEmergingThreats();
          this.renderAnomalies();
          this.renderEventTimeline();
          console.log('All charts rendered successfully');
        } catch (error) {
          console.error('Error rendering charts:', error);
        }
      }, 500); // Increased timeout to ensure DOM is ready
    }).catch(error => {
      console.error('Error loading Plotly script in ngAfterViewInit:', error);
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Navigate to dashboard
  navigateToDashboard(): void {
    console.log('Navigating to dashboard...');
    this.router.navigate(['/dashboard']);
  }

  // Load Plotly.js script
  loadPlotlyScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('Loading Plotly script...');
      if (typeof Plotly !== 'undefined') {
        console.log('Plotly already loaded');
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.plot.ly/plotly-2.20.0.min.js';
      script.async = true;
      script.onload = () => {
        console.log('Plotly script loaded successfully');
        resolve();
      };
      script.onerror = (error) => {
        console.error('Error loading Plotly script:', error);
        reject(error);
      };
      document.head.appendChild(script);
      console.log('Plotly script added to document head');
    });
  }

  // Render Community Detection chart
  renderCommunityDetection(): void {
    console.log('Rendering Community Detection chart...');
    if (!this.communityDetectionContainer) {
      console.error('Community Detection container not found');
      return;
    }

    try {
      console.log('Community Detection container found:', this.communityDetectionContainer);

      const data = [{
        x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        y: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
        mode: 'markers',
        type: 'scatter',
        marker: {
          size: [20, 30, 15, 25, 35, 20, 15, 25, 30, 20],
          color: [0, 1, 2, 3, 4, 0, 1, 2, 3, 4],
          colorscale: 'Viridis',
          showscale: true,
          colorbar: {
            title: 'Community'
          }
        },
        text: ['Node 1', 'Node 2', 'Node 3', 'Node 4', 'Node 5', 'Node 6', 'Node 7', 'Node 8', 'Node 9', 'Node 10'],
        hoverinfo: 'text+x+y'
      }];

      const layout = {
        title: 'Community Detection',
        xaxis: { title: 'X Coordinate' },
        yaxis: { title: 'Y Coordinate' },
        hovermode: 'closest',
        margin: { t: 50, b: 50, l: 50, r: 50 },
        plot_bgcolor: 'rgba(240, 240, 240, 0.8)',
        paper_bgcolor: 'rgba(255, 255, 255, 0.8)'
      };

      console.log('Plotting Community Detection chart with data:', data);
      Plotly.newPlot(this.communityDetectionContainer.nativeElement, data, layout);
      console.log('Community Detection chart rendered successfully');
    } catch (error) {
      console.error('Error rendering Community Detection chart:', error);
    }
  }

  // Render PageRank chart
  renderPageRank(): void {
    if (!this.pageRankContainer) return;

    const data = [{
      x: ['Node A', 'Node B', 'Node C', 'Node D', 'Node E', 'Node F', 'Node G', 'Node H'],
      y: [0.25, 0.18, 0.15, 0.12, 0.10, 0.08, 0.07, 0.05],
      type: 'bar',
      marker: {
        color: 'rgba(50, 171, 96, 0.7)',
        line: {
          color: 'rgba(50, 171, 96, 1.0)',
          width: 2
        }
      }
    }];

    const layout = {
      title: 'PageRank / Betweenness Centrality',
      xaxis: { title: 'Node' },
      yaxis: { title: 'Centrality Score' },
      margin: { t: 50, b: 50, l: 50, r: 50 },
      plot_bgcolor: 'rgba(240, 240, 240, 0.8)',
      paper_bgcolor: 'rgba(255, 255, 255, 0.8)'
    };

    Plotly.newPlot(this.pageRankContainer.nativeElement, data, layout);
  }

  // Additional chart rendering methods
  renderNodeSimilarity(): void {
    if (!this.nodeSimilarityContainer) return;

    // Generate random data for the heatmap
    const z = [];
    const nodes = ['Node A', 'Node B', 'Node C', 'Node D', 'Node E', 'Node F', 'Node G', 'Node H'];

    for (let i = 0; i < nodes.length; i++) {
      const row = [];
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) {
          row.push(1); // Perfect similarity with self
        } else {
          row.push(Math.random().toFixed(2)); // Random similarity between 0 and 1
        }
      }
      z.push(row);
    }

    const data = [{
      z: z,
      x: nodes,
      y: nodes,
      type: 'heatmap',
      colorscale: 'Viridis',
      showscale: true,
      colorbar: {
        title: 'Similarity'
      }
    }];

    const layout = {
      title: 'Node Similarity',
      margin: { t: 50, b: 80, l: 80, r: 50 },
      plot_bgcolor: 'rgba(240, 240, 240, 0.8)',
      paper_bgcolor: 'rgba(255, 255, 255, 0.8)'
    };

    Plotly.newPlot(this.nodeSimilarityContainer.nativeElement, data, layout);
  }

  renderOsintTreemap(): void {
    if (!this.osintTreemapContainer) return;

    const data = [{
      type: 'treemap',
      labels: ['OSINT', 'Social Media', 'Twitter', 'Facebook', 'Forums', 'Dark Web', 'Paste Sites', 'News', 'Blogs', 'Technical', 'CVE', 'Exploits'],
      parents: ['', 'OSINT', 'Social Media', 'Social Media', 'OSINT', 'OSINT', 'OSINT', 'OSINT', 'OSINT', 'OSINT', 'Technical', 'Technical'],
      values: [100, 30, 20, 10, 15, 20, 10, 15, 5, 5, 3, 2],
      textinfo: 'label+value+percent',
      marker: {
        colorscale: 'Viridis'
      }
    }];

    const layout = {
      title: 'OSINT Sources Treemap',
      margin: { t: 50, b: 50, l: 50, r: 50 },
      plot_bgcolor: 'rgba(240, 240, 240, 0.8)',
      paper_bgcolor: 'rgba(255, 255, 255, 0.8)'
    };

    Plotly.newPlot(this.osintTreemapContainer.nativeElement, data, layout);
  }

  renderEmergingThreats(): void {
    if (!this.emergingThreatsContainer) return;

    const data = [{
      x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      y: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
      mode: 'markers',
      type: 'scatter',
      marker: {
        size: [20, 30, 15, 25, 35, 20, 15, 25, 30, 20],
        color: [0.2, 0.4, 0.6, 0.8, 1.0, 0.3, 0.5, 0.7, 0.9, 0.1],
        colorscale: 'Reds',
        showscale: true,
        colorbar: {
          title: 'Severity'
        }
      },
      text: ['Threat 1', 'Threat 2', 'Threat 3', 'Threat 4', 'Threat 5', 'Threat 6', 'Threat 7', 'Threat 8', 'Threat 9', 'Threat 10'],
      hoverinfo: 'text+x+y'
    }];

    const layout = {
      title: 'Emerging Threats',
      xaxis: { title: 'Prevalence' },
      yaxis: { title: 'Impact' },
      hovermode: 'closest',
      margin: { t: 50, b: 50, l: 50, r: 50 },
      plot_bgcolor: 'rgba(240, 240, 240, 0.8)',
      paper_bgcolor: 'rgba(255, 255, 255, 0.8)'
    };

    Plotly.newPlot(this.emergingThreatsContainer.nativeElement, data, layout);
  }

  renderAnomalies(): void {
    if (!this.anomaliesContainer) return;

    // Generate random data for anomaly detection
    const x = Array.from({length: 100}, (_, i) => i);
    const y = x.map(i => 50 + 20 * Math.sin(i / 10) + Math.random() * 10);

    // Add some anomalies
    y[20] = 120;
    y[50] = 130;
    y[80] = 20;

    const data = [{
      x: x,
      y: y,
      mode: 'lines+markers',
      type: 'scatter',
      line: {
        color: 'blue',
        width: 2
      },
      marker: {
        size: 6,
        color: y.map(val => val > 100 || val < 30 ? 'red' : 'blue')
      }
    }];

    const layout = {
      title: 'Anomalies in IOC',
      xaxis: { title: 'Time' },
      yaxis: { title: 'Value' },
      margin: { t: 50, b: 50, l: 50, r: 50 },
      plot_bgcolor: 'rgba(240, 240, 240, 0.8)',
      paper_bgcolor: 'rgba(255, 255, 255, 0.8)'
    };

    Plotly.newPlot(this.anomaliesContainer.nativeElement, data, layout);
  }

  renderEventTimeline(): void {
    if (!this.eventTimelineContainer) return;

    const data = [{
      x: ['2023-01-01', '2023-01-15', '2023-02-01', '2023-02-15', '2023-03-01', '2023-03-15', '2023-04-01'],
      y: ['Event 1', 'Event 2', 'Event 3', 'Event 4', 'Event 5', 'Event 6', 'Event 7'],
      mode: 'markers',
      type: 'scatter',
      marker: {
        size: 16,
        color: ['#FF9800', '#F44336', '#9C27B0', '#2196F3', '#4CAF50', '#F44336', '#FF9800'],
        symbol: 'circle'
      },
      text: [
        'Initial Reconnaissance',
        'Phishing Campaign',
        'Initial Access',
        'Lateral Movement',
        'Data Exfiltration',
        'Backdoor Installation',
        'Cleanup Activity'
      ],
      hoverinfo: 'text+x'
    }];

    const layout = {
      title: 'Event Timeline',
      xaxis: {
        title: 'Date',
        type: 'date'
      },
      yaxis: {
        title: 'Event',
        autorange: 'reversed'
      },
      margin: { t: 50, b: 50, l: 100, r: 50 },
      plot_bgcolor: 'rgba(240, 240, 240, 0.8)',
      paper_bgcolor: 'rgba(255, 255, 255, 0.8)'
    };

    Plotly.newPlot(this.eventTimelineContainer.nativeElement, data, layout);
  }
}
