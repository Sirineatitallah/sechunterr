import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { VisualizationService } from '../../../shared/services/visualization.service';
import { AssetDetailComponent } from '../asset-detail/asset-detail.component';
import { Subscription } from 'rxjs';

declare var Plotly: any;

interface AssetCategory {
  name: string;
  count: number;
  percentage: number;
  color: string;
  subcategories: AssetSubcategory[];
}

interface AssetSubcategory {
  name: string;
  count: number;
  percentage: number;
  assets: Asset[];
}

interface Asset {
  id: string;
  name: string;
  type: string;
  ip?: string;
  domain?: string;
  os?: string;
  services?: Service[];
  vulnerabilities?: number;
  exposureScore: number;
}

interface Service {
  name: string;
  port: number;
  protocol: string;
  version?: string;
  status: 'open' | 'filtered' | 'closed';
}

@Component({
  selector: 'app-attack-surface',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './attack-surface.component.html',
  styleUrls: ['./attack-surface.component.scss']
})
export class AttackSurfaceComponent implements OnInit, OnDestroy {
  // Asset data
  assetCategories: AssetCategory[] = [];

  // Selected asset
  selectedAsset: Asset | null = null;

  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor(
    private visualizationService: VisualizationService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Load initial data
    this.loadData();

    // Subscribe to time range changes
    this.subscriptions.push(
      this.visualizationService.selectedTimeRange$.subscribe(() => {
        this.loadData();
      })
    );

    // Subscribe to refresh trigger
    this.subscriptions.push(
      this.visualizationService.refreshTrigger$.subscribe(trigger => {
        if (trigger) {
          this.loadData();
        }
      })
    );

    // Load Plotly.js dynamically
    this.loadPlotlyScript().then(() => {
      this.renderTreemap();
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Load asset data
  loadData(): void {
    // In a real application, this would fetch data from an API
    // For demo purposes, we'll use mock data
    this.assetCategories = [
      {
        name: 'Serveurs',
        count: 45,
        percentage: 40,
        color: '#ff4757',
        subcategories: [
          {
            name: 'Web Servers',
            count: 20,
            percentage: 44,
            assets: [
              {
                id: 'SRV-001',
                name: 'web-prod-01',
                type: 'Web Server',
                ip: '192.168.1.10',
                os: 'Ubuntu 20.04 LTS',
                services: [
                  { name: 'HTTP', port: 80, protocol: 'TCP', version: 'Apache 2.4.41', status: 'open' },
                  { name: 'HTTPS', port: 443, protocol: 'TCP', version: 'Apache 2.4.41', status: 'open' },
                  { name: 'SSH', port: 22, protocol: 'TCP', version: 'OpenSSH 8.2p1', status: 'open' }
                ],
                vulnerabilities: 5,
                exposureScore: 75
              },
              {
                id: 'SRV-002',
                name: 'web-prod-02',
                type: 'Web Server',
                ip: '192.168.1.11',
                os: 'Ubuntu 20.04 LTS',
                services: [
                  { name: 'HTTP', port: 80, protocol: 'TCP', version: 'Apache 2.4.41', status: 'open' },
                  { name: 'HTTPS', port: 443, protocol: 'TCP', version: 'Apache 2.4.41', status: 'open' },
                  { name: 'SSH', port: 22, protocol: 'TCP', version: 'OpenSSH 8.2p1', status: 'open' }
                ],
                vulnerabilities: 3,
                exposureScore: 65
              }
            ]
          },
          {
            name: 'Database Servers',
            count: 15,
            percentage: 33,
            assets: [
              {
                id: 'SRV-003',
                name: 'db-prod-01',
                type: 'Database Server',
                ip: '192.168.1.20',
                os: 'CentOS 8',
                services: [
                  { name: 'MySQL', port: 3306, protocol: 'TCP', version: 'MySQL 8.0.21', status: 'open' },
                  { name: 'SSH', port: 22, protocol: 'TCP', version: 'OpenSSH 8.0p1', status: 'open' }
                ],
                vulnerabilities: 2,
                exposureScore: 45
              }
            ]
          },
          {
            name: 'Application Servers',
            count: 10,
            percentage: 22,
            assets: [
              {
                id: 'SRV-004',
                name: 'app-prod-01',
                type: 'Application Server',
                ip: '192.168.1.30',
                os: 'Red Hat Enterprise Linux 8',
                services: [
                  { name: 'Tomcat', port: 8080, protocol: 'TCP', version: 'Apache Tomcat 9.0.37', status: 'open' },
                  { name: 'SSH', port: 22, protocol: 'TCP', version: 'OpenSSH 8.0p1', status: 'open' }
                ],
                vulnerabilities: 7,
                exposureScore: 80
              }
            ]
          }
        ]
      },
      {
        name: 'IoT',
        count: 35,
        percentage: 30,
        color: '#ffa502',
        subcategories: [
          {
            name: 'Cameras',
            count: 20,
            percentage: 57,
            assets: [
              {
                id: 'IOT-001',
                name: 'cam-lobby-01',
                type: 'IP Camera',
                ip: '192.168.2.10',
                services: [
                  { name: 'HTTP', port: 80, protocol: 'TCP', version: 'Embedded HTTP Server', status: 'open' },
                  { name: 'RTSP', port: 554, protocol: 'TCP', status: 'open' }
                ],
                vulnerabilities: 8,
                exposureScore: 85
              }
            ]
          },
          {
            name: 'Smart Devices',
            count: 15,
            percentage: 43,
            assets: [
              {
                id: 'IOT-002',
                name: 'thermostat-01',
                type: 'Smart Thermostat',
                ip: '192.168.2.20',
                services: [
                  { name: 'HTTP', port: 80, protocol: 'TCP', status: 'open' }
                ],
                vulnerabilities: 4,
                exposureScore: 60
              }
            ]
          }
        ]
      },
      {
        name: 'Applications Web',
        count: 30,
        percentage: 30,
        color: '#00f3ff',
        subcategories: [
          {
            name: 'Public Websites',
            count: 10,
            percentage: 33,
            assets: [
              {
                id: 'WEB-001',
                name: 'www.example.com',
                type: 'Website',
                domain: 'www.example.com',
                services: [
                  { name: 'HTTP', port: 80, protocol: 'TCP', status: 'open' },
                  { name: 'HTTPS', port: 443, protocol: 'TCP', status: 'open' }
                ],
                vulnerabilities: 6,
                exposureScore: 70
              }
            ]
          },
          {
            name: 'Internal Applications',
            count: 15,
            percentage: 50,
            assets: [
              {
                id: 'WEB-002',
                name: 'intranet.example.com',
                type: 'Intranet',
                domain: 'intranet.example.com',
                services: [
                  { name: 'HTTPS', port: 443, protocol: 'TCP', status: 'open' }
                ],
                vulnerabilities: 3,
                exposureScore: 50
              }
            ]
          },
          {
            name: 'APIs',
            count: 5,
            percentage: 17,
            assets: [
              {
                id: 'WEB-003',
                name: 'api.example.com',
                type: 'API Gateway',
                domain: 'api.example.com',
                services: [
                  { name: 'HTTPS', port: 443, protocol: 'TCP', status: 'open' }
                ],
                vulnerabilities: 2,
                exposureScore: 40
              }
            ]
          }
        ]
      }
    ];
  }

  // Load Plotly.js script
  loadPlotlyScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof Plotly !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.plot.ly/plotly-2.20.0.min.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = (error) => reject(error);
      document.head.appendChild(script);
    });
  }

