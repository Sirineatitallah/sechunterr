import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { GlobalDataService } from '../../../core/services/global-data.service';

@Component({
  selector: 'app-charts-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    FormsModule
  ],
  templateUrl: './charts-dashboard.component.html',
  styleUrls: ['./charts-dashboard.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ChartsDashboardComponent implements OnInit {
  // Selected time range
  selectedTimeRange: string = '7d';

  // Threat data
  threatTypes: { type: string; count: number; color: string }[] = [];
  threatSeverities: { severity: string; trend: number[] }[] = [];

  // Vulnerability data
  topVulnerabilities: { cve: string; cvss: number; color: string }[] = [];
  vulnerabilityStatus: { status: string; count: number; color: string }[] = [];

  // Asset data
  assetSecurityStatus: { type: string; vulnerable: number; atRisk: number; secure: number }[] = [];

  constructor(private globalDataService: GlobalDataService) { }

  ngOnInit(): void {
    // Initialize data
    this.initializeData();
  }

  // Set time range
  setTimeRange(range: string): void {
    this.selectedTimeRange = range;
    // Refresh data based on new time range
    this.refreshData();
  }

  // Refresh all data
  refreshData(): void {
    // In a real application, this would call APIs to refresh data
    console.log('Refreshing data for time range:', this.selectedTimeRange);
    this.initializeData();
  }

  // Initialize data
  private initializeData(): void {
    // Initialize threat types
    this.threatTypes = [
      { type: 'Malware', count: 35, color: '#ff4757' },
      { type: 'Phishing', count: 25, color: '#ffa502' },
      { type: 'DDoS', count: 20, color: '#2ed573' },
      { type: 'APT', count: 15, color: '#1e90ff' },
      { type: 'Other', count: 5, color: '#a55eea' }
    ];

    // Initialize threat severities
    this.threatSeverities = [
      { severity: 'Critical', trend: [10, 12, 15, 18, 14, 20, 18, 22, 19] },
      { severity: 'High', trend: [25, 28, 22, 30, 25, 32, 28, 35, 30] },
      { severity: 'Medium', trend: [40, 45, 38, 50, 42, 55, 48, 60, 52] },
      { severity: 'Low', trend: [25, 30, 28, 35, 32, 38, 35, 40, 38] }
    ];

    // Initialize top vulnerabilities
    this.topVulnerabilities = [
      { cve: 'CVE-2023-23397', cvss: 9.8, color: '#ff4757' },
      { cve: 'CVE-2021-44228', cvss: 10.0, color: '#ff4757' },
      { cve: 'CVE-2023-20887', cvss: 9.1, color: '#ff4757' },
      { cve: 'CVE-2023-0386', cvss: 8.4, color: '#ffa502' },
      { cve: 'CVE-2022-3786', cvss: 7.5, color: '#ffa502' }
    ];

    // Initialize vulnerability status
    this.vulnerabilityStatus = [
      { status: 'Open', count: 45, color: '#ff4757' },
      { status: 'In Progress', count: 35, color: '#ffa502' },
      { status: 'Resolved', count: 20, color: '#2ed573' }
    ];

    // Initialize asset security status
    this.assetSecurityStatus = [
      { type: 'Servers', vulnerable: 20, atRisk: 15, secure: 65 },
      { type: 'Applications', vulnerable: 30, atRisk: 25, secure: 45 },
      { type: 'Endpoints', vulnerable: 15, atRisk: 20, secure: 65 },
      { type: 'Cloud', vulnerable: 10, atRisk: 15, secure: 75 },
      { type: 'Network', vulnerable: 5, atRisk: 10, secure: 85 }
    ];
  }
}
