import { Injectable, inject, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, combineLatest } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';

import {
  CorrelatedItem,
  CorrelationResult,
  CorrelationFilter,
  SecurityDomain,
  SeverityLevel,
  ItemRelationship,
  CTIItem,
  VIItem,
  ASMItem,
  SOARItem
} from '../models/correlation.model';
import { MicroserviceConnectorService, MicroserviceType } from '../../core/services/microservice-connector.service';

@Injectable({
  providedIn: 'root'
})
export class CorrelationService {
  private apiUrl = '/api/correlation';
  private correlationResultSubject = new BehaviorSubject<CorrelationResult | null>(null);
  private filterSubject = new BehaviorSubject<CorrelationFilter>({
    domains: [SecurityDomain.CTI, SecurityDomain.VI, SecurityDomain.ASM, SecurityDomain.SOAR],
    severities: [SeverityLevel.CRITICAL, SeverityLevel.HIGH]
  });

  // Expose observables
  correlationResult$ = this.correlationResultSubject.asObservable();
  filter$ = this.filterSubject.asObservable();

  constructor(
    private http: HttpClient,
    private microserviceConnector: MicroserviceConnectorService
  ) {
    // Initialize with default data
    this.refreshCorrelationData();

    // Subscribe to filter changes to refresh data
    this.filter$.subscribe(() => {
      this.refreshCorrelationData();
    });
  }

  /**
   * Set correlation filters
   */
  setFilter(filter: Partial<CorrelationFilter>): void {
    const currentFilter = this.filterSubject.value;
    this.filterSubject.next({
      ...currentFilter,
      ...filter
    });
  }

  /**
   * Refresh correlation data based on current filters
   */
  refreshCorrelationData(): void {
    const filter = this.filterSubject.value;

    if (isDevMode()) {
      // In development mode, use mock data
      const mockData = this.generateMockCorrelationData(filter);
      this.correlationResultSubject.next(mockData);
    } else {
      // In production, fetch from API
      this.http.post<CorrelationResult>(`${this.apiUrl}/analyze`, filter)
        .pipe(
          catchError(error => {
            console.error('Error fetching correlation data:', error);
            return of(this.generateMockCorrelationData(filter));
          })
        )
        .subscribe(result => {
          this.correlationResultSubject.next(result);
        });
    }
  }

  /**
   * Get correlated data for a specific item
   */
  getCorrelationsForItem(itemId: string): Observable<CorrelationResult> {
    if (isDevMode()) {
      // Generate mock correlations for this item
      const allData = this.correlationResultSubject.value;
      const item = allData?.items.find(i => i.id === itemId);

      if (!item) {
        return of({
          items: [],
          relationships: [],
          riskScore: 0,
          confidence: 0,
          generatedAt: new Date()
        });
      }

      // Find related items
      const relatedItems = allData?.items.filter(i =>
        i.id !== itemId &&
        allData.relationships.some(r =>
          (r.sourceId === itemId && r.targetId === i.id) ||
          (r.targetId === itemId && r.sourceId === i.id)
        )
      ) || [];

      // Find relationships
      const relationships = allData?.relationships.filter(r =>
        r.sourceId === itemId || r.targetId === itemId
      ) || [];

      return of({
        items: [item, ...relatedItems],
        relationships,
        riskScore: Math.floor(Math.random() * 100),
        confidence: Math.floor(Math.random() * 100),
        generatedAt: new Date()
      });
    } else {
      return this.http.get<CorrelationResult>(`${this.apiUrl}/item/${itemId}`)
        .pipe(
          catchError(error => {
            console.error(`Error fetching correlations for item ${itemId}:`, error);
            return of({
              items: [],
              relationships: [],
              riskScore: 0,
              confidence: 0,
              generatedAt: new Date()
            });
          })
        );
    }
  }

