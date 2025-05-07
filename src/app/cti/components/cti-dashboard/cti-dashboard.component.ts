import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { DragDropModule } from '@angular/cdk/drag-drop';

// Import Plotly.js
import * as Plotly from 'plotly.js';

@Component({
  selector: 'app-cti-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatTabsModule,
    MatExpansionModule,
    MatDividerModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatGridListModule,
    MatListModule,
    MatStepperModule,
    MatProgressBarModule,
    MatBadgeModule,
    MatCheckboxModule,
    MatRadioModule,
    MatSliderModule,
    MatAutocompleteModule,
    MatBottomSheetModule,
    DragDropModule
  ],
  templateUrl: './cti-dashboard.component.html',
  styleUrls: ['./cti-dashboard.component.scss']
})
export class CtiDashboardComponent implements OnInit {
  darkMode = false;
  isLoading = true;
  error: string | null = null;

  // Chart data
  threatOverviewData: any = null;
  mitreHeatmapData: any = null;
  communityDetectionData: any = null;
  pageRankCentralityData: any = null;
  betweennessCentralityData: any = null;
  nodeSimilarityData: any = null;
  threatTrendsData: any = null;
  osintTreemapData: any = null;
  emergingThreatsData: any = null;
  anomaliesData: any = null;
  eventTimelineData: any = null;
  attackOriginsData: any = null;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    // Subscribe to theme changes
    this.themeService.theme$.subscribe(theme => {
      this.darkMode = theme === 'dark';
      // Redraw charts when theme changes
      this.renderCharts();
    });

    // Load data
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.error = null;

