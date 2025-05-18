import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-top-vulnerabilities',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-vulnerabilities.component.html',
  styleUrls: ['./top-vulnerabilities.component.scss']
})
export class TopVulnerabilitiesComponent implements OnInit {
  topVulnerabilities: { id: string; name: string; severity: string; count: number }[] = [];

  constructor() {}

  ngOnInit(): void {
    // TODO: Fetch real data from service
    this.topVulnerabilities = [
      { id: 'v1', name: 'SQL Injection', severity: 'High', count: 15 },
      { id: 'v2', name: 'Cross-Site Scripting', severity: 'Medium', count: 10 },
      { id: 'v3', name: 'Open Redirect', severity: 'Low', count: 5 },
      { id: 'v4', name: 'Insecure Deserialization', severity: 'High', count: 8 },
      { id: 'v5', name: 'Broken Authentication', severity: 'Critical', count: 3 }
    ];
  }
}
