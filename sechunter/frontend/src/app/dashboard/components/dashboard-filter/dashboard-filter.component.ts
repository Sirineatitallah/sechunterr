import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { DashboardDataService, FilterOptions } from '../../services/dashboard-data.service';

@Component({
  selector: 'app-dashboard-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatButtonToggleModule
  ],
  templateUrl: './dashboard-filter.component.html',
  styleUrls: ['./dashboard-filter.component.scss']
})
export class DashboardFilterComponent implements OnInit {
  severityOptions = ['Critical', 'High', 'Medium', 'Low', 'Info'];
  timeRangeOptions = [
    { value: 'day', label: 'Last 24 Hours' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'year', label: 'Last Year' }
  ];
  domainOptions = ['Network Security', 'Endpoint Protection', 'Data Protection', 'Application Security', 'Cloud Security', 'Identity Management'];
  statusOptions = ['open', 'in_progress', 'resolved'];
  regionOptions = ['North America', 'Europe', 'Asia', 'South America', 'Africa', 'Australia'];

  selectedFilters: FilterOptions = {
    severity: [],
    timeRange: 'week',
    domains: [],
    status: [],
    regions: []
  };

  isFilterActive = false;

  constructor(private dashboardDataService: DashboardDataService) { }

  ngOnInit(): void {
    this.dashboardDataService.filterOptions$.subscribe(filters => {
      this.selectedFilters = { ...filters };
      this.checkIfFilterActive();
    });
  }

  toggleSeverityFilter(severity: string): void {
    const index = this.selectedFilters.severity?.indexOf(severity) ?? -1;
    if (index === -1) {
      this.selectedFilters.severity = [...(this.selectedFilters.severity || []), severity];
    } else {
      this.selectedFilters.severity = this.selectedFilters.severity?.filter(s => s !== severity) || [];
    }
    this.applyFilters();
  }

  toggleDomainFilter(domain: string): void {
    const index = this.selectedFilters.domains?.indexOf(domain) ?? -1;
    if (index === -1) {
      this.selectedFilters.domains = [...(this.selectedFilters.domains || []), domain];
    } else {
      this.selectedFilters.domains = this.selectedFilters.domains?.filter(d => d !== domain) || [];
    }
    this.applyFilters();
  }

  toggleStatusFilter(status: string): void {
    const index = this.selectedFilters.status?.indexOf(status) ?? -1;
    if (index === -1) {
      this.selectedFilters.status = [...(this.selectedFilters.status || []), status];
    } else {
      this.selectedFilters.status = this.selectedFilters.status?.filter(s => s !== status) || [];
    }
    this.applyFilters();
  }

  toggleRegionFilter(region: string): void {
    const index = this.selectedFilters.regions?.indexOf(region) ?? -1;
    if (index === -1) {
      this.selectedFilters.regions = [...(this.selectedFilters.regions || []), region];
    } else {
      this.selectedFilters.regions = this.selectedFilters.regions?.filter(r => r !== region) || [];
    }
    this.applyFilters();
  }

  setTimeRange(timeRange: string): void {
    // Type assertion to ensure type safety
    this.selectedFilters.timeRange = timeRange as 'day' | 'week' | 'month' | 'year';
    this.applyFilters();
  }

  applyFilters(): void {
    this.dashboardDataService.updateFilters(this.selectedFilters);
    this.checkIfFilterActive();
  }

  resetFilters(): void {
    this.dashboardDataService.resetFilters();
    this.selectedFilters = {
      severity: [],
      timeRange: 'week',
      domains: [],
      status: [],
      regions: []
    };
    this.checkIfFilterActive();
  }

  private checkIfFilterActive(): void {
    const filters = this.selectedFilters;
    this.isFilterActive =
      (filters.severity?.length || 0) > 0 ||
      (filters.domains?.length || 0) > 0 ||
      (filters.status?.length || 0) > 0 ||
      (filters.regions?.length || 0) > 0 ||
      filters.timeRange !== 'week';
  }

  isSeveritySelected(severity: string): boolean {
    return this.selectedFilters.severity?.includes(severity) || false;
  }

  isDomainSelected(domain: string): boolean {
    return this.selectedFilters.domains?.includes(domain) || false;
  }

  isStatusSelected(status: string): boolean {
    return this.selectedFilters.status?.includes(status) || false;
  }

  isRegionSelected(region: string): boolean {
    return this.selectedFilters.regions?.includes(region) || false;
  }

  getSeverityClass(severity: string): string {
    return severity.toLowerCase();
  }

  getStatusClass(status: string): string {
    return status.replace('_', '-');
  }

  getTimeRangeLabel(timeRange: string | undefined): string {
    if (!timeRange) return '';
    const option = this.timeRangeOptions.find(o => o.value === timeRange);
    return option ? option.label : '';
  }
}
