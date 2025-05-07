import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorDisplayComponent } from '../../../shared/components/error-display/error-display.component';
import { TopVulnerabilitiesComponent } from '../../../modules/vi/components/top-vulnerabilities/top-vulnerabilities.component';
import { SeverityDistributionComponent } from '../../../modules/vi/components/severity-distribution/severity-distribution.component';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { ExportService } from '../../services/export.service';

@Component({
  selector: 'app-dashboard-test',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    LoadingComponent,
    ErrorDisplayComponent,
    TopVulnerabilitiesComponent,
    SeverityDistributionComponent
  ],
  template: `
    <div class="test-container">
      <h1>Dashboard Components Test</h1>
      
      <div class="controls">
        <button (click)="loadData()">Load Data</button>
        <button (click)="clearData()">Clear Data</button>
        <button (click)="simulateError()">Simulate Error</button>
        <button (click)="simulateLoading()">Simulate Loading</button>
        <button (click)="exportData('csv')">Export CSV</button>
      </div>
      
      <div class="test-grid">
        <!-- Loading Component Test -->
        <div class="test-card">
          <h2>Loading Component</h2>
          <div class="component-container">
            <app-loading 
              [type]="loadingType" 
              [skeletonType]="skeletonType"
              [message]="loadingMessage">
            </app-loading>
          </div>
          <div class="controls">
            <button (click)="toggleLoadingType()">Toggle Type</button>
            <button (click)="toggleSkeletonType()">Toggle Skeleton</button>
          </div>
        </div>
        
        <!-- Error Component Test -->
        <div class="test-card">
          <h2>Error Component</h2>
          <div class="component-container">
            <app-error-display
              [message]="errorMessage"
              [errorDetails]="errorDetails"
              [retryable]="true"
              (retry)="onRetry()">
            </app-error-display>
          </div>
        </div>
        
        <!-- Top Vulnerabilities Component Test -->
        <div class="test-card">
          <h2>Top Vulnerabilities</h2>
          <div class="component-container" [class.loading]="isLoading" [class.error]="hasError">
            <app-loading *ngIf="isLoading" [type]="'skeleton'" [skeletonType]="'chart'"></app-loading>
            <app-error-display 
              *ngIf="hasError && !isLoading" 
              [message]="'Failed to load vulnerability data'"
              (retry)="loadVulnerabilityData()">
            </app-error-display>
            <app-top-vulnerabilities 
              *ngIf="!isLoading && !hasError"
              [data]="vulnerabilityData">
            </app-top-vulnerabilities>
          </div>
        </div>
        
        <!-- Severity Distribution Component Test -->
        <div class="test-card">
          <h2>Severity Distribution</h2>
          <div class="component-container" [class.loading]="isLoading" [class.error]="hasError">
            <app-loading *ngIf="isLoading" [type]="'skeleton'" [skeletonType]="'chart'"></app-loading>
            <app-error-display 
              *ngIf="hasError && !isLoading" 
              [message]="'Failed to load severity data'"
              (retry)="loadSeverityData()">
            </app-error-display>
            <app-severity-distribution 
              *ngIf="!isLoading && !hasError"
              [data]="severityData">
            </app-severity-distribution>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .test-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    h1 {
      margin-bottom: 20px;
    }
    
    .controls {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    
    button {
      padding: 8px 16px;
      background: #3f51b5;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.3s;
    }
    
    button:hover {
      background: #303f9f;
    }
    
    .test-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
      gap: 20px;
    }
    
    .test-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      padding: 20px;
      display: flex;
      flex-direction: column;
    }
    
    h2 {
      margin-top: 0;
      margin-bottom: 16px;
      font-size: 18px;
    }
    
    .component-container {
      flex: 1;
      min-height: 300px;
      border: 1px solid #eee;
      border-radius: 4px;
      position: relative;
      margin-bottom: 16px;
    }
    
    .loading {
      position: relative;
    }
    
    .error {
      position: relative;
    }
  `]
})
export class DashboardTestComponent implements OnInit {
  // Loading component test
  loadingType: 'spinner' | 'skeleton' = 'spinner';
  skeletonType: 'chart' | 'table' | 'card' = 'chart';
  loadingMessage = 'Chargement des données...';
  
  // Error component test
  errorMessage = 'Une erreur est survenue lors du chargement des données.';
  errorDetails = 'Error: Failed to fetch data from API endpoint /api/data\nStatus: 500\nMessage: Internal Server Error';
  
  // Data state
  isLoading = false;
  hasError = false;
  
  // Component data
  vulnerabilityData: any[] = [];
  severityData: any = null;
  
  constructor(
    private http: HttpClient,
    private dashboardDataService: DashboardDataService,
    private exportService: ExportService
  ) {}
  
  ngOnInit(): void {
    this.loadData();
  }
  
  loadData(): void {
    this.isLoading = true;
    this.hasError = false;
    
    // Load vulnerability data
    this.loadVulnerabilityData();
    
    // Load severity data
    this.loadSeverityData();
  }
  
  loadVulnerabilityData(): void {
    this.http.get<any>('assets/mock-data/top-vulnerabilities.json')
      .subscribe({
        next: (response) => {
          this.vulnerabilityData = response.data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading vulnerability data:', error);
          this.hasError = true;
          this.isLoading = false;
        }
      });
  }
  
  loadSeverityData(): void {
    this.http.get<any>('assets/mock-data/severity-distribution.json')
      .subscribe({
        next: (response) => {
          this.severityData = response.data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading severity data:', error);
          this.hasError = true;
          this.isLoading = false;
        }
      });
  }
  
  clearData(): void {
    this.vulnerabilityData = [];
    this.severityData = null;
  }
  
  simulateError(): void {
    this.hasError = true;
    this.isLoading = false;
  }
  
  simulateLoading(): void {
    this.isLoading = true;
    this.hasError = false;
    
    // Simulate loading for 3 seconds
    setTimeout(() => {
      this.isLoading = false;
    }, 3000);
  }
  
  toggleLoadingType(): void {
    this.loadingType = this.loadingType === 'spinner' ? 'skeleton' : 'spinner';
  }
  
  toggleSkeletonType(): void {
    if (this.skeletonType === 'chart') {
      this.skeletonType = 'table';
    } else if (this.skeletonType === 'table') {
      this.skeletonType = 'card';
    } else {
      this.skeletonType = 'chart';
    }
  }
  
  onRetry(): void {
    console.log('Retry requested');
    this.loadData();
  }
  
  exportData(format: string): void {
    if (this.vulnerabilityData.length > 0) {
      this.exportService.exportData(
        this.vulnerabilityData,
        format as any,
        'vulnerability_data'
      );
    }
  }
}