    // Simulate API call with setTimeout
    setTimeout(() => {
      try {
        // Generate mock data for all charts
        this.generateMockData();
        this.isLoading = false;
        // Render charts after data is loaded
        this.renderCharts();
      } catch (err) {
        this.isLoading = false;
        this.error = 'Failed to load data. Please try again.';
        console.error('Error loading data:', err);
      }
    }, 1500);
  }

  generateMockData(): void {
    // Generate mock data for all charts
    this.generateThreatOverviewData();
    this.generateMitreHeatmapData();
    this.generateCommunityDetectionData();
    this.generatePageRankCentralityData();
    this.generateBetweennessCentralityData();
    this.generateNodeSimilarityData();
    this.generateThreatTrendsData();
    this.generateOsintTreemapData();
    this.generateEmergingThreatsData();
    this.generateAnomaliesData();
    this.generateEventTimelineData();
    this.generateAttackOriginsData();
  }

  renderCharts(): void {
    if (this.isLoading || this.error) return;

    // Render all charts
    this.renderThreatOverview();
    this.renderMitreHeatmap();
    this.renderCommunityDetection();
    this.renderPageRankCentrality();
    this.renderBetweennessCentrality();
    this.renderNodeSimilarity();
    this.renderThreatTrends();
    this.renderOsintTreemap();
    this.renderEmergingThreats();
    this.renderAnomalies();
    this.renderEventTimeline();
    this.renderAttackOrigins();
  }

  // Mock data generation methods
  generateThreatOverviewData() {
    const threatTypes = ['Malware', 'Phishing', 'Ransomware', 'DDoS', 'Zero-day', 'Supply Chain'];
    const severityLevels = ['Critical', 'High', 'Medium', 'Low'];

    const data = [];

    threatTypes.forEach(threat => {
      severityLevels.forEach(severity => {
        data.push({
          threat_type: threat,
          severity: severity,
          count: Math.floor(Math.random() * 100) + 1
        });
      });
    });

    this.threatOverviewData = data;
  }

  generateMitreHeatmapData() {
    const tactics = ['Initial Access', 'Execution', 'Persistence', 'Privilege Escalation',
                    'Defense Evasion', 'Credential Access', 'Discovery', 'Lateral Movement',
                    'Collection', 'Command and Control', 'Exfiltration', 'Impact'];

    const data = [];

    for (let i = 0; i < 50; i++) {
      const tacticIndex = Math.floor(Math.random() * tactics.length);
      const techniqueId = `T${Math.floor(Math.random() * 1000) + 1000}`;
      const usageCount = Math.floor(Math.random() * 100) + 1;

      data.push({
        tactic: tactics[tacticIndex],
        technique: techniqueId,
        technique_name: `Technique ${techniqueId}`,
        usage_count: usageCount
      });
    }

    this.mitreHeatmapData = data;
  }

  generateCommunityDetectionData() {
    const communities = ['APT Group', 'Ransomware', 'Hacktivists', 'Cybercriminals', 'Nation State'];
    const data = [];

    for (let i = 0; i < 50; i++) {
      const communityIndex = Math.floor(Math.random() * communities.length);

      data.push({
        actor: `Actor ${i + 1}`,
        community: communities[communityIndex],
        x: Math.random() * 10,
        y: Math.random() * 10,
        size: Math.floor(Math.random() * 20) + 5
      });
    }

    this.communityDetectionData = data;
  }

  generatePageRankCentralityData() {
    const actors = [];
    for (let i = 0; i < 15; i++) {
      actors.push(`Threat Actor ${i + 1}`);
    }

    const data = actors.map(actor => ({
      actor: actor,
      pagerank: Math.random() * 0.9 + 0.1
    }));

    // Sort by pagerank in descending order
    data.sort((a, b) => b.pagerank - a.pagerank);

    this.pageRankCentralityData = data;
  }

  generateBetweennessCentralityData() {
    const actors = [];
    for (let i = 0; i < 15; i++) {
      actors.push(`Threat Actor ${i + 1}`);
    }

    const data = actors.map(actor => ({
      actor: actor,
      betweenness: Math.random() * 0.9 + 0.1
    }));

    // Sort by betweenness in descending order
    data.sort((a, b) => b.betweenness - a.betweenness);

    this.betweennessCentralityData = data;
  }

  generateNodeSimilarityData() {
    const data = [];

    for (let i = 0; i < 40; i++) {
      data.push({
        node1: `Node ${Math.floor(Math.random() * 20) + 1}`,
        node2: `Node ${Math.floor(Math.random() * 20) + 1}`,
        similarity: Math.random(),
        x: Math.random() * 10,
        y: Math.random() * 10
      });
    }

    this.nodeSimilarityData = data;
  }

  generateThreatTrendsData() {
    const threatTypes = ['Malware', 'Phishing', 'Ransomware', 'DDoS', 'Zero-day'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const data = [];

    threatTypes.forEach(threat => {
      const monthlyData = [];
      let lastValue = Math.floor(Math.random() * 50) + 10;

      months.forEach(month => {
        // Generate a value that's somewhat related to the previous month
        const change = Math.floor(Math.random() * 20) - 10;
        lastValue = Math.max(5, lastValue + change);

        monthlyData.push({
          month: month,
          count: lastValue,
          threat_type: threat
        });
      });

      data.push(...monthlyData);
    });

    this.threatTrendsData = data;
  }

  generateOsintTreemapData() {
    const categories = [
      { name: 'Social Media', value: Math.floor(Math.random() * 1000) + 500 },
      { name: 'Dark Web', value: Math.floor(Math.random() * 800) + 300 },
      { name: 'Forums', value: Math.floor(Math.random() * 600) + 200 },
      { name: 'News', value: Math.floor(Math.random() * 400) + 100 },
      { name: 'Research Papers', value: Math.floor(Math.random() * 300) + 50 },
      { name: 'Blogs', value: Math.floor(Math.random() * 500) + 150 }
    ];

    this.osintTreemapData = categories;
  }

  generateEmergingThreatsData() {
    const data = [];

    for (let i = 0; i < 20; i++) {
      data.push({
        threat_name: `Emerging Threat ${i + 1}`,
        first_seen: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        count: Math.floor(Math.random() * 100) + 1,
        severity: Math.floor(Math.random() * 10) + 1,
        x: Math.random() * 10,
        y: Math.random() * 10
      });
    }

    this.emergingThreatsData = data;
  }

  generateAnomaliesData() {
    const data = [];

    for (let i = 0; i < 15; i++) {
      data.push({
        ioc_type: ['IP', 'Domain', 'URL', 'Hash', 'Email'][Math.floor(Math.random() * 5)],
        anomaly_score: Math.random() * 10,
        detection_count: Math.floor(Math.random() * 100) + 1,
        x: Math.random() * 10,
        y: Math.random() * 10
      });
    }

    this.anomaliesData = data;
  }

  generateEventTimelineData() {
    const eventTypes = ['Malware Detection', 'Data Breach', 'Phishing Campaign', 'Ransomware Attack', 'Zero-day Exploit'];
    const data = [];

    for (let i = 0; i < 10; i++) {
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const startDate = new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000);

      data.push({
        event_id: i + 1,
        event_type: eventType,
        description: `${eventType} event ${i + 1}`,
        start_date: startDate,
        end_date: endDate,
        severity: ['Critical', 'High', 'Medium', 'Low'][Math.floor(Math.random() * 4)]
      });
    }

    this.eventTimelineData = data;
  }

  generateAttackOriginsData() {
    const countries = [
      { code: 'US', name: 'United States', lat: 37.0902, lon: -95.7129 },
      { code: 'CN', name: 'China', lat: 35.8617, lon: 104.1954 },
      { code: 'RU', name: 'Russia', lat: 61.5240, lon: 105.3188 },
      { code: 'IR', name: 'Iran', lat: 32.4279, lon: 53.6880 },
      { code: 'KP', name: 'North Korea', lat: 40.3399, lon: 127.5101 },
      { code: 'IN', name: 'India', lat: 20.5937, lon: 78.9629 },
      { code: 'BR', name: 'Brazil', lat: -14.2350, lon: -51.9253 },
      { code: 'DE', name: 'Germany', lat: 51.1657, lon: 10.4515 },
      { code: 'GB', name: 'United Kingdom', lat: 55.3781, lon: -3.4360 },
      { code: 'FR', name: 'France', lat: 46.2276, lon: 2.2137 }
    ];

    const data = [];

    countries.forEach(country => {
      data.push({
        country_code: country.code,
        country_name: country.name,
        lat: country.lat,
        lon: country.lon,
        attack_count: Math.floor(Math.random() * 1000) + 1
      });
    });

    this.attackOriginsData = data;
  }

  renderThreatOverview() {
    if (!this.threatOverviewData || !document.getElementById('threatOverviewChart')) return;

    const data = this.threatOverviewData;

    // Group data by severity for stacked bar chart
    const threatTypes = [...new Set(data.map(d => d.threat_type))];
    const severityLevels = ['Critical', 'High', 'Medium', 'Low'];

    const traces = severityLevels.map(severity => {
      return {
        x: threatTypes,
        y: threatTypes.map(threat => {
          const match = data.find(d => d.threat_type === threat && d.severity === severity);
          return match ? match.count : 0;
        }),
        name: severity,
        type: 'bar',
        marker: {
          color: severity === 'Critical' ? '#ff4d4d' :
                 severity === 'High' ? '#ffa64d' :
                 severity === 'Medium' ? '#ffff4d' : '#4dff4d'
        }
      };
    });

    const layout = {
      barmode: 'stack',
      title: 'Threat Overview by Severity',
      xaxis: { title: 'Threat Type' },
      yaxis: { title: 'Count' },
      legend: { orientation: 'h', y: -0.2 },
      margin: { l: 50, r: 50, t: 50, b: 100 },
      paper_bgcolor: this.darkMode ? 'rgba(37, 37, 56, 0.7)' : 'rgba(255, 255, 255, 0.7)',
      plot_bgcolor: this.darkMode ? 'rgba(37, 37, 56, 0)' : 'rgba(255, 255, 255, 0)',
      font: { color: this.darkMode ? '#e0e0e0' : '#333' }
    };

    Plotly.newPlot('threatOverviewChart', traces, layout);
  }

  renderMitreHeatmap() {
    if (!this.mitreHeatmapData || !document.getElementById('mitreHeatmapChart')) return;

    const data = this.mitreHeatmapData;

    // Create a scatter plot with size and color based on usage_count
    const trace = {
      x: data.map(d => d.tactic),
      y: data.map(d => d.technique_name),
      mode: 'markers',
      marker: {
        size: data.map(d => Math.sqrt(d.usage_count) * 5),
        color: data.map(d => d.usage_count),
        colorscale: 'Viridis',
        showscale: true,
        colorbar: { title: 'Usage Count' }
      },
      text: data.map(d => `${d.technique} (${d.technique_name})<br>Tactic: ${d.tactic}<br>Usage Count: ${d.usage_count}`),
      hoverinfo: 'text',
      type: 'scatter'
    };

    const layout = {
      title: 'MITRE ATT&CK Heatmap',
      xaxis: {
        title: 'Tactics',
        tickangle: 45
      },
      yaxis: { title: 'Techniques' },
      margin: { l: 150, r: 50, t: 50, b: 150 },
      paper_bgcolor: this.darkMode ? 'rgba(37, 37, 56, 0.7)' : 'rgba(255, 255, 255, 0.7)',
      plot_bgcolor: this.darkMode ? 'rgba(37, 37, 56, 0)' : 'rgba(255, 255, 255, 0)',
      font: { color: this.darkMode ? '#e0e0e0' : '#333' }
    };

    Plotly.newPlot('mitreHeatmapChart', [trace], layout);
  }

  renderCommunityDetection() {
    if (!this.communityDetectionData || !document.getElementById('communityDetectionChart')) return;

    const data = this.communityDetectionData;

    // Group data by community
    const communities = [...new Set(data.map(d => d.community))];

    const traces = communities.map(community => {
      const communityData = data.filter(d => d.community === community);

      return {
        x: communityData.map(d => d.x),
        y: communityData.map(d => d.y),
        mode: 'markers',
        name: community,
        marker: {
          size: communityData.map(d => d.size),
          opacity: 0.7
        },
        text: communityData.map(d => `${d.actor}<br>Community: ${d.community}`),
        hoverinfo: 'text',
        type: 'scatter'
      };
    });

    const layout = {
      title: 'Threat Actor Community Detection',
      xaxis: { title: 'Dimension 1', showgrid: false, zeroline: false },
      yaxis: { title: 'Dimension 2', showgrid: false, zeroline: false },
      margin: { l: 50, r: 50, t: 50, b: 50 },
      paper_bgcolor: this.darkMode ? 'rgba(37, 37, 56, 0.7)' : 'rgba(255, 255, 255, 0.7)',
      plot_bgcolor: this.darkMode ? 'rgba(37, 37, 56, 0)' : 'rgba(255, 255, 255, 0)',
      font: { color: this.darkMode ? '#e0e0e0' : '#333' }
    };

    Plotly.newPlot('communityDetectionChart', traces, layout);
  }

  renderPageRankCentrality() {
    if (!this.pageRankCentralityData || !document.getElementById('pageRankCentralityChart')) return;

    const data = this.pageRankCentralityData;

    // Create a horizontal bar chart
    const trace = {
      y: data.map(d => d.actor),
      x: data.map(d => d.pagerank),
      type: 'bar',
      orientation: 'h',
      marker: {
        color: data.map(d => d.pagerank),
        colorscale: 'Viridis',
        showscale: true,
        colorbar: { title: 'PageRank Score' }
      }
    };

    const layout = {
      title: 'PageRank Centrality of Threat Actors',
      xaxis: { title: 'PageRank Score' },
      yaxis: { title: 'Threat Actor', automargin: true },
      margin: { l: 150, r: 50, t: 50, b: 50 },
      paper_bgcolor: this.darkMode ? 'rgba(37, 37, 56, 0.7)' : 'rgba(255, 255, 255, 0.7)',
      plot_bgcolor: this.darkMode ? 'rgba(37, 37, 56, 0)' : 'rgba(255, 255, 255, 0)',
      font: { color: this.darkMode ? '#e0e0e0' : '#333' }
    };

    Plotly.newPlot('pageRankCentralityChart', [trace], layout);
  }

  renderBetweennessCentrality() {
    if (!this.betweennessCentralityData || !document.getElementById('betweennessCentralityChart')) return;

    const data = this.betweennessCentralityData;

    // Create a horizontal bar chart
    const trace = {
      y: data.map(d => d.actor),
      x: data.map(d => d.betweenness),
      type: 'bar',
      orientation: 'h',
      marker: {
        color: data.map(d => d.betweenness),
        colorscale: 'Viridis',
        showscale: true,
        colorbar: { title: 'Betweenness Score' }
      }
    };

    const layout = {
      title: 'Betweenness Centrality of Threat Actors',
      xaxis: { title: 'Betweenness Score' },
      yaxis: { title: 'Threat Actor', automargin: true },
      margin: { l: 150, r: 50, t: 50, b: 50 },
      paper_bgcolor: this.darkMode ? 'rgba(37, 37, 56, 0.7)' : 'rgba(255, 255, 255, 0.7)',
      plot_bgcolor: this.darkMode ? 'rgba(37, 37, 56, 0)' : 'rgba(255, 255, 255, 0)',
      font: { color: this.darkMode ? '#e0e0e0' : '#333' }
    };

    Plotly.newPlot('betweennessCentralityChart', [trace], layout);
  }

  renderNodeSimilarity() {
    if (!this.nodeSimilarityData || !document.getElementById('nodeSimilarityChart')) return;

    const data = this.nodeSimilarityData;

    // Create a scatter plot with size and color for similarity
    const trace = {
      x: data.map(d => d.x),
      y: data.map(d => d.y),
      mode: 'markers',
      marker: {
        size: data.map(d => d.similarity * 20),
        color: data.map(d => d.similarity),
        colorscale: 'Viridis',
        showscale: true,
        colorbar: { title: 'Similarity Score' }
      },
      text: data.map(d => `${d.node1} - ${d.node2}<br>Similarity: ${d.similarity.toFixed(2)}`),
      hoverinfo: 'text',
      type: 'scatter'
    };

    const layout = {
      title: 'Node Similarity Network',
      xaxis: { title: 'Dimension 1', showgrid: false, zeroline: false },
      yaxis: { title: 'Dimension 2', showgrid: false, zeroline: false },
      margin: { l: 50, r: 50, t: 50, b: 50 },
      paper_bgcolor: this.darkMode ? 'rgba(37, 37, 56, 0.7)' : 'rgba(255, 255, 255, 0.7)',
      plot_bgcolor: this.darkMode ? 'rgba(37, 37, 56, 0)' : 'rgba(255, 255, 255, 0)',
      font: { color: this.darkMode ? '#e0e0e0' : '#333' }
    };

    Plotly.newPlot('nodeSimilarityChart', [trace], layout);
  }

  renderThreatTrends() {
    if (!this.threatTrendsData || !document.getElementById('threatTrendsChart')) return;

    const data = this.threatTrendsData;

    // Group data by threat type
    const threatTypes = [...new Set(data.map(d => d.threat_type))];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const traces = threatTypes.map(threat => {
      const threatData = data.filter(d => d.threat_type === threat);

      return {
        x: months,
        y: months.map(month => {
          const match = threatData.find(d => d.month === month);
          return match ? match.count : 0;
        }),
        type: 'scatter',
        mode: 'lines+markers',
        name: threat
      };
    });

    const layout = {
      title: 'Threat Trends Over Time',
      xaxis: { title: 'Month' },
      yaxis: { title: 'Count' },
      margin: { l: 50, r: 50, t: 50, b: 50 },
      paper_bgcolor: this.darkMode ? 'rgba(37, 37, 56, 0.7)' : 'rgba(255, 255, 255, 0.7)',
      plot_bgcolor: this.darkMode ? 'rgba(37, 37, 56, 0)' : 'rgba(255, 255, 255, 0)',
      font: { color: this.darkMode ? '#e0e0e0' : '#333' }
    };

    Plotly.newPlot('threatTrendsChart', traces, layout);
  }

  renderOsintTreemap() {
    if (!this.osintTreemapData || !document.getElementById('osintTreemapChart')) return;

    const data = this.osintTreemapData;

    // Create a treemap
    const trace = {
      type: 'treemap',
      labels: data.map(d => d.name),
      parents: data.map(() => ''),
      values: data.map(d => d.value),
      textinfo: 'label+value+percent',
      marker: {
        colorscale: 'Viridis'
      }
    };

    const layout = {
      title: 'OSINT Data Sources',
      margin: { l: 0, r: 0, t: 50, b: 0 },
      paper_bgcolor: this.darkMode ? 'rgba(37, 37, 56, 0.7)' : 'rgba(255, 255, 255, 0.7)',
      font: { color: this.darkMode ? '#e0e0e0' : '#333' }
    };

    Plotly.newPlot('osintTreemapChart', [trace], layout);
  }

  renderEmergingThreats() {
    if (!this.emergingThreatsData || !document.getElementById('emergingThreatsChart')) return;

    const data = this.emergingThreatsData;

    // Create a scatter plot with size for count
    const trace = {
      x: data.map(d => d.x),
      y: data.map(d => d.y),
      mode: 'markers',
      marker: {
        size: data.map(d => Math.sqrt(d.count) * 3),
        color: data.map(d => d.severity),
        colorscale: 'Viridis',
        showscale: true,
        colorbar: { title: 'Severity' }
      },
      text: data.map(d => `${d.threat_name}<br>First Seen: ${d.first_seen.toLocaleDateString()}<br>Count: ${d.count}<br>Severity: ${d.severity}`),
      hoverinfo: 'text',
      type: 'scatter'
    };

    const layout = {
      title: 'Emerging Threats',
      xaxis: { title: 'Dimension 1', showgrid: false, zeroline: false },
      yaxis: { title: 'Dimension 2', showgrid: false, zeroline: false },
      margin: { l: 50, r: 50, t: 50, b: 50 },
      paper_bgcolor: this.darkMode ? 'rgba(37, 37, 56, 0.7)' : 'rgba(255, 255, 255, 0.7)',
      plot_bgcolor: this.darkMode ? 'rgba(37, 37, 56, 0)' : 'rgba(255, 255, 255, 0)',
      font: { color: this.darkMode ? '#e0e0e0' : '#333' }
    };

    Plotly.newPlot('emergingThreatsChart', [trace], layout);
  }

  renderAnomalies() {
    if (!this.anomaliesData || !document.getElementById('anomaliesChart')) return;

    const data = this.anomaliesData;

    // Group data by IOC type
    const iocTypes = [...new Set(data.map(d => d.ioc_type))];

    const traces = iocTypes.map(iocType => {
      const iocData = data.filter(d => d.ioc_type === iocType);

      return {
        x: iocData.map(d => d.x),
        y: iocData.map(d => d.y),
        mode: 'markers',
        name: iocType,
        marker: {
          size: iocData.map(d => Math.sqrt(d.detection_count) * 3),
          opacity: 0.7
        },
        text: iocData.map(d => `Type: ${d.ioc_type}<br>Anomaly Score: ${d.anomaly_score.toFixed(2)}<br>Detections: ${d.detection_count}`),
        hoverinfo: 'text',
        type: 'scatter'
      };
    });

    const layout = {
      title: 'Anomalies in IOC Activity',
      xaxis: { title: 'Dimension 1', showgrid: false, zeroline: false },
      yaxis: { title: 'Dimension 2', showgrid: false, zeroline: false },
      margin: { l: 50, r: 50, t: 50, b: 50 },
      paper_bgcolor: this.darkMode ? 'rgba(37, 37, 56, 0.7)' : 'rgba(255, 255, 255, 0.7)',
      plot_bgcolor: this.darkMode ? 'rgba(37, 37, 56, 0)' : 'rgba(255, 255, 255, 0)',
      font: { color: this.darkMode ? '#e0e0e0' : '#333' }
    };

    Plotly.newPlot('anomaliesChart', traces, layout);
  }

  renderEventTimeline() {
    if (!this.eventTimelineData || !document.getElementById('eventTimelineChart')) return;

    const data = this.eventTimelineData;

    // Sort data by start date
    data.sort((a, b) => a.start_date.getTime() - b.start_date.getTime());

    // Create a timeline
    const trace = {
      x: data.map(d => [d.start_date, d.end_date]),
      y: data.map(d => d.event_type),
      mode: 'lines',
      line: {
        width: 20,
        color: data.map(d => d.severity === 'Critical' ? '#ff4d4d' :
                           d.severity === 'High' ? '#ffa64d' :
                           d.severity === 'Medium' ? '#ffff4d' : '#4dff4d')
      },
      text: data.map(d => `${d.description}<br>Start: ${d.start_date.toLocaleDateString()}<br>End: ${d.end_date.toLocaleDateString()}<br>Severity: ${d.severity}`),
      hoverinfo: 'text',
      type: 'scatter'
    };

    const layout = {
      title: 'Event Timeline',
      xaxis: {
        title: 'Date',
        type: 'date'
      },
      yaxis: {
        title: 'Event Type',
        automargin: true
      },
      margin: { l: 150, r: 50, t: 50, b: 50 },
      paper_bgcolor: this.darkMode ? 'rgba(37, 37, 56, 0.7)' : 'rgba(255, 255, 255, 0.7)',
      plot_bgcolor: this.darkMode ? 'rgba(37, 37, 56, 0)' : 'rgba(255, 255, 255, 0)',
      font: { color: this.darkMode ? '#e0e0e0' : '#333' }
    };

    Plotly.newPlot('eventTimelineChart', [trace], layout);
  }

  renderAttackOrigins() {
    if (!this.attackOriginsData || !document.getElementById('attackOriginsChart')) return;

    const data = this.attackOriginsData;

    // Create a geo scatter plot
    const trace = {
      type: 'scattergeo',
      lon: data.map(d => d.lon),
      lat: data.map(d => d.lat),
      text: data.map(d => `${d.country_name}<br>Attacks: ${d.attack_count}`),
      marker: {
        size: data.map(d => Math.sqrt(d.attack_count) / 5),
        color: data.map(d => d.attack_count),
        colorscale: 'Viridis',
        showscale: true,
        colorbar: { title: 'Attack Count' },
        line: {
          color: 'rgba(255, 255, 255, 0.5)',
          width: 0.5
        }
      },
      hoverinfo: 'text'
    };

    const layout = {
      title: 'Attack Origins',
      geo: {
        scope: 'world',
        showland: true,
        landcolor: this.darkMode ? 'rgb(30, 30, 50)' : 'rgb(217, 217, 217)',
        showocean: true,
        oceancolor: this.darkMode ? 'rgb(20, 20, 40)' : 'rgb(240, 252, 255)',
        showlakes: true,
        lakecolor: this.darkMode ? 'rgb(20, 20, 40)' : 'rgb(240, 252, 255)',
        showrivers: true,
        rivercolor: this.darkMode ? 'rgb(20, 20, 40)' : 'rgb(240, 252, 255)',
        showcountries: true,
        countrycolor: this.darkMode ? 'rgb(50, 50, 70)' : 'rgb(180, 180, 180)',
        showcoastlines: true,
        coastlinecolor: this.darkMode ? 'rgb(50, 50, 70)' : 'rgb(180, 180, 180)',
        projection: {
          type: 'natural earth'
        }
      },
      margin: { l: 0, r: 0, t: 50, b: 0 },
      paper_bgcolor: this.darkMode ? 'rgba(37, 37, 56, 0.7)' : 'rgba(255, 255, 255, 0.7)',
      font: { color: this.darkMode ? '#e0e0e0' : '#333' }
    };

    Plotly.newPlot('attackOriginsChart', [trace], layout);
  }

  refreshData(): void {
    this.loadData();
  }
}
