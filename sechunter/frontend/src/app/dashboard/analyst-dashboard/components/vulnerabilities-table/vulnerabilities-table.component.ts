import { Component, Input, OnInit, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { Vulnerability } from '../../models/vulnerability.model';

@Component({
  selector: 'app-vulnerabilities-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatChipsModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    FormsModule
  ],
  templateUrl: './vulnerabilities-table.component.html',
  styleUrls: ['./vulnerabilities-table.component.scss']
})
export class VulnerabilitiesTableComponent implements OnInit, OnChanges {
  @Input() vulnerabilities: Vulnerability[] = [];
  @Input() loading = false;
  @Output() viewDetails = new EventEmitter<Vulnerability>();
  @Output() exportData = new EventEmitter<string>();

  displayedColumns: string[] = [
    'vulnerabilityName',
    'cvssScore',
    'severity',
    'discoveredDate',
    'cve_ids',
    'remediation',
    'host_ip',
    'actions'
  ];

  filteredData: Vulnerability[] = [];
  searchTerm = '';
  pageSize = 10;
  pageIndex = 0;

  // Filters
  severityFilter: string[] = [];
  hostFilter: string[] = [];
  cveFilter = '';
  cvssMinFilter = 0;
  cvssMaxFilter = 10;

  constructor() {}

  ngOnInit(): void {
    this.applyFilters();
  }

  ngOnChanges(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.vulnerabilities];

    // Apply search term filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(vuln =>
        vuln.vulnerabilityName.toLowerCase().includes(term) ||
        vuln.cve_ids.some(cve => cve.toLowerCase().includes(term)) ||
        vuln.host_ip.toLowerCase().includes(term)
      );
    }

    // Apply severity filter
    if (this.severityFilter.length > 0) {
      filtered = filtered.filter(vuln => this.severityFilter.includes(vuln.severity));
    }

    // Apply host filter
    if (this.hostFilter.length > 0) {
      filtered = filtered.filter(vuln => this.hostFilter.includes(vuln.host_ip));
    }

    // Apply CVE filter
    if (this.cveFilter) {
      filtered = filtered.filter(vuln =>
        vuln.cve_ids.some(cve => cve.includes(this.cveFilter))
      );
    }

    // Apply CVSS range filter
    filtered = filtered.filter(vuln =>
      vuln.cvssScore >= this.cvssMinFilter && vuln.cvssScore <= this.cvssMaxFilter
    );

    this.filteredData = filtered;
  }

  onSearch(): void {
    this.pageIndex = 0;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.severityFilter = [];
    this.hostFilter = [];
    this.cveFilter = '';
    this.cvssMinFilter = 0;
    this.cvssMaxFilter = 10;
    this.applyFilters();
  }

  onSortChange(sort: Sort): void {
    const data = [...this.filteredData];
    if (!sort.active || sort.direction === '') {
      this.filteredData = data;
      return;
    }

    this.filteredData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'vulnerabilityName': return this.compare(a.vulnerabilityName, b.vulnerabilityName, isAsc);
        case 'cvssScore': return this.compare(a.cvssScore, b.cvssScore, isAsc);
        case 'severity': return this.compare(this.getSeverityWeight(a.severity), this.getSeverityWeight(b.severity), isAsc);
        case 'discoveredDate': return this.compare(new Date(a.discoveredDate).getTime(), new Date(b.discoveredDate).getTime(), isAsc);
        case 'host_ip': return this.compare(a.host_ip, b.host_ip, isAsc);
        default: return 0;
      }
    });
  }

  private compare(a: number | string, b: number | string, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  private getSeverityWeight(severity: string): number {
    switch (severity.toLowerCase()) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }

  onViewDetails(vulnerability: Vulnerability): void {
    this.viewDetails.emit(vulnerability);
  }

  onExportData(format: string): void {
    this.exportData.emit(format);
  }

  getSeverityClass(severity: string): string {
    return `severity-${severity.toLowerCase()}`;
  }
}