  /**
   * Generate mock correlation data for development
   */
  private generateMockCorrelationData(filter: CorrelationFilter): CorrelationResult {
    // Generate items based on selected domains
    const items: CorrelatedItem[] = [];
    const relationships: ItemRelationship[] = [];

    // Generate CTI items
    if (filter.domains.includes(SecurityDomain.CTI)) {
      const ctiItems = this.generateMockCTIItems(filter);
      items.push(...ctiItems);
    }

    // Generate VI items
    if (filter.domains.includes(SecurityDomain.VI)) {
      const viItems = this.generateMockVIItems(filter);
      items.push(...viItems);
    }

    // Generate ASM items
    if (filter.domains.includes(SecurityDomain.ASM)) {
      const asmItems = this.generateMockASMItems(filter);
      items.push(...asmItems);
    }

    // Generate SOAR items
    if (filter.domains.includes(SecurityDomain.SOAR)) {
      const soarItems = this.generateMockSOARItems(filter);
      items.push(...soarItems);
    }

    // Generate relationships between items
    for (let i = 0; i < items.length; i++) {
      // Each item has a 30% chance to be related to another random item
      const numRelationships = Math.floor(Math.random() * 3) + 1;

      for (let j = 0; j < numRelationships; j++) {
        const targetIndex = Math.floor(Math.random() * items.length);

        // Don't create self-relationships
        if (targetIndex !== i) {
          const confidence = Math.floor(Math.random() * 100);

          // Only add relationships that meet the minimum confidence threshold
          if (!filter.minConfidence || confidence >= filter.minConfidence) {
            relationships.push({
              sourceId: items[i].id,
              targetId: items[targetIndex].id,
              type: this.getRandomCorrelationType(),
              confidence,
              description: `Correlation between ${items[i].name} and ${items[targetIndex].name}`
            });
          }
        }
      }
    }

    return {
      items,
      relationships,
      riskScore: Math.floor(Math.random() * 100),
      confidence: Math.floor(Math.random() * 100),
      generatedAt: new Date()
    };
  }

  // Helper methods to generate mock data for each domain
  private generateMockCTIItems(filter: CorrelationFilter): CTIItem[] {
    const items: CTIItem[] = [];
    const threatTypes = ['Malware', 'Phishing', 'Ransomware', 'APT', 'DDoS'];
    const threatActors = ['APT29', 'Lazarus Group', 'Sandworm', 'Fancy Bear', 'Equation Group'];

    // Generate 5-10 CTI items
    const count = Math.floor(Math.random() * 6) + 5;

    for (let i = 0; i < count; i++) {
      const severity = this.getRandomSeverity(filter.severities);

      // Skip if severity doesn't match filter
      if (!severity) continue;

      items.push({
        id: `cti-${Date.now()}-${i}`,
        name: `Threat Alert ${i + 1}`,
        description: `Detected ${threatTypes[i % threatTypes.length]} activity targeting critical systems`,
        source: SecurityDomain.CTI,
        severity,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date in last week
        threatType: threatTypes[i % threatTypes.length],
        threatActors: [threatActors[Math.floor(Math.random() * threatActors.length)]],
        iocs: [
          {
            type: Math.random() > 0.5 ? 'ip' : 'domain',
            value: Math.random() > 0.5 ? `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` : `malicious-domain-${i}.com`,
            confidence: Math.floor(Math.random() * 40) + 60 // 60-100
          }
        ],
        ttps: [`T${1000 + Math.floor(Math.random() * 500)}`],
        mitreReferences: [`TA${1000 + Math.floor(Math.random() * 100)}`]
      });
    }

    return items;
  }

  private generateMockVIItems(filter: CorrelationFilter): VIItem[] {
    const items: VIItem[] = [];
    const assets = ['web-server-01', 'db-server-02', 'app-server-03', 'firewall-01', 'endpoint-125'];

    // Generate 5-10 VI items
    const count = Math.floor(Math.random() * 6) + 5;

    for (let i = 0; i < count; i++) {
      const severity = this.getRandomSeverity(filter.severities);

      // Skip if severity doesn't match filter
      if (!severity) continue;

      const cvssScore = severity === SeverityLevel.CRITICAL ? 9.0 + Math.random() :
                        severity === SeverityLevel.HIGH ? 7.0 + Math.random() * 2 :
                        severity === SeverityLevel.MEDIUM ? 4.0 + Math.random() * 3 :
                        1.0 + Math.random() * 3;

      items.push({
        id: `vi-${Date.now()}-${i}`,
        name: `Vulnerability ${i + 1}`,
        description: `${severity} vulnerability affecting system integrity`,
        source: SecurityDomain.VI,
        severity,
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last month
        cveId: `CVE-2023-${10000 + Math.floor(Math.random() * 5000)}`,
        cvssScore,
        affectedAssets: [assets[Math.floor(Math.random() * assets.length)]],
        patchAvailable: Math.random() > 0.3,
        exploitAvailable: Math.random() > 0.7
      });
    }

    return items;
  }

