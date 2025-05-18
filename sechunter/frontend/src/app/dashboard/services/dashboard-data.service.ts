import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface VulnerabilityData {
  severity: string;
  count: number;
  trend: number;
  details?: VulnerabilityDetail[];
}

export interface VulnerabilityDetail {
  id: string;
  name: string;
  severity: string;
  cve?: string;
  description: string;
  affectedAssets: string[];
  discoveryDate: string;
  status: 'open' | 'in_progress' | 'resolved';
}

export interface SecurityDomain {
  name: string;
  score: number;
  previousScore: number;
  issues: number;
  recommendations: SecurityRecommendation[];
}

export interface SecurityRecommendation {
  id: string;
  domain: string;
  action: string;
  impact: 'high' | 'medium' | 'low';
  description: string;
  effort: 'easy' | 'medium' | 'complex';
}

export interface ThreatAlert {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  region: string;
  time: string;
  source: string;
  details?: string;
  indicators?: string[];
  relatedAlerts?: string[];
}

export interface FilterOptions {
  severity?: string[];
  timeRange?: 'day' | 'week' | 'month' | 'year';
  domains?: string[];
  status?: string[];
  regions?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardDataService {
  // Mock vulnerability data
  private vulnerabilityData: VulnerabilityData[] = [
    { 
      severity: 'Critical', 
      count: 12, 
      trend: -3,
      details: [
        {
          id: 'VUL-001',
          name: 'SQL Injection in Login Form',
          severity: 'Critical',
          cve: 'CVE-2023-1234',
          description: 'SQL injection vulnerability in the login form allows attackers to bypass authentication.',
          affectedAssets: ['Web Server', 'Database'],
          discoveryDate: '2023-04-15',
          status: 'in_progress'
        },
        {
          id: 'VUL-002',
          name: 'Remote Code Execution in File Upload',
          severity: 'Critical',
          cve: 'CVE-2023-5678',
          description: 'Remote code execution vulnerability in file upload functionality allows attackers to execute arbitrary code.',
          affectedAssets: ['Web Application', 'Application Server'],
          discoveryDate: '2023-04-18',
          status: 'open'
        },
        {
          id: 'VUL-003',
          name: 'Outdated SSL/TLS Version',
          severity: 'Critical',
          description: 'Server is using outdated SSL/TLS versions that are vulnerable to known attacks.',
          affectedAssets: ['Load Balancer', 'Web Server'],
          discoveryDate: '2023-04-10',
          status: 'open'
        }
      ]
    },
    { 
      severity: 'High', 
      count: 28, 
      trend: -5,
      details: [
        {
          id: 'VUL-004',
          name: 'Cross-Site Scripting (XSS)',
          severity: 'High',
          cve: 'CVE-2023-9012',
          description: 'Stored XSS vulnerability in comment section allows attackers to inject malicious scripts.',
          affectedAssets: ['Web Application'],
          discoveryDate: '2023-04-20',
          status: 'open'
        },
        {
          id: 'VUL-005',
          name: 'Insecure Direct Object Reference',
          severity: 'High',
          description: 'IDOR vulnerability allows users to access unauthorized resources by manipulating reference IDs.',
          affectedAssets: ['API Gateway', 'Web Application'],
          discoveryDate: '2023-04-22',
          status: 'open'
        }
      ]
    },
    { 
      severity: 'Medium', 
      count: 45, 
      trend: 2,
      details: [
        {
          id: 'VUL-006',
          name: 'Missing Security Headers',
          severity: 'Medium',
          description: 'Application is missing important security headers like Content-Security-Policy.',
          affectedAssets: ['Web Server'],
          discoveryDate: '2023-04-25',
          status: 'open'
        }
      ]
    },
    { 
      severity: 'Low', 
      count: 67, 
      trend: -8,
      details: []
    },
    { 
      severity: 'Info', 
      count: 89, 
      trend: 5,
      details: []
    }
  ];

  // Mock security domains data
  private securityDomainsData: SecurityDomain[] = [
    {
      name: 'Network Security',
      score: 85,
      previousScore: 80,
      issues: 5,
      recommendations: [
        {
          id: 'REC-001',
          domain: 'Network Security',
          action: 'Implement network segmentation',
          impact: 'high',
          description: 'Segment the network to isolate critical systems and limit lateral movement in case of a breach.',
          effort: 'complex'
        },
        {
          id: 'REC-002',
          domain: 'Network Security',
          action: 'Update firewall rules',
          impact: 'medium',
          description: 'Review and update firewall rules to restrict unnecessary access.',
          effort: 'medium'
        }
      ]
    },
    {
      name: 'Endpoint Protection',
      score: 72,
      previousScore: 68,
      issues: 8,
      recommendations: [
        {
          id: 'REC-003',
          domain: 'Endpoint Protection',
          action: 'Deploy EDR solution',
          impact: 'high',
          description: 'Deploy an Endpoint Detection and Response solution to detect and respond to threats.',
          effort: 'complex'
        }
      ]
    },
    {
      name: 'Data Protection',
      score: 65,
      previousScore: 60,
      issues: 12,
      recommendations: [
        {
          id: 'REC-004',
          domain: 'Data Protection',
          action: 'Encrypt sensitive data at rest',
          impact: 'high',
          description: 'Implement encryption for all sensitive data stored in databases and file systems.',
          effort: 'medium'
        },
        {
          id: 'REC-005',
          domain: 'Data Protection',
          action: 'Implement data loss prevention',
          impact: 'medium',
          description: 'Deploy DLP solutions to prevent unauthorized data exfiltration.',
          effort: 'complex'
        }
      ]
    }
  ];

  // Mock threat alerts data
  private threatAlertsData: ThreatAlert[] = [
    {
      id: 'THREAT-001',
      type: 'DDoS Attack',
      severity: 'critical',
      region: 'North America',
      time: '10 min ago',
      source: 'Botnet',
      details: 'Distributed Denial of Service attack targeting web servers. Traffic volume: 15 Gbps.',
      indicators: ['High traffic volume', 'Multiple source IPs', 'TCP SYN flood'],
      relatedAlerts: ['THREAT-005']
    },
    {
      id: 'THREAT-002',
      type: 'Data Breach',
      severity: 'high',
      region: 'Asia',
      time: '25 min ago',
      source: 'APT Group',
      details: 'Potential data exfiltration detected from database servers. Volume: 2.3 GB.',
      indicators: ['Unusual outbound traffic', 'Database query anomalies', 'Suspicious IP connections'],
      relatedAlerts: ['THREAT-003']
    },
    {
      id: 'THREAT-003',
      type: 'Phishing Campaign',
      severity: 'medium',
      region: 'Europe',
      time: '1 hour ago',
      source: 'Unknown',
      details: 'Phishing emails targeting finance department employees with malicious attachments.',
      indicators: ['Spoofed sender domains', 'Malicious attachments', 'Suspicious links'],
      relatedAlerts: []
    }
  ];

  // BehaviorSubjects to store and emit data
  private vulnerabilitiesSubject = new BehaviorSubject<VulnerabilityData[]>(this.vulnerabilityData);
  private securityDomainsSubject = new BehaviorSubject<SecurityDomain[]>(this.securityDomainsData);
  private threatAlertsSubject = new BehaviorSubject<ThreatAlert[]>(this.threatAlertsData);
  
  // Selected item for drill-down views
  private selectedVulnerabilitySubject = new BehaviorSubject<VulnerabilityDetail | null>(null);
  private selectedDomainSubject = new BehaviorSubject<SecurityDomain | null>(null);
  private selectedThreatSubject = new BehaviorSubject<ThreatAlert | null>(null);
  
  // Filter state
  private filterOptionsSubject = new BehaviorSubject<FilterOptions>({
    severity: [],
    timeRange: 'week',
    domains: [],
    status: [],
    regions: []
  });

  // Drill-down view state
  private isDrillDownActiveSubject = new BehaviorSubject<boolean>(false);

  constructor() { }

  // Getter methods for observables
  get vulnerabilities$(): Observable<VulnerabilityData[]> {
    return this.vulnerabilitiesSubject.asObservable();
  }

  get securityDomains$(): Observable<SecurityDomain[]> {
    return this.securityDomainsSubject.asObservable();
  }

  get threatAlerts$(): Observable<ThreatAlert[]> {
    return this.threatAlertsSubject.asObservable();
  }

  get selectedVulnerability$(): Observable<VulnerabilityDetail | null> {
    return this.selectedVulnerabilitySubject.asObservable();
  }

  get selectedDomain$(): Observable<SecurityDomain | null> {
    return this.selectedDomainSubject.asObservable();
  }

  get selectedThreat$(): Observable<ThreatAlert | null> {
    return this.selectedThreatSubject.asObservable();
  }

  get filterOptions$(): Observable<FilterOptions> {
    return this.filterOptionsSubject.asObservable();
  }

  get isDrillDownActive$(): Observable<boolean> {
    return this.isDrillDownActiveSubject.asObservable();
  }

  // Methods to select items for drill-down
  selectVulnerability(vulnerabilityId: string): void {
    const vulnerability = this.findVulnerabilityById(vulnerabilityId);
    this.selectedVulnerabilitySubject.next(vulnerability);
    this.isDrillDownActiveSubject.next(true);
  }

  selectDomain(domainName: string): void {
    const domain = this.securityDomainsData.find(d => d.name === domainName) || null;
    this.selectedDomainSubject.next(domain);
    this.isDrillDownActiveSubject.next(true);
  }

  selectThreat(threatId: string): void {
    const threat = this.threatAlertsData.find(t => t.id === threatId) || null;
    this.selectedThreatSubject.next(threat);
    this.isDrillDownActiveSubject.next(true);
  }

  // Method to close drill-down view
  closeDrillDown(): void {
    this.selectedVulnerabilitySubject.next(null);
    this.selectedDomainSubject.next(null);
    this.selectedThreatSubject.next(null);
    this.isDrillDownActiveSubject.next(false);
  }

  // Method to update filter options
  updateFilters(filters: Partial<FilterOptions>): void {
    const currentFilters = this.filterOptionsSubject.value;
    this.filterOptionsSubject.next({
      ...currentFilters,
      ...filters
    });
    this.applyFilters();
  }

  // Method to reset filters
  resetFilters(): void {
    this.filterOptionsSubject.next({
      severity: [],
      timeRange: 'week',
      domains: [],
      status: [],
      regions: []
    });
    this.vulnerabilitiesSubject.next(this.vulnerabilityData);
    this.securityDomainsSubject.next(this.securityDomainsData);
    this.threatAlertsSubject.next(this.threatAlertsData);
  }

  // Private method to apply filters
  private applyFilters(): void {
    const filters = this.filterOptionsSubject.value;
    
    // Filter vulnerabilities
    let filteredVulnerabilities = [...this.vulnerabilityData];
    if (filters.severity && filters.severity.length > 0) {
      filteredVulnerabilities = filteredVulnerabilities.filter(v => 
        filters.severity!.includes(v.severity)
      );
    }
    this.vulnerabilitiesSubject.next(filteredVulnerabilities);
    
    // Filter security domains
    let filteredDomains = [...this.securityDomainsData];
    if (filters.domains && filters.domains.length > 0) {
      filteredDomains = filteredDomains.filter(d => 
        filters.domains!.includes(d.name)
      );
    }
    this.securityDomainsSubject.next(filteredDomains);
    
    // Filter threat alerts
    let filteredThreats = [...this.threatAlertsData];
    if (filters.severity && filters.severity.length > 0) {
      filteredThreats = filteredThreats.filter(t => 
        filters.severity!.includes(t.severity)
      );
    }
    if (filters.regions && filters.regions.length > 0) {
      filteredThreats = filteredThreats.filter(t => 
        filters.regions!.includes(t.region)
      );
    }
    this.threatAlertsSubject.next(filteredThreats);
  }

  // Helper method to find vulnerability by ID
  private findVulnerabilityById(id: string): VulnerabilityDetail | null {
    for (const category of this.vulnerabilityData) {
      if (category.details) {
        const found = category.details.find(v => v.id === id);
        if (found) return found;
      }
    }
    return null;
  }

  // Method to refresh data (simulated)
  refreshData(): void {
    // In a real application, this would fetch fresh data from an API
    // For now, we'll just simulate by slightly modifying the existing data
    
    // Update vulnerability counts
    const updatedVulnerabilities = this.vulnerabilityData.map(v => ({
      ...v,
      count: Math.max(0, v.count + Math.floor(Math.random() * 7) - 3),
      trend: Math.floor(Math.random() * 10) - 5
    }));
    this.vulnerabilityData = updatedVulnerabilities;
    
    // Update security domain scores
    const updatedDomains = this.securityDomainsData.map(d => ({
      ...d,
      previousScore: d.score,
      score: Math.min(100, Math.max(0, d.score + Math.floor(Math.random() * 5) - 2)),
      issues: Math.max(0, d.issues + Math.floor(Math.random() * 3) - 1)
    }));
    this.securityDomainsData = updatedDomains;
    
    // Apply current filters to the updated data
    this.applyFilters();
  }
}