  // Render treemap visualization
  renderTreemap(): void {
    if (typeof Plotly === 'undefined') {
      console.error('Plotly.js not loaded');
      return;
    }

    const container = document.getElementById('treemap-container');
    if (!container) {
      console.error('Treemap container not found');
      return;
    }

    // Prepare data for treemap
    const labels: string[] = [];
    const parents: string[] = [];
    const values: number[] = [];
    const colors: string[] = [];
    const ids: string[] = [];
    const customdata: any[] = [];

    // Add root
    labels.push('Attack Surface');
    parents.push('');
    values.push(0);
    colors.push('rgba(0, 0, 0, 0)');
    ids.push('root');
    customdata.push(null);

    // Add categories
    this.assetCategories.forEach(category => {
      labels.push(category.name);
      parents.push('Attack Surface');
      values.push(category.count);
      colors.push(category.color);
      ids.push(`cat-${category.name}`);
      customdata.push(null);

      // Add subcategories
      category.subcategories.forEach(subcategory => {
        labels.push(subcategory.name);
        parents.push(category.name);
        values.push(subcategory.count);
        colors.push(category.color);
        ids.push(`subcat-${category.name}-${subcategory.name}`);
        customdata.push(null);

        // Add assets
        subcategory.assets.forEach(asset => {
          labels.push(asset.name);
          parents.push(subcategory.name);
          values.push(1);

          // Color based on exposure score
          let assetColor = category.color;
          if (asset.exposureScore > 70) {
            assetColor = '#ff4757'; // High risk
          } else if (asset.exposureScore > 40) {
            assetColor = '#ffa502'; // Medium risk
          } else {
            assetColor = '#2ed573'; // Low risk
          }

          colors.push(assetColor);
          ids.push(`asset-${asset.id}`);
          customdata.push(asset);
        });
      });
    });

    const data = [{
      type: 'treemap',
      labels: labels,
      parents: parents,
      values: values,
      ids: ids,
      customdata: customdata,
      textinfo: 'label+value',
      hoverinfo: 'label+value+percent parent',
      marker: {
        colors: colors,
        line: {
          width: 1,
          color: 'rgba(0, 0, 0, 0.3)'
        }
      },
      pathbar: {
        visible: true,
        thickness: 20
      }
    }];

    const layout = {
      margin: {
        l: 0,
        r: 0,
        b: 0,
        t: 0
      },
      paper_bgcolor: 'rgba(0, 0, 0, 0)',
      plot_bgcolor: 'rgba(0, 0, 0, 0)',
      font: {
        family: 'Roboto, sans-serif',
        size: 12,
        color: '#e1e1e6'
      }
    };

    const config = {
      responsive: true,
      displayModeBar: false
    };

    Plotly.newPlot(container, data, layout, config);

    // Add click event
    container.addEventListener('plotly_click', (event: any) => {
      const data = event as any;
      if (data.points && data.points.length > 0) {
        const point = data.points[0];
        if (point.id && point.id.startsWith('asset-') && point.customdata) {
          this.openAssetDetail(point.customdata);
        }
      }
    });
  }