  private generateMockASMItems(filter: CorrelationFilter): ASMItem[] {
    const items: ASMItem[] = [];
    const assetTypes = ['server', 'endpoint', 'network_device', 'cloud_resource', 'application', 'database'];
    const discoveryMethods = ['Scan', 'API', 'Manual', 'Third-party', 'OSINT'];

    // Generate 5-10 ASM items
    const count = Math.floor(Math.random() * 6) + 5;

    for (let i = 0; i < count; i++) {
      const severity = this.getRandomSeverity(filter.severities);

      // Skip if severity doesn't match filter
      if (!severity) continue;

      const exposureLevel = severity === SeverityLevel.CRITICAL ? 80 + Math.random() * 20 :
                           severity === SeverityLevel.HIGH ? 60 + Math.random() * 20 :
                           severity === SeverityLevel.MEDIUM ? 40 + Math.random() * 20 :
                           10 + Math.random() * 30;

      const isExternal = Math.random() > 0.5;

      items.push({
        id: `asm-${Date.now()}-${i}`,
        name: `Asset ${i + 1}`,
        description: `${isExternal ? 'External' : 'Internal'} asset with ${severity} exposure level`,
        source: SecurityDomain.ASM,
        severity,
        timestamp: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000), // Random date in last 2 weeks
        assetType: assetTypes[Math.floor(Math.random() * assetTypes.length)] as any,
        exposureLevel,
        discoveryMethod: discoveryMethods[Math.floor(Math.random() * discoveryMethods.length)],
        isExternal
      });
    }

    return items;
  }

  private generateMockSOARItems(filter: CorrelationFilter): SOARItem[] {
    const items: SOARItem[] = [];
    const statuses = ['new', 'in_progress', 'pending', 'resolved', 'closed'];
    const playbooks = ['Malware Remediation', 'Phishing Response', 'Data Breach', 'Ransomware Recovery', 'Account Compromise'];
    const assignees = ['John Doe', 'Jane Smith', 'Alex Johnson', 'Sam Wilson', 'Taylor Green'];

    // Generate 5-10 SOAR items
    const count = Math.floor(Math.random() * 6) + 5;

    for (let i = 0; i < count; i++) {
      const severity = this.getRandomSeverity(filter.severities);

      // Skip if severity doesn't match filter
      if (!severity) continue;

      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const resolutionTime = status === 'resolved' || status === 'closed' ?
                            Math.floor(Math.random() * 1440) + 30 : // 30 min to 24 hours
                            undefined;

      items.push({
        id: `soar-${Date.now()}-${i}`,
        name: `Incident ${i + 1}`,
        description: `Security incident requiring ${severity} attention`,
        source: SecurityDomain.SOAR,
        severity,
        timestamp: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000), // Random date in last 10 days
        incidentId: `INC-${10000 + Math.floor(Math.random() * 5000)}`,
        status: status as any,
        playbooks: [playbooks[Math.floor(Math.random() * playbooks.length)]],
        assignedTo: assignees[Math.floor(Math.random() * assignees.length)],
        resolutionTime
      });
    }

    return items;
  }

  // Helper to get a random severity that matches the filter
  private getRandomSeverity(allowedSeverities: SeverityLevel[]): SeverityLevel | null {
    if (!allowedSeverities || allowedSeverities.length === 0) {
      return null;
    }

    return allowedSeverities[Math.floor(Math.random() * allowedSeverities.length)];
  }

  private getRandomCorrelationType() {
    const types = ['direct', 'indirect', 'potential', 'historical'];
    return types[Math.floor(Math.random() * types.length)] as any;
  }
}
