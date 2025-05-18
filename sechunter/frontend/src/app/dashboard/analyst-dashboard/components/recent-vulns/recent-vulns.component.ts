import { Component, EventEmitter, Input, OnInit, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Vulnerability } from '../../models/vulnerability.model';

@Component({
  selector: 'app-recent-vulns',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './recent-vulns.component.html',
  styleUrls: ['./recent-vulns.component.scss']
})
export class RecentVulnsComponent implements OnInit, OnChanges {
  @Input() vulnerabilities: Vulnerability[] = [];
  @Input() loading = false;
  @Output() viewDetails = new EventEmitter<Vulnerability>();

  recentVulnerabilities: Vulnerability[] = [];

  constructor() {}

  ngOnInit(): void {
    this.processVulnerabilities();
  }

  ngOnChanges(): void {
    this.processVulnerabilities();
  }

  private processVulnerabilities(): void {
    // Sort by discovered date (newest first)
    this.recentVulnerabilities = [...this.vulnerabilities]
      .sort((a, b) => new Date(b.discoveredDate).getTime() - new Date(a.discoveredDate).getTime())
      .slice(0, 5); // Show only the 5 most recent
  }

  onViewDetails(vulnerability: Vulnerability): void {
    this.viewDetails.emit(vulnerability);
  }

  getSeverityClass(severity: string): string {
    return `severity-${severity.toLowerCase()}`;
  }

  getTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) {
      return diffDay === 1 ? '1 day ago' : `${diffDay} days ago`;
    }
    if (diffHour > 0) {
      return diffHour === 1 ? '1 hour ago' : `${diffHour} hours ago`;
    }
    if (diffMin > 0) {
      return diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`;
    }
    return 'Just now';
  }

  refreshFeed(): void {
    this.processVulnerabilities();
  }
}
