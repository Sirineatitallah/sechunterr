import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

// Import Plotly
declare var Plotly: any;

@Component({
  selector: 'app-cti-plotly-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './cti-plotly-dashboard.component.html',
  styleUrls: ['./cti-plotly-dashboard.component.scss']
})
export class CtiPlotlyDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  // ViewChild references for chart containers
  @ViewChild('threatOverviewChart') threatOverviewChart!: ElementRef;
  @ViewChild('mitreHeatmapChart') mitreHeatmapChart!: ElementRef;
  @ViewChild('communityDetectionChart') communityDetectionChart!: ElementRef;
  @ViewChild('pageRankChart') pageRankChart!: ElementRef;
  @ViewChild('betweennessChart') betweennessChart!: ElementRef;
  @ViewChild('nodeSimilarityChart') nodeSimilarityChart!: ElementRef;
  @ViewChild('threatTrendsChart') threatTrendsChart!: ElementRef;
  @ViewChild('osintTreemapChart') osintTreemapChart!: ElementRef;
  @ViewChild('emergingThreatsChart') emergingThreatsChart!: ElementRef;
  @ViewChild('anomaliesChart') anomaliesChart!: ElementRef;
  @ViewChild('eventTimelineChart') eventTimelineChart!: ElementRef;
  @ViewChild('attackOriginsChart') attackOriginsChart!: ElementRef;

  // Loading states
  loading = true;
  plotlyLoaded = false;

  constructor() { }

  ngOnInit(): void {
    this.loadPlotlyScript();
  }

  ngAfterViewInit(): void {
    // Wait for Plotly to load before creating charts
    this.checkPlotlyAndRender();
  }

  ngOnDestroy(): void {
    // Clean up any resources if needed
  }

  // Load Plotly.js script
  loadPlotlyScript(): void {
    if (typeof Plotly !== 'undefined') {
      this.plotlyLoaded = true;
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.plot.ly/plotly-2.24.1.min.js';
    script.async = true;
    script.onload = () => {
      console.log('Plotly loaded successfully');
      this.plotlyLoaded = true;
      this.checkPlotlyAndRender();
    };
    script.onerror = (error) => {
      console.error('Error loading Plotly:', error);
    };
    document.head.appendChild(script);
  }

  // Check if Plotly is loaded and render charts
  checkPlotlyAndRender(): void {
    if (this.plotlyLoaded && typeof Plotly !== 'undefined') {
      setTimeout(() => {
        this.renderAllCharts();
        this.loading = false;
      }, 500);
    }
  }

  // Render all charts
  renderAllCharts(): void {
    this.renderThreatOverview();
    this.renderMitreHeatmap();
    this.renderCommunityDetection();
    this.renderPageRankCentrality();
    this.renderBetweennessCentrality();
    this.renderNodeSimilarity();
    this.renderThreatTrends();
    this.renderOsintTreemap();
    this.renderEmergingThreats();
    this.renderAnomaliesIOC();
    this.renderEventTimeline();
    this.renderAttackOrigins();
  }

  // Refresh all charts
  refreshData(): void {
    this.loading = true;
    setTimeout(() => {
      this.renderAllCharts();
      this.loading = false;
    }, 1000);
  }

  // Individual chart rendering methods
  renderThreatOverview(): void {
    if (!this.threatOverviewChart) return;

    const data = [{
      x: ['Phishing', 'Malware', 'Ransomware', 'DDoS', 'Zero-day', 'Supply Chain'],
      y: [65, 42, 37, 28, 15, 23],
      type: 'bar',
      marker: {
        color: ['rgba(58, 134, 255, 0.8)', 'rgba(252, 119, 83, 0.8)', 'rgba(217, 4, 41, 0.8)',
                'rgba(6, 214, 160, 0.8)', 'rgba(255, 209, 102, 0.8)', 'rgba(17, 138, 178, 0.8)']
      }
    }];

    const layout = {
      title: 'Threat Overview',
      font: { color: '#e1e1e6' },
      paper_bgcolor: 'rgba(26, 27, 38, 0.8)',
      plot_bgcolor: 'rgba(26, 27, 38, 0.8)',
      xaxis: { title: 'Threat Type', gridcolor: 'rgba(255, 255, 255, 0.1)' },
      yaxis: { title: 'Count', gridcolor: 'rgba(255, 255, 255, 0.1)' },
      margin: { l: 50, r: 20, t: 50, b: 50 }
    };

    Plotly.newPlot(this.threatOverviewChart.nativeElement, data, layout, { responsive: true });
  }

  renderMitreHeatmap(): void {
    if (!this.mitreHeatmapChart) return;

    // Generate random data for MITRE heatmap
    const x = [];
    const y = [];
    const z = [];
    const size = [];
    const color = [];

    // Generate random data points
    for (let i = 0; i < 50; i++) {
      x.push(Math.random());
      y.push(Math.random());
      const usageCount = Math.floor(Math.random() * 100);
      z.push(usageCount);
      size.push(usageCount * 0.5);
      color.push(usageCount);
    }

    const data = [{
      x: x,
      y: y,
      mode: 'markers',
      type: 'scatter',
      marker: {
        size: size,
        color: color,
        colorscale: 'YlOrRd',
        showscale: true,
        colorbar: {
          title: 'Usage Count',
          titleside: 'right',
          titlefont: {
            color: '#e1e1e6'
          },
          tickfont: {
            color: '#e1e1e6'
          }
        }
      },
      text: z.map(val => `Usage Count: ${val}`),
      hoverinfo: 'text'
    }];

    const layout = {
      title: 'MITRE Heatmap',
      font: { color: '#e1e1e6' },
      paper_bgcolor: 'rgba(26, 27, 38, 0.8)',
      plot_bgcolor: 'rgba(26, 27, 38, 0.8)',
      xaxis: { title: 'Technique Complexity', gridcolor: 'rgba(255, 255, 255, 0.1)' },
      yaxis: { title: 'Impact Severity', gridcolor: 'rgba(255, 255, 255, 0.1)' },
      margin: { l: 50, r: 50, t: 50, b: 50 }
    };

    Plotly.newPlot(this.mitreHeatmapChart.nativeElement, data, layout, { responsive: true });
  }

  renderCommunityDetection(): void {
    if (!this.communityDetectionChart) return;

    // Generate random data for community detection
    const communities = ['Community A', 'Community B', 'Community C', 'Community D', 'Community E'];
    const colors = ['#3a86ff', '#ff006e', '#8338ec', '#fb5607', '#ffbe0b'];

    const data = [];

    // Create a trace for each community
    for (let i = 0; i < communities.length; i++) {
      const numPoints = Math.floor(Math.random() * 20) + 10;
      const x = [];
      const y = [];

      // Generate cluster of points
      const centerX = Math.random() * 0.8 + 0.1;
      const centerY = Math.random() * 0.8 + 0.1;

      for (let j = 0; j < numPoints; j++) {
        x.push(centerX + (Math.random() - 0.5) * 0.2);
        y.push(centerY + (Math.random() - 0.5) * 0.2);
      }

      data.push({
        x: x,
        y: y,
        mode: 'markers',
        type: 'scatter',
        name: communities[i],
        marker: {
          color: colors[i],
          size: 10,
          line: {
            color: 'white',
            width: 1
          }
        }
      });
    }

    const layout = {
      title: 'Community Detection',
      font: { color: '#e1e1e6' },
      paper_bgcolor: 'rgba(26, 27, 38, 0.8)',
      plot_bgcolor: 'rgba(26, 27, 38, 0.8)',
      xaxis: { title: 'Dimension 1', gridcolor: 'rgba(255, 255, 255, 0.1)' },
      yaxis: { title: 'Dimension 2', gridcolor: 'rgba(255, 255, 255, 0.1)' },
      margin: { l: 50, r: 20, t: 50, b: 50 },
      showlegend: true,
      legend: {
        font: { color: '#e1e1e6' }
      }
    };

    Plotly.newPlot(this.communityDetectionChart.nativeElement, data, layout, { responsive: true });
  }

  renderPageRankCentrality(): void {
    if (!this.pageRankChart) return;

    const data = [{
      x: ['Node A', 'Node B', 'Node C', 'Node D', 'Node E', 'Node F', 'Node G', 'Node H'],
      y: [0.85, 0.67, 0.54, 0.42, 0.36, 0.28, 0.21, 0.15],
      type: 'bar',
      marker: {
        color: 'rgba(58, 134, 255, 0.8)',
        line: {
          color: 'rgba(58, 134, 255, 1.0)',
          width: 1
        }
      }
    }];

    const layout = {
      title: 'PageRank Centrality',
      font: { color: '#e1e1e6' },
      paper_bgcolor: 'rgba(26, 27, 38, 0.8)',
      plot_bgcolor: 'rgba(26, 27, 38, 0.8)',
      xaxis: { title: 'Node', gridcolor: 'rgba(255, 255, 255, 0.1)' },
      yaxis: { title: 'PageRank Score', gridcolor: 'rgba(255, 255, 255, 0.1)' },
      margin: { l: 50, r: 20, t: 50, b: 50 }
    };

    Plotly.newPlot(this.pageRankChart.nativeElement, data, layout, { responsive: true });
  }

  renderBetweennessCentrality(): void {
    if (!this.betweennessChart) return;

    const data = [{
      x: ['Node A', 'Node B', 'Node C', 'Node D', 'Node E', 'Node F', 'Node G', 'Node H'],
      y: [24, 18, 15, 12, 9, 7, 5, 3],
      type: 'bar',
      marker: {
        color: 'rgba(252, 119, 83, 0.8)',
        line: {
          color: 'rgba(252, 119, 83, 1.0)',
          width: 1
        }
      }
    }];

    const layout = {
      title: 'Betweenness Centrality',
      font: { color: '#e1e1e6' },
      paper_bgcolor: 'rgba(26, 27, 38, 0.8)',
      plot_bgcolor: 'rgba(26, 27, 38, 0.8)',
      xaxis: { title: 'Node', gridcolor: 'rgba(255, 255, 255, 0.1)' },
      yaxis: { title: 'Betweenness Score', gridcolor: 'rgba(255, 255, 255, 0.1)' },
      margin: { l: 50, r: 20, t: 50, b: 50 }
    };

    Plotly.newPlot(this.betweennessChart.nativeElement, data, layout, { responsive: true });
  }

  renderNodeSimilarity(): void {
    if (!this.nodeSimilarityChart) return;

    // Generate random data for node similarity
    const x = [];
    const y = [];
    const size = [];
    const color = [];
    const text = [];

    for (let i = 0; i < 40; i++) {
      x.push(Math.random());
      y.push(Math.random());
      const similarity = Math.random();
      size.push(similarity * 30 + 5);
      color.push(similarity);
      text.push(`Node ${i+1}<br>Similarity: ${(similarity * 100).toFixed(1)}%`);
    }

    const data = [{
      x: x,
      y: y,
      mode: 'markers',
      type: 'scatter',
      marker: {
        size: size,
        color: color,
        colorscale: 'Viridis',
        showscale: true,
        colorbar: {
          title: 'Similarity',
          titleside: 'right',
          titlefont: {
            color: '#e1e1e6'
          },
          tickfont: {
            color: '#e1e1e6'
          }
        }
      },
      text: text,
      hoverinfo: 'text'
    }];

    const layout = {
      title: 'Node Similarity',
      font: { color: '#e1e1e6' },
      paper_bgcolor: 'rgba(26, 27, 38, 0.8)',
      plot_bgcolor: 'rgba(26, 27, 38, 0.8)',
      xaxis: { title: 'Feature 1', gridcolor: 'rgba(255, 255, 255, 0.1)' },
      yaxis: { title: 'Feature 2', gridcolor: 'rgba(255, 255, 255, 0.1)' },
      margin: { l: 50, r: 50, t: 50, b: 50 }
    };

    Plotly.newPlot(this.nodeSimilarityChart.nativeElement, data, layout, { responsive: true });
  }

  renderThreatTrends(): void {
    if (!this.threatTrendsChart) return;

    // Generate time series data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const malwareData = months.map(() => Math.floor(Math.random() * 50) + 20);
    const phishingData = months.map(() => Math.floor(Math.random() * 40) + 15);
    const ransomwareData = months.map(() => Math.floor(Math.random() * 30) + 10);

    const data = [
      {
        x: months,
        y: malwareData,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Malware',
        line: {
          color: 'rgba(58, 134, 255, 1)',
          width: 3
        },
        marker: {
          size: 8
        }
      },
      {
        x: months,
        y: phishingData,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Phishing',
        line: {
          color: 'rgba(252, 119, 83, 1)',
          width: 3
        },
        marker: {
          size: 8
        }
      },
      {
        x: months,
        y: ransomwareData,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Ransomware',
        line: {
          color: 'rgba(217, 4, 41, 1)',
          width: 3
        },
        marker: {
          size: 8
        }
      }
    ];

    const layout = {
      title: 'Threat Trends Over Time',
      font: { color: '#e1e1e6' },
      paper_bgcolor: 'rgba(26, 27, 38, 0.8)',
      plot_bgcolor: 'rgba(26, 27, 38, 0.8)',
      xaxis: { title: 'Month', gridcolor: 'rgba(255, 255, 255, 0.1)' },
      yaxis: { title: 'Incident Count', gridcolor: 'rgba(255, 255, 255, 0.1)' },
      margin: { l: 50, r: 20, t: 50, b: 50 },
      legend: {
        font: { color: '#e1e1e6' }
      }
    };

    Plotly.newPlot(this.threatTrendsChart.nativeElement, data, layout, { responsive: true });
  }

  renderOsintTreemap(): void {
    if (!this.osintTreemapChart) return;

    const data = [{
      type: 'treemap',
      labels: [
        'OSINT',
        'Social Media', 'Forums', 'Dark Web', 'News',
        'Twitter', 'Facebook', 'LinkedIn',
        'Hacking Forums', 'Security Forums',
        'Marketplaces', 'Paste Sites',
        'Security News', 'Tech News'
      ],
      parents: [
        '',
        'OSINT', 'OSINT', 'OSINT', 'OSINT',
        'Social Media', 'Social Media', 'Social Media',
        'Forums', 'Forums',
        'Dark Web', 'Dark Web',
        'News', 'News'
      ],
      values: [0, 0, 0, 0, 0, 35, 25, 15, 30, 20, 40, 25, 18, 12],
      textinfo: 'label+value',
      marker: {
        colorscale: 'Viridis',
        line: { width: 1 }
      },
      hoverinfo: 'label+value+percent parent+percent root'
    }];

    const layout = {
      title: 'OSINT Data Treemap',
      font: { color: '#e1e1e6' },
      paper_bgcolor: 'rgba(26, 27, 38, 0.8)',
      plot_bgcolor: 'rgba(26, 27, 38, 0.8)',
      margin: { l: 0, r: 0, t: 50, b: 0 }
    };

    Plotly.newPlot(this.osintTreemapChart.nativeElement, data, layout, { responsive: true });
  }

  renderEmergingThreats(): void {
    if (!this.emergingThreatsChart) return;

    // Generate random data for emerging threats
    const x = [];
    const y = [];
    const size = [];
    const text = [];
    const threatNames = [
      'Zero-day Exploit', 'New Ransomware Variant', 'Supply Chain Attack',
      'IoT Botnet', 'Firmware Backdoor', 'API Vulnerability',
      'Cloud Misconfiguration', 'AI-powered Phishing', 'Cryptojacking',
      'Deepfake Attack', 'Quantum Vulnerability', 'Wireless Protocol Flaw'
    ];

    for (let i = 0; i < threatNames.length; i++) {
      x.push(Math.random());
      y.push(Math.random());
      const count = Math.floor(Math.random() * 50) + 10;
      size.push(count);
      text.push(`${threatNames[i]}<br>Count: ${count}`);
    }

    const data = [{
      x: x,
      y: y,
      mode: 'markers',
      type: 'scatter',
      marker: {
        size: size,
        sizemode: 'area',
        sizeref: 0.1,
        color: size,
        colorscale: 'Plasma',
        showscale: true,
        colorbar: {
          title: 'Count',
          titleside: 'right',
          titlefont: {
            color: '#e1e1e6'
          },
          tickfont: {
            color: '#e1e1e6'
          }
        }
      },
      text: text,
      hoverinfo: 'text'
    }];

    const layout = {
      title: 'Emerging Threats',
      font: { color: '#e1e1e6' },
      paper_bgcolor: 'rgba(26, 27, 38, 0.8)',
      plot_bgcolor: 'rgba(26, 27, 38, 0.8)',
      xaxis: { title: 'Novelty', gridcolor: 'rgba(255, 255, 255, 0.1)' },
      yaxis: { title: 'Impact', gridcolor: 'rgba(255, 255, 255, 0.1)' },
      margin: { l: 50, r: 50, t: 50, b: 50 }
    };

    Plotly.newPlot(this.emergingThreatsChart.nativeElement, data, layout, { responsive: true });
  }

  renderAnomaliesIOC(): void {
    if (!this.anomaliesChart) return;

    // Generate time series data with anomalies
    const days = Array.from({length: 30}, (_, i) => `Day ${i+1}`);
    const baseValue = 50;
    const normalData = days.map(() => baseValue + (Math.random() * 10 - 5));

    // Add some anomalies
    const anomalyIndices = [5, 12, 18, 25];
    anomalyIndices.forEach(i => {
      normalData[i] = baseValue + (Math.random() * 40 + 20);
    });

    const anomalyText = days.map((day, i) =>
      anomalyIndices.includes(i) ? `${day}: ANOMALY DETECTED!<br>Value: ${normalData[i].toFixed(1)}` :
      `${day}<br>Value: ${normalData[i].toFixed(1)}`
    );

    const data = [
      {
        x: days,
        y: normalData,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'IOC Activity',
        line: {
          color: 'rgba(58, 134, 255, 1)',
          width: 2
        },
        marker: {
          size: normalData.map((val, i) => anomalyIndices.includes(i) ? 12 : 6),
          color: normalData.map((val, i) => anomalyIndices.includes(i) ? 'rgba(217, 4, 41, 1)' : 'rgba(58, 134, 255, 1)')
        },
        text: anomalyText,
        hoverinfo: 'text'
      }
    ];

    const layout = {
      title: 'Anomalies in IOC Activity',
      font: { color: '#e1e1e6' },
      paper_bgcolor: 'rgba(26, 27, 38, 0.8)',
      plot_bgcolor: 'rgba(26, 27, 38, 0.8)',
      xaxis: { title: 'Time', gridcolor: 'rgba(255, 255, 255, 0.1)' },
      yaxis: { title: 'Activity Level', gridcolor: 'rgba(255, 255, 255, 0.1)' },
      margin: { l: 50, r: 20, t: 50, b: 50 },
      shapes: anomalyIndices.map(i => ({
        type: 'rect',
        xref: 'x',
        yref: 'paper',
        x0: i - 0.5,
        y0: 0,
        x1: i + 0.5,
        y1: 1,
        fillcolor: 'rgba(217, 4, 41, 0.1)',
        line: {
          width: 0
        }
      }))
    };

    Plotly.newPlot(this.anomaliesChart.nativeElement, data, layout, { responsive: true });
  }

  renderEventTimeline(): void {
    if (!this.eventTimelineChart) return;

    // Create timeline data
    const data = [{
      x: [
        '2023-01-05', '2023-01-15', '2023-02-02', '2023-02-20',
        '2023-03-10', '2023-03-25', '2023-04-08', '2023-04-22',
        '2023-05-05', '2023-05-18'
      ],
      y: [
        'Initial Recon', 'Vulnerability Scan', 'First Breach Attempt', 'Successful Breach',
        'Lateral Movement', 'Data Exfiltration', 'Backdoor Installed', 'Ransomware Deployed',
        'Detection', 'Containment'
      ],
      mode: 'markers+lines',
      type: 'scatter',
      marker: {
        size: 12,
        color: [
          '#3a86ff', '#3a86ff', '#ffbe0b', '#fb5607',
          '#fb5607', '#ff006e', '#ff006e', '#d90429',
          '#8338ec', '#06d6a0'
        ]
      },
      line: {
        color: 'rgba(255, 255, 255, 0.3)',
        width: 2
      }
    }];

    const layout = {
      title: 'Event Timeline',
      font: { color: '#e1e1e6' },
      paper_bgcolor: 'rgba(26, 27, 38, 0.8)',
      plot_bgcolor: 'rgba(26, 27, 38, 0.8)',
      xaxis: {
        title: 'Date',
        gridcolor: 'rgba(255, 255, 255, 0.1)',
        type: 'date'
      },
      yaxis: {
        title: 'Event',
        gridcolor: 'rgba(255, 255, 255, 0.1)'
      },
      margin: { l: 120, r: 20, t: 50, b: 50 }
    };

    Plotly.newPlot(this.eventTimelineChart.nativeElement, data, layout, { responsive: true });
  }

  renderAttackOrigins(): void {
    if (!this.attackOriginsChart) return;

    // Create geo scatter plot data
    const data = [{
      type: 'scattergeo',
      mode: 'markers',
      locations: ['USA', 'RUS', 'CHN', 'PRK', 'IRN', 'BRA', 'IND', 'NGA', 'DEU', 'GBR'],
      marker: {
        size: [25, 40, 35, 30, 28, 15, 20, 18, 12, 10],
        color: [10, 50, 40, 45, 35, 8, 15, 12, 5, 3],
        colorscale: 'Viridis',
        reversescale: true,
        colorbar: {
          title: 'Attack Volume',
          titleside: 'right',
          titlefont: {
            color: '#e1e1e6'
          },
          tickfont: {
            color: '#e1e1e6'
          }
        },
        line: {
          color: 'rgba(255, 255, 255, 0.5)',
          width: 1
        }
      },
      name: 'Attack Origins',
      text: [
        'United States: 25 attacks',
        'Russia: 40 attacks',
        'China: 35 attacks',
        'North Korea: 30 attacks',
        'Iran: 28 attacks',
        'Brazil: 15 attacks',
        'India: 20 attacks',
        'Nigeria: 18 attacks',
        'Germany: 12 attacks',
        'United Kingdom: 10 attacks'
      ],
      hoverinfo: 'text'
    }];

    const layout = {
      title: 'Attack Origins',
      font: { color: '#e1e1e6' },
      paper_bgcolor: 'rgba(26, 27, 38, 0.8)',
      geo: {
        scope: 'world',
        showland: true,
        landcolor: 'rgba(80, 80, 80, 1)',
        showocean: true,
        oceancolor: 'rgba(30, 30, 50, 1)',
        showlakes: true,
        lakecolor: 'rgba(30, 30, 50, 1)',
        showrivers: true,
        rivercolor: 'rgba(30, 30, 50, 1)',
        showcountries: true,
        countrycolor: 'rgba(150, 150, 150, 1)',
        showcoastlines: true,
        coastlinecolor: 'rgba(150, 150, 150, 1)',
        projection: {
          type: 'natural earth'
        }
      },
      margin: { l: 0, r: 0, t: 50, b: 0 }
    };

    Plotly.newPlot(this.attackOriginsChart.nativeElement, data, layout, { responsive: true });
  }
}
