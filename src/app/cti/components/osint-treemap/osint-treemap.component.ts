import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VisualizationService } from '../../../shared/services/visualization.service';
import { Subscription } from 'rxjs';

declare var Plotly: any;

interface OsintSource {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  reliability: 'high' | 'medium' | 'low';
  count: number;
  lastUpdate: Date;
  description?: string;
}

interface TreemapData {
  labels: string[];
  parents: string[];
  values: number[];
  text: string[];
  hovertext: string[];
  ids: string[];
  colors: string[];
}

@Component({
  selector: 'app-osint-treemap',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './osint-treemap.component.html',
  styleUrls: ['./osint-treemap.component.scss']
})
export class OsintTreemapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('treemapContainer') treemapContainer!: ElementRef;

  // OSINT data
  osintSources: OsintSource[] = [];
  treemapData: TreemapData = {
    labels: [],
    parents: [],
    values: [],
    text: [],
    hovertext: [],
    ids: [],
    colors: []
  };

  // Filter options
  selectedCategories: string[] = [];
  selectedReliabilities: string[] = ['high', 'medium', 'low'];
  searchTerm: string = '';

  // Loading state
  loading: boolean = true;

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
        this.updateTreemap();
      })
    );

    // Subscribe to refresh trigger
    this.subscriptions.push(
      this.visualizationService.refreshTrigger$.subscribe(trigger => {
        if (trigger) {
          this.loadData();
          this.updateTreemap();
        }
      })
    );

    // Load Plotly.js dynamically
    this.loadPlotlyScript().then(() => {
      this.loading = false;
      // Script loaded, treemap will be rendered in ngAfterViewInit
    });
  }

  ngAfterViewInit(): void {
    // Render treemap
    setTimeout(() => {
      this.renderTreemap();
    }, 100);
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Load Plotly.js script
  loadPlotlyScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof Plotly !== 'undefined') {
        resolve();
        return;
      }

      // Load JS
      const script = document.createElement('script');
      script.src = 'https://cdn.plot.ly/plotly-2.20.0.min.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = (error) => reject(error);
      document.head.appendChild(script);
    });
  }

  // Load OSINT data
  loadData(): void {
    // In a real application, this would fetch data from an API
    // For demo purposes, we'll use mock data
    this.osintSources = [
      // Social Media
      {
        id: 'twitter',
        name: 'Twitter/X',
        category: 'Social Media',
        reliability: 'medium',
        count: 1250,
        lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000),
        description: 'Données collectées via l\'API Twitter et des comptes de sécurité suivis'
      },
      {
        id: 'reddit',
        name: 'Reddit',
        category: 'Social Media',
        reliability: 'medium',
        count: 850,
        lastUpdate: new Date(Date.now() - 5 * 60 * 60 * 1000),
        description: 'Subreddits de sécurité informatique et forums spécialisés'
      },
      {
        id: 'linkedin',
        name: 'LinkedIn',
        category: 'Social Media',
        reliability: 'low',
        count: 320,
        lastUpdate: new Date(Date.now() - 12 * 60 * 60 * 1000),
        description: 'Publications de professionnels de la sécurité'
      },

      // Government
      {
        id: 'cisa',
        name: 'CISA',
        category: 'Government',
        reliability: 'high',
        count: 450,
        lastUpdate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        description: 'Cybersecurity and Infrastructure Security Agency (US)'
      },
      {
        id: 'anssi',
        name: 'ANSSI',
        category: 'Government',
        reliability: 'high',
        count: 380,
        lastUpdate: new Date(Date.now() - 36 * 60 * 60 * 1000),
        description: 'Agence Nationale de la Sécurité des Systèmes d\'Information (FR)'
      },
      {
        id: 'ncsc',
        name: 'NCSC',
        category: 'Government',
        reliability: 'high',
        count: 290,
        lastUpdate: new Date(Date.now() - 48 * 60 * 60 * 1000),
        description: 'National Cyber Security Centre (UK)'
      },

      // Security Vendors
      {
        id: 'mandiant',
        name: 'Mandiant',
        category: 'Security Vendors',
        reliability: 'high',
        count: 520,
        lastUpdate: new Date(Date.now() - 8 * 60 * 60 * 1000),
        description: 'Rapports de threat intelligence et analyses'
      },
      {
        id: 'crowdstrike',
        name: 'CrowdStrike',
        category: 'Security Vendors',
        reliability: 'high',
        count: 480,
        lastUpdate: new Date(Date.now() - 16 * 60 * 60 * 1000),
        description: 'Rapports et blogs sur les menaces'
      },
      {
        id: 'kaspersky',
        name: 'Kaspersky',
        category: 'Security Vendors',
        reliability: 'medium',
        count: 410,
        lastUpdate: new Date(Date.now() - 20 * 60 * 60 * 1000),
        description: 'Analyses de malwares et rapports de sécurité'
      },

      // Dark Web
      {
        id: 'forums',
        name: 'Forums',
        category: 'Dark Web',
        reliability: 'low',
        count: 780,
        lastUpdate: new Date(Date.now() - 4 * 60 * 60 * 1000),
        description: 'Forums de hacking et d\'échange d\'exploits'
      },
      {
        id: 'marketplaces',
        name: 'Marketplaces',
        category: 'Dark Web',
        reliability: 'low',
        count: 650,
        lastUpdate: new Date(Date.now() - 10 * 60 * 60 * 1000),
        description: 'Places de marché de données volées et d\'exploits'
      },
      {
        id: 'leaks',
        name: 'Data Leaks',
        category: 'Dark Web',
        reliability: 'medium',
        count: 920,
        lastUpdate: new Date(Date.now() - 6 * 60 * 60 * 1000),
        description: 'Fuites de données et bases de données compromises'
      },

      // Research
      {
        id: 'academic',
        name: 'Academic',
        category: 'Research',
        reliability: 'high',
        count: 180,
        lastUpdate: new Date(Date.now() - 72 * 60 * 60 * 1000),
        description: 'Publications académiques et recherches universitaires'
      },
      {
        id: 'whitepapers',
        name: 'Whitepapers',
        category: 'Research',
        reliability: 'high',
        count: 240,
        lastUpdate: new Date(Date.now() - 96 * 60 * 60 * 1000),
        description: 'Livres blancs et rapports techniques'
      },
      {
        id: 'conferences',
        name: 'Conferences',
        category: 'Research',
        reliability: 'medium',
        count: 150,
        lastUpdate: new Date(Date.now() - 120 * 60 * 60 * 1000),
        description: 'Présentations de conférences (BlackHat, DefCon, etc.)'
      }
    ];

    // Extract unique categories
    this.selectedCategories = [...new Set(this.osintSources.map(source => source.category))];

    // Prepare treemap data
    this.prepareTreemapData();
  }

  // Prepare treemap data
  prepareTreemapData(): void {
    // Reset data
    this.treemapData = {
      labels: [],
      parents: [],
      values: [],
      text: [],
      hovertext: [],
      ids: [],
      colors: []
    };

    // Add root
    this.treemapData.labels.push('OSINT Sources');
    this.treemapData.parents.push('');
    this.treemapData.values.push(0);
    this.treemapData.text.push('OSINT Sources');
    this.treemapData.hovertext.push('All OSINT Sources');
    this.treemapData.ids.push('root');
    this.treemapData.colors.push('rgba(0, 0, 0, 0)');

    // Add categories
    const categories = [...new Set(this.osintSources.map(source => source.category))];
    categories.forEach(category => {
      const categoryCount = this.osintSources
        .filter(source => source.category === category)
        .reduce((sum, source) => sum + source.count, 0);

      this.treemapData.labels.push(category);
      this.treemapData.parents.push('OSINT Sources');
      this.treemapData.values.push(categoryCount);
      this.treemapData.text.push(category);
      this.treemapData.hovertext.push(`${category}: ${categoryCount} indicators`);
      this.treemapData.ids.push(category);

      // Assign color based on category
      let color = '';
      switch (category) {
        case 'Social Media': color = 'rgba(30, 144, 255, 0.8)'; break;
        case 'Government': color = 'rgba(46, 213, 115, 0.8)'; break;
        case 'Security Vendors': color = 'rgba(255, 71, 87, 0.8)'; break;
        case 'Dark Web': color = 'rgba(155, 89, 182, 0.8)'; break;
        case 'Research': color = 'rgba(255, 165, 2, 0.8)'; break;
        default: color = 'rgba(52, 73, 94, 0.8)';
      }
      this.treemapData.colors.push(color);
    });

    // Add sources
    this.osintSources.forEach(source => {
      // Only include sources that match the filters
      if (
        this.selectedCategories.includes(source.category) &&
        this.selectedReliabilities.includes(source.reliability) &&
        (this.searchTerm === '' || source.name.toLowerCase().includes(this.searchTerm.toLowerCase()))
      ) {
        this.treemapData.labels.push(source.name);
        this.treemapData.parents.push(source.category);
        this.treemapData.values.push(source.count);
        this.treemapData.text.push(`${source.name}<br>${source.count} indicators`);
        this.treemapData.hovertext.push(
          `<b>${source.name}</b><br>` +
          `Category: ${source.category}<br>` +
          `Reliability: ${source.reliability}<br>` +
          `Count: ${source.count} indicators<br>` +
          `Last Update: ${source.lastUpdate.toLocaleString()}<br>` +
          (source.description ? `Description: ${source.description}` : '')
        );
        this.treemapData.ids.push(source.id);

        // Adjust color based on reliability
        let baseColor = '';
        switch (source.category) {
          case 'Social Media': baseColor = 'rgba(30, 144, 255, '; break;
          case 'Government': baseColor = 'rgba(46, 213, 115, '; break;
          case 'Security Vendors': baseColor = 'rgba(255, 71, 87, '; break;
          case 'Dark Web': baseColor = 'rgba(155, 89, 182, '; break;
          case 'Research': baseColor = 'rgba(255, 165, 2, '; break;
          default: baseColor = 'rgba(52, 73, 94, ';
        }

        // Adjust opacity based on reliability
        let opacity = 0.5;
        switch (source.reliability) {
          case 'high': opacity = 0.9; break;
          case 'medium': opacity = 0.7; break;
          case 'low': opacity = 0.5; break;
        }

        this.treemapData.colors.push(baseColor + opacity + ')');
      }
    });
  }

  // Render treemap
  renderTreemap(): void {
    if (typeof Plotly === 'undefined') {
      console.error('Plotly.js not loaded');
      return;
    }

    const container = this.treemapContainer.nativeElement;
    if (!container) {
      console.error('Treemap container not found');
      return;
    }

    // Create treemap data
    const data = [{
      type: 'treemap',
      labels: this.treemapData.labels,
      parents: this.treemapData.parents,
      values: this.treemapData.values,
      text: this.treemapData.text,
      hovertext: this.treemapData.hovertext,
      ids: this.treemapData.ids,
      marker: {
        colors: this.treemapData.colors,
        line: {
          width: 1,
          color: 'rgba(255, 255, 255, 0.2)'
        }
      },
      textinfo: 'label+value',
      hoverinfo: 'text',
      hoverlabel: {
        bgcolor: 'rgba(16, 18, 27, 0.95)',
        bordercolor: 'rgba(255, 255, 255, 0.1)',
        font: {
          family: 'Inter, sans-serif',
          size: 12,
          color: '#e0e0e0'
        }
      },
      outsidetextfont: {
        size: 12,
        color: '#e0e0e0'
      },
      insidetextfont: {
        size: 10,
        color: '#ffffff'
      },
      domain: {
        x: [0, 1],
        y: [0, 1]
      }
    }];

    // Layout configuration
    const layout = {
      margin: {
        l: 0,
        r: 0,
        b: 0,
        t: 0
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: {
        family: 'Inter, sans-serif',
        size: 12,
        color: '#e0e0e0'
      },
      treemapcolorway: [
        'rgba(30, 144, 255, 0.8)',
        'rgba(46, 213, 115, 0.8)',
        'rgba(255, 71, 87, 0.8)',
        'rgba(155, 89, 182, 0.8)',
        'rgba(255, 165, 2, 0.8)'
      ]
    };

    // Config options
    const config = {
      responsive: true,
      displayModeBar: false
    };

    // Create treemap
    Plotly.newPlot(container, data, layout, config);

    // Add click event
    container.on('plotly_click', (data: any) => {
      const point = data.points[0];
      const sourceId = point.id;
      const source = this.osintSources.find(s => s.id === sourceId);
      if (source) {
        console.log('Clicked source:', source);
        // In a real application, you would show details or perform an action
        this.showSourceDetails(source);
      }
    });
  }

  // Update treemap
  updateTreemap(): void {
    // Prepare treemap data
    this.prepareTreemapData();

    // Update treemap
    const container = this.treemapContainer.nativeElement;
    if (container && typeof Plotly !== 'undefined') {
      Plotly.react(container, [{
        type: 'treemap',
        labels: this.treemapData.labels,
        parents: this.treemapData.parents,
        values: this.treemapData.values,
        text: this.treemapData.text,
        hovertext: this.treemapData.hovertext,
        ids: this.treemapData.ids,
        marker: {
          colors: this.treemapData.colors,
          line: {
            width: 1,
            color: 'rgba(255, 255, 255, 0.2)'
          }
        },
        textinfo: 'label+value',
        hoverinfo: 'text'
      }]);
    }
  }

  // Toggle category filter
  toggleCategory(category: string): void {
    if (this.selectedCategories.includes(category)) {
      this.selectedCategories = this.selectedCategories.filter(c => c !== category);
    } else {
      this.selectedCategories.push(category);
    }
    this.updateTreemap();
  }

  // Toggle reliability filter
  toggleReliability(reliability: string): void {
    if (this.selectedReliabilities.includes(reliability)) {
      this.selectedReliabilities = this.selectedReliabilities.filter(r => r !== reliability);
    } else {
      this.selectedReliabilities.push(reliability);
    }
    this.updateTreemap();
  }

  // Apply search filter
  applySearch(term: string): void {
    this.searchTerm = term;
    this.updateTreemap();
  }

  // Refresh data
  refreshData(): void {
    this.loadData();
    this.updateTreemap();
  }

  // Show source details
  showSourceDetails(source: OsintSource): void {
    // In a real application, you would show a modal or navigate to a details page
    console.log('Show details for source:', source);
    // For demo purposes, we'll just log the source
  }

  // Format date
  formatDate(date: Date): string {
    return date.toLocaleString();
  }
}