  // Open asset detail dialog
  openAssetDetail(asset: Asset): void {
    this.dialog.open(AssetDetailComponent, {
      width: '600px',
      data: asset
    });
  }

  // Refresh data
  refreshData(): void {
    this.loadData();
    this.renderTreemap();
  }

  // Get total assets count
  getTotalAssets(): number {
    return this.assetCategories.reduce((sum, category) => sum + category.count, 0);
  }

  // Get high risk assets count
  getHighRiskAssets(): number {
    let count = 0;
    this.assetCategories.forEach(category => {
      category.subcategories.forEach(subcategory => {
        count += subcategory.assets.filter(asset => asset.exposureScore > 70).length;
      });
    });
    return count;
  }

  // Get medium risk assets count
  getMediumRiskAssets(): number {
    let count = 0;
    this.assetCategories.forEach(category => {
      category.subcategories.forEach(subcategory => {
        count += subcategory.assets.filter(asset => asset.exposureScore > 40 && asset.exposureScore <= 70).length;
      });
    });
    return count;
  }

  // Get low risk assets count
  getLowRiskAssets(): number {
    let count = 0;
    this.assetCategories.forEach(category => {
      category.subcategories.forEach(subcategory => {
        count += subcategory.assets.filter(asset => asset.exposureScore <= 40).length;
      });
    });
    return count;
  }
}
