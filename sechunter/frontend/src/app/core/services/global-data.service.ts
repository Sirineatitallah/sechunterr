import { Injectable, inject, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError, timer, combineLatest } from 'rxjs';
import { catchError, map, tap, timeout, retry } from 'rxjs/operators';

// Interfaces for shared data types
export interface SecurityMetric {
  value: number;
  trend: number;
  history: number[];
}

export interface SecurityIncident {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'in-progress' | 'resolved';
  source: string;
  timestamp: Date;
  details?: string;
}

export interface SecurityAsset {
  id: string;
  name: string;
  type: string;
  status: 'secure' | 'vulnerable' | 'at-risk';
  lastScan?: Date;
  vulnerabilities?: number;
}

export interface SecurityThreat {
  id: string;
  title: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  source: string;
  timestamp: Date;
  iocs?: string[];
}

export interface SecurityVulnerability {
  id: string;
  title: string;
  cve?: string;
  cvss?: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  affectedAssets?: string[];
  status: 'open' | 'investigating' | 'in-progress' | 'resolved';
  discoveryDate: Date;
}

export interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
  timestamp: string;
  metadata?: {
    total?: number;
    page?: number;
    pageSize?: number;
    hasMore?: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class GlobalDataService {
  private http = inject(HttpClient);

  // API endpoints
  private readonly API_BASE_URL = '/api/security';
  private readonly INCIDENTS_ENDPOINT = `${this.API_BASE_URL}/incidents`;
  private readonly ASSETS_ENDPOINT = `${this.API_BASE_URL}/assets`;
  private readonly THREATS_ENDPOINT = `${this.API_BASE_URL}/threats`;
  private readonly VULNERABILITIES_ENDPOINT = `${this.API_BASE_URL}/vulnerabilities`;

  // Cache settings
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
  private lastFetchTime: Record<string, number> = {};
  private cache: Record<string, any> = {};

  // Loading and error states
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // BehaviorSubjects for different data types
  private incidentsSubject = new BehaviorSubject<SecurityIncident[]>([]);
  private assetsSubject = new BehaviorSubject<SecurityAsset[]>([]);
  private threatsSubject = new BehaviorSubject<SecurityThreat[]>([]);
  private vulnerabilitiesSubject = new BehaviorSubject<SecurityVulnerability[]>([]);

  // Observable streams
  public incidents$ = this.incidentsSubject.asObservable();
  public assets$ = this.assetsSubject.asObservable();
  public threats$ = this.threatsSubject.asObservable();
  public vulnerabilities$ = this.vulnerabilitiesSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor() {
    this.initializeData();
  }

  private initializeData(): void {
    this.loadingSubject.next(true);

    if (isDevMode()) {
      // In development mode, use mock data
      console.log('[DEV MODE] Using mock data for security entities');
      this.incidentsSubject.next(this.getMockIncidents());
      this.assetsSubject.next(this.getMockAssets());
      this.threatsSubject.next(this.getMockThreats());
      this.vulnerabilitiesSubject.next(this.getMockVulnerabilities());
      this.loadingSubject.next(false);
    } else {
      // In production, fetch from API
      this.fetchAllData();
    }
  }

  // Method to refresh all data
  refreshAllData(): void {
    if (isDevMode()) {
      this.initializeData();
    } else {
      this.fetchAllData(true); // Force refresh
    }
  }

  /**
   * Gets a specific incident by ID
   * @param id The incident ID to find
   * @returns The incident or undefined if not found
   */
  getIncidentById(id: string): Observable<SecurityIncident | undefined> {
    return this.incidents$.pipe(
      map(incidents => incidents.find(incident => incident.id === id))
    );
  }

  /**
   * Gets a specific asset by ID
   * @param id The asset ID to find
   * @returns The asset or undefined if not found
   */
  getAssetById(id: string): Observable<SecurityAsset | undefined> {
    return this.assets$.pipe(
      map(assets => assets.find(asset => asset.id === id))
    );
  }

  /**
   * Gets a specific threat by ID
   * @param id The threat ID to find
   * @returns The threat or undefined if not found
   */
  getThreatById(id: string): Observable<SecurityThreat | undefined> {
    return this.threats$.pipe(
      map(threats => threats.find(threat => threat.id === id))
    );
  }

  /**
   * Gets a specific vulnerability by ID
   * @param id The vulnerability ID to find
   * @returns The vulnerability or undefined if not found
   */
  getVulnerabilityById(id: string): Observable<SecurityVulnerability | undefined> {
    return this.vulnerabilities$.pipe(
      map(vulnerabilities => vulnerabilities.find(vulnerability => vulnerability.id === id))
    );
  }

  /**
   * Gets incidents filtered by severity
   * @param severity The severity to filter by
   * @returns Filtered incidents
   */
  getIncidentsBySeverity(severity: 'critical' | 'high' | 'medium' | 'low'): Observable<SecurityIncident[]> {
    return this.incidents$.pipe(
      map(incidents => incidents.filter(incident => incident.severity === severity))
    );
  }

  /**
   * Gets vulnerabilities filtered by severity
   * @param severity The severity to filter by
   * @returns Filtered vulnerabilities
   */
  getVulnerabilitiesBySeverity(severity: 'critical' | 'high' | 'medium' | 'low'): Observable<SecurityVulnerability[]> {
    return this.vulnerabilities$.pipe(
      map(vulnerabilities => vulnerabilities.filter(vulnerability => vulnerability.severity === severity))
    );
  }

  /**
   * Gets assets filtered by status
   * @param status The status to filter by
   * @returns Filtered assets
   */
  getAssetsByStatus(status: 'secure' | 'vulnerable' | 'at-risk'): Observable<SecurityAsset[]> {
    return this.assets$.pipe(
      map(assets => assets.filter(asset => asset.status === status))
    );
  }

  /**
   * Gets threats filtered by type
   * @param type The type to filter by
   * @returns Filtered threats
   */
  getThreatsByType(type: string): Observable<SecurityThreat[]> {
    return this.threats$.pipe(
      map(threats => threats.filter(threat => threat.type === type))
    );
  }

  /**
   * Gets vulnerabilities for a specific asset
   * @param assetId The asset ID to find vulnerabilities for
   * @returns Vulnerabilities affecting the asset
   */
  getVulnerabilitiesForAsset(assetId: string): Observable<SecurityVulnerability[]> {
    return this.vulnerabilities$.pipe(
      map(vulnerabilities =>
        vulnerabilities.filter(vulnerability =>
          vulnerability.affectedAssets?.includes(assetId)
        )
      )
    );
  }

  /**
   * Gets assets affected by a specific vulnerability
   * @param vulnerabilityId The vulnerability ID
   * @returns Assets affected by the vulnerability
   */
  getAssetsForVulnerability(vulnerabilityId: string): Observable<SecurityAsset[]> {
    return this.vulnerabilities$.pipe(
      map(vulnerabilities => {
        const vulnerability = vulnerabilities.find(v => v.id === vulnerabilityId);
        if (!vulnerability || !vulnerability.affectedAssets?.length) {
          return [];
        }
        return this.assetsSubject.value.filter(asset =>
          vulnerability.affectedAssets?.includes(asset.id)
        );
      })
    );
  }

  /**
   * Fetches all data from the API endpoints
   * @param forceRefresh Whether to bypass cache and force a refresh
   */
  private fetchAllData(forceRefresh: boolean = false): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    // Fetch incidents
    this.fetchIncidents(forceRefresh).subscribe({
      next: (incidents) => this.incidentsSubject.next(incidents),
      error: (error) => this.handleError('incidents', error)
    });

    // Fetch assets
    this.fetchAssets(forceRefresh).subscribe({
      next: (assets) => this.assetsSubject.next(assets),
      error: (error) => this.handleError('assets', error)
    });

    // Fetch threats
    this.fetchThreats(forceRefresh).subscribe({
      next: (threats) => this.threatsSubject.next(threats),
      error: (error) => this.handleError('threats', error)
    });

    // Fetch vulnerabilities
    this.fetchVulnerabilities(forceRefresh).subscribe({
      next: (vulnerabilities) => this.vulnerabilitiesSubject.next(vulnerabilities),
      error: (error) => this.handleError('vulnerabilities', error)
    });

    // Set loading to false after all requests are complete
    setTimeout(() => this.loadingSubject.next(false), 500);
  }

  /**
   * Fetches incidents from the API
   * @param forceRefresh Whether to bypass cache and force a refresh
   * @returns Observable of SecurityIncident array
   */
  private fetchIncidents(forceRefresh: boolean = false): Observable<SecurityIncident[]> {
    return this.fetchData<SecurityIncident[]>(
      this.INCIDENTS_ENDPOINT,
      'incidents',
      forceRefresh,
      this.transformIncidents.bind(this)
    );
  }

  /**
   * Fetches assets from the API
   * @param forceRefresh Whether to bypass cache and force a refresh
   * @returns Observable of SecurityAsset array
   */
  private fetchAssets(forceRefresh: boolean = false): Observable<SecurityAsset[]> {
    return this.fetchData<SecurityAsset[]>(
      this.ASSETS_ENDPOINT,
      'assets',
      forceRefresh,
      this.transformAssets.bind(this)
    );
  }

  /**
   * Fetches threats from the API
   * @param forceRefresh Whether to bypass cache and force a refresh
   * @returns Observable of SecurityThreat array
   */
  private fetchThreats(forceRefresh: boolean = false): Observable<SecurityThreat[]> {
    return this.fetchData<SecurityThreat[]>(
      this.THREATS_ENDPOINT,
      'threats',
      forceRefresh,
      this.transformThreats.bind(this)
    );
  }

  /**
   * Fetches vulnerabilities from the API
   * @param forceRefresh Whether to bypass cache and force a refresh
   * @returns Observable of SecurityVulnerability array
   */
  private fetchVulnerabilities(forceRefresh: boolean = false): Observable<SecurityVulnerability[]> {
    return this.fetchData<SecurityVulnerability[]>(
      this.VULNERABILITIES_ENDPOINT,
      'vulnerabilities',
      forceRefresh,
      this.transformVulnerabilities.bind(this)
    );
  }

  /**
   * Generic method to fetch data from an API endpoint with caching and error handling
   * @param endpoint The API endpoint to fetch data from
   * @param cacheKey The key to use for caching
   * @param forceRefresh Whether to bypass cache and force a refresh
   * @param transformFn Optional function to transform the data
   * @returns Observable of the requested data type
   */
  private fetchData<T>(
    endpoint: string,
    cacheKey: string,
    forceRefresh: boolean = false,
    transformFn?: (data: any) => T
  ): Observable<T> {
    // Check if we have cached data and it's not expired
    const now = Date.now();
    if (
      !forceRefresh &&
      this.cache[cacheKey] &&
      this.lastFetchTime[cacheKey] &&
      now - this.lastFetchTime[cacheKey] < this.CACHE_DURATION
    ) {
      console.log(`Using cached data for ${cacheKey}`);
      return of(this.cache[cacheKey] as T);
    }

    // Fetch fresh data from API
    return this.http.get<ApiResponse<T>>(endpoint).pipe(
      timeout(30000), // 30 seconds timeout
      map(response => {
        if (response.status === 'error') {
          throw new Error(response.message || `Error fetching ${cacheKey}`);
        }
        return response.data;
      }),
      map(data => transformFn ? transformFn(data) : data),
      tap(data => {
        // Update cache
        this.cache[cacheKey] = data;
        this.lastFetchTime[cacheKey] = now;
      }),
      // Retry up to 3 times with exponential backoff
      retry({
        count: 3,
        delay: (_error, retryCount) => {
          console.log(`Retrying ${cacheKey} fetch (${retryCount}/3)...`);
          return timer(Math.pow(2, retryCount) * 1000); // Exponential backoff
        }
      }),
      catchError(error => {
        console.error(`Error fetching ${cacheKey}:`, error);
        // If we have cached data, return that instead of failing
        if (this.cache[cacheKey]) {
          console.log(`Falling back to cached data for ${cacheKey}`);
          return of(this.cache[cacheKey] as T);
        }
        // Otherwise, return mock data in development mode
        if (isDevMode()) {
          console.log(`Falling back to mock data for ${cacheKey}`);
          let mockData: any;
          switch (cacheKey) {
            case 'incidents':
              mockData = this.getMockIncidents();
              break;
            case 'assets':
              mockData = this.getMockAssets();
              break;
            case 'threats':
              mockData = this.getMockThreats();
              break;
            case 'vulnerabilities':
              mockData = this.getMockVulnerabilities();
              break;
            default:
              mockData = [];
          }
          return of(mockData as T);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Handles errors from API requests
   * @param dataType The type of data that failed to fetch
   * @param error The error object
   */
  private handleError(dataType: string, error: any): void {
    // Extract meaningful error message
    let errorMessage = `Failed to fetch ${dataType}`;

    if (error.message) {
      errorMessage = error.message;
    } else if (error.status) {
      // Handle HTTP errors
      switch (error.status) {
        case 401:
          errorMessage = 'Authentication required. Please log in again.';
          break;
        case 403:
          errorMessage = 'You do not have permission to access this data.';
          break;
        case 404:
          errorMessage = `${dataType.charAt(0).toUpperCase() + dataType.slice(1)} data not found.`;
          break;
        case 500:
          errorMessage = 'Server error occurred. Please try again later.';
          break;
        case 503:
          errorMessage = 'Service unavailable. Please try again later.';
          break;
        default:
          errorMessage = `Error (${error.status}): ${error.statusText || 'Unknown error'}`;
      }
    } else if (error.name === 'TimeoutError') {
      errorMessage = 'Request timed out. Please check your connection and try again.';
    }

    // Log the error with context
    console.error(`Error fetching ${dataType}:`, {
      message: errorMessage,
      originalError: error,
      timestamp: new Date().toISOString(),
      dataType
    });

    // Update the error subject
    this.errorSubject.next(errorMessage);

    // Track error for analytics (in a real app, this would send to a monitoring service)
    this.trackError(dataType, errorMessage, error);
  }

  /**
   * Tracks errors for analytics purposes
   * @param dataType The type of data that failed to fetch
   * @param message The error message
   * @param error The original error object
   */
  private trackError(dataType: string, message: string, error: any): void {
    // In a real application, this would send the error to a monitoring service
    // like Sentry, LogRocket, or Google Analytics
    if (isDevMode()) {
      console.info('Error tracking:', {
        type: 'api_error',
        dataType,
        message,
        timestamp: new Date().toISOString(),
        // Include only necessary information from the error
        status: error.status,
        name: error.name,
        // Don't include stack traces or sensitive information in production
        stack: error.stack
      });
    } else {
      // In production, we would send this to a real error tracking service
      // errorTrackingService.captureError({
      //   type: 'api_error',
      //   dataType,
      //   message,
      //   status: error.status,
      //   name: error.name
      // });
    }
  }

  /**
   * Transforms incident data from the API to match our interface
   * @param data The raw incident data from the API
   * @returns Transformed SecurityIncident array
   */
  private transformIncidents(data: any[]): SecurityIncident[] {
    // Handle null or undefined data
    if (!data || !Array.isArray(data)) {
      console.warn('Invalid incident data received:', data);
      return [];
    }

    return data.map(item => {
      // Skip invalid items
      if (!item || typeof item !== 'object') {
        console.warn('Invalid incident item:', item);
        return null;
      }

      try {
        return {
          id: this.normalizeId(item.id, 'INC'),
          title: this.normalizeString(item.title || item.name, 'Unknown Incident'),
          severity: this.normalizeSeverity(item.severity),
          status: this.normalizeStatus(item.status),
          source: this.normalizeString(item.source, 'Unknown'),
          timestamp: this.normalizeDate(item.timestamp || item.date),
          details: this.normalizeString(item.details || item.description)
        };
      } catch (error) {
        console.error('Error transforming incident:', error, item);
        // Return a default incident as fallback
        return {
          id: `INC-ERROR-${Date.now()}`,
          title: 'Error Processing Incident',
          severity: 'medium',
          status: 'open',
          source: 'System',
          timestamp: new Date(),
          details: 'An error occurred while processing this incident data.'
        };
      }
    }).filter(Boolean) as SecurityIncident[]; // Filter out null items
  }

  /**
   * Transforms asset data from the API to match our interface
   * @param data The raw asset data from the API
   * @returns Transformed SecurityAsset array
   */
  private transformAssets(data: any[]): SecurityAsset[] {
    // Handle null or undefined data
    if (!data || !Array.isArray(data)) {
      console.warn('Invalid asset data received:', data);
      return [];
    }

    return data.map(item => {
      // Skip invalid items
      if (!item || typeof item !== 'object') {
        console.warn('Invalid asset item:', item);
        return null;
      }

      try {
        return {
          id: this.normalizeId(item.id, 'AST'),
          name: this.normalizeString(item.name, 'Unknown Asset'),
          type: this.normalizeString(item.type, 'unknown'),
          status: this.normalizeAssetStatus(item.status),
          lastScan: item.lastScan ? this.normalizeDate(item.lastScan) : undefined,
          vulnerabilities: this.normalizeNumber(item.vulnerabilities, 0)
        };
      } catch (error) {
        console.error('Error transforming asset:', error, item);
        // Return a default asset as fallback
        return {
          id: `AST-ERROR-${Date.now()}`,
          name: 'Error Processing Asset',
          type: 'unknown',
          status: 'at-risk',
          lastScan: new Date(),
          vulnerabilities: 0
        };
      }
    }).filter(Boolean) as SecurityAsset[]; // Filter out null items
  }

  /**
   * Transforms threat data from the API to match our interface
   * @param data The raw threat data from the API
   * @returns Transformed SecurityThreat array
   */
  private transformThreats(data: any[]): SecurityThreat[] {
    // Handle null or undefined data
    if (!data || !Array.isArray(data)) {
      console.warn('Invalid threat data received:', data);
      return [];
    }

    return data.map(item => {
      // Skip invalid items
      if (!item || typeof item !== 'object') {
        console.warn('Invalid threat item:', item);
        return null;
      }

      try {
        return {
          id: this.normalizeId(item.id, 'THR'),
          title: this.normalizeString(item.title || item.name, 'Unknown Threat'),
          type: this.normalizeString(item.type, 'unknown'),
          severity: this.normalizeSeverity(item.severity),
          source: this.normalizeString(item.source, 'Unknown'),
          timestamp: this.normalizeDate(item.timestamp || item.date),
          iocs: this.normalizeStringArray(item.iocs)
        };
      } catch (error) {
        console.error('Error transforming threat:', error, item);
        // Return a default threat as fallback
        return {
          id: `THR-ERROR-${Date.now()}`,
          title: 'Error Processing Threat',
          type: 'unknown',
          severity: 'medium',
          source: 'System',
          timestamp: new Date(),
          iocs: []
        };
      }
    }).filter(Boolean) as SecurityThreat[]; // Filter out null items
  }

  /**
   * Transforms vulnerability data from the API to match our interface
   * @param data The raw vulnerability data from the API
   * @returns Transformed SecurityVulnerability array
   */
  private transformVulnerabilities(data: any[]): SecurityVulnerability[] {
    // Handle null or undefined data
    if (!data || !Array.isArray(data)) {
      console.warn('Invalid vulnerability data received:', data);
      return [];
    }

    return data.map(item => {
      // Skip invalid items
      if (!item || typeof item !== 'object') {
        console.warn('Invalid vulnerability item:', item);
        return null;
      }

      try {
        return {
          id: this.normalizeId(item.id, 'VUL'),
          title: this.normalizeString(item.title || item.name, 'Unknown Vulnerability'),
          cve: this.normalizeString(item.cve || item.cveId),
          cvss: this.normalizeNumber(item.cvss || item.cvssScore, 0),
          severity: this.normalizeSeverity(item.severity),
          affectedAssets: this.normalizeStringArray(item.affectedAssets),
          status: this.normalizeStatus(item.status),
          discoveryDate: this.normalizeDate(item.discoveryDate || item.date)
        };
      } catch (error) {
        console.error('Error transforming vulnerability:', error, item);
        // Return a default vulnerability as fallback
        return {
          id: `VUL-ERROR-${Date.now()}`,
          title: 'Error Processing Vulnerability',
          severity: 'medium',
          status: 'open',
          affectedAssets: [],
          discoveryDate: new Date()
        };
      }
    }).filter(Boolean) as SecurityVulnerability[]; // Filter out null items
  }

  /**
   * Normalizes an ID value, ensuring it has the correct prefix
   * @param id The ID to normalize
   * @param prefix The prefix to use (e.g., 'INC', 'AST')
   * @returns Normalized ID
   */
  private normalizeId(id: any, prefix: string): string {
    if (!id) {
      return `${prefix}-${Math.floor(Math.random() * 10000)}`;
    }

    const idStr = String(id).trim();

    // If the ID already has the correct prefix, return it
    if (idStr.startsWith(`${prefix}-`)) {
      return idStr;
    }

    // If it's a numeric ID, add the prefix
    if (/^\d+$/.test(idStr)) {
      return `${prefix}-${idStr}`;
    }

    // If it has another prefix, replace it
    if (/^[A-Z]+-\d+$/.test(idStr)) {
      return `${prefix}-${idStr.split('-')[1]}`;
    }

    // Otherwise, use the ID as is
    return idStr;
  }

  /**
   * Normalizes a string value
   * @param value The string to normalize
   * @param defaultValue Optional default value if the input is invalid
   * @returns Normalized string
   */
  private normalizeString(value: any, defaultValue: string = ''): string {
    if (value === null || value === undefined) {
      return defaultValue;
    }

    if (typeof value === 'string') {
      return value.trim() || defaultValue;
    }

    // Convert non-string values to string
    return String(value);
  }

  /**
   * Normalizes a number value
   * @param value The number to normalize
   * @param defaultValue Default value if the input is invalid
   * @returns Normalized number
   */
  private normalizeNumber(value: any, defaultValue: number = 0): number {
    if (value === null || value === undefined) {
      return defaultValue;
    }

    if (typeof value === 'number' && !isNaN(value)) {
      return value;
    }

    // Try to convert string to number
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  }

  /**
   * Normalizes a date value
   * @param value The date to normalize
   * @returns Normalized Date object
   */
  private normalizeDate(value: any): Date {
    if (!value) {
      return new Date();
    }

    if (value instanceof Date) {
      return value;
    }

    // Try to parse the date
    try {
      const date = new Date(value);
      // Check if the date is valid
      return isNaN(date.getTime()) ? new Date() : date;
    } catch (error) {
      console.warn('Invalid date value:', value);
      return new Date();
    }
  }

  /**
   * Normalizes an array of strings
   * @param value The array to normalize
   * @returns Normalized string array
   */
  private normalizeStringArray(value: any): string[] {
    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value.map(item => this.normalizeString(item)).filter(Boolean);
    }

    // If it's a single value, convert to array
    return [this.normalizeString(value)].filter(Boolean);
  }

  /**
   * Calculates security metrics based on the current data
   * @returns Observable of SecurityMetric objects for different categories
   */
  public calculateSecurityMetrics(): Observable<Record<string, SecurityMetric>> {
    return this.vulnerabilities$.pipe(
      map(vulnerabilities => {
        // Count vulnerabilities by severity
        const criticalCount = vulnerabilities.filter(v => v.severity === 'critical').length;
        const highCount = vulnerabilities.filter(v => v.severity === 'high').length;
        const mediumCount = vulnerabilities.filter(v => v.severity === 'medium').length;
        const lowCount = vulnerabilities.filter(v => v.severity === 'low').length;

        // Calculate total risk score (weighted by severity)
        const totalRiskScore = (criticalCount * 10) + (highCount * 5) + (mediumCount * 2) + lowCount;

        // Generate random history data for demo purposes
        // In a real app, this would come from historical data
        const generateHistory = (count: number): number[] => {
          const result = [];
          let lastValue = count;
          for (let i = 0; i < 10; i++) {
            // Generate a value that's within 20% of the previous value
            const change = Math.floor(lastValue * 0.2 * (Math.random() > 0.5 ? 1 : -1));
            lastValue = Math.max(0, lastValue + change);
            result.unshift(lastValue); // Add to beginning for chronological order
          }
          return result;
        };

        // Calculate trends (positive number means increasing vulnerabilities - negative trend)
        const calculateTrend = (history: number[]): number => {
          if (history.length < 2) return 0;
          const current = history[history.length - 1];
          const previous = history[history.length - 2];
          return previous === 0 ? 0 : Math.round(((current - previous) / previous) * 100);
        };

        // Create metrics for each severity level
        const criticalHistory = generateHistory(criticalCount);
        const highHistory = generateHistory(highCount);
        const mediumHistory = generateHistory(mediumCount);
        const lowHistory = generateHistory(lowCount);

        return {
          critical: {
            value: criticalCount,
            trend: calculateTrend(criticalHistory),
            history: criticalHistory
          },
          high: {
            value: highCount,
            trend: calculateTrend(highHistory),
            history: highHistory
          },
          medium: {
            value: mediumCount,
            trend: calculateTrend(mediumHistory),
            history: mediumHistory
          },
          low: {
            value: lowCount,
            trend: calculateTrend(lowHistory),
            history: lowHistory
          },
          total: {
            value: vulnerabilities.length,
            trend: calculateTrend([...criticalHistory, ...highHistory, ...mediumHistory, ...lowHistory]),
            history: generateHistory(vulnerabilities.length)
          },
          riskScore: {
            value: totalRiskScore,
            trend: -5, // Negative trend is good for risk score (decreasing risk)
            history: generateHistory(totalRiskScore)
          }
        };
      })
    );
  }

  /**
   * Analyzes the correlation between assets and vulnerabilities
   * @returns Observable of correlation data
   */
  public analyzeAssetVulnerabilityCorrelation(): Observable<{
    correlationData: Array<{
      type: string;
      total: number;
      critical: number;
      high: number;
      medium: number;
      low: number;
    }>;
    mostVulnerableAssetType: { type: string; count: number; severity: string };
    leastVulnerableAssetType: { type: string; count: number };
    riskByAssetType: Array<{ type: string; riskScore: number; riskLevel: string }>;
  }> {
    return combineLatest([this.assets$, this.vulnerabilities$]).pipe(
      map(([assets, vulnerabilities]) => {
        // Create a map of asset types to vulnerability counts
        const assetTypeVulnerabilityMap: Record<string, { total: number; critical: number; high: number; medium: number; low: number }> = {};

        // Initialize the map with all asset types
        assets.forEach((asset: SecurityAsset) => {
          const type = asset.type || 'unknown';
          if (!assetTypeVulnerabilityMap[type]) {
            assetTypeVulnerabilityMap[type] = { total: 0, critical: 0, high: 0, medium: 0, low: 0 };
          }
        });

        // Count vulnerabilities by asset type and severity
        vulnerabilities.forEach((vulnerability: SecurityVulnerability) => {
          if (!vulnerability.affectedAssets?.length) return;

          vulnerability.affectedAssets.forEach((assetId: string) => {
            const asset = assets.find((a: SecurityAsset) => a.id === assetId);
            if (!asset) return;

            const type = asset.type || 'unknown';
            if (!assetTypeVulnerabilityMap[type]) {
              assetTypeVulnerabilityMap[type] = { total: 0, critical: 0, high: 0, medium: 0, low: 0 };
            }

            assetTypeVulnerabilityMap[type].total++;

            switch (vulnerability.severity) {
              case 'critical':
                assetTypeVulnerabilityMap[type].critical++;
                break;
              case 'high':
                assetTypeVulnerabilityMap[type].high++;
                break;
              case 'medium':
                assetTypeVulnerabilityMap[type].medium++;
                break;
              case 'low':
                assetTypeVulnerabilityMap[type].low++;
                break;
            }
          });
        });

        // Convert the map to an array for easier consumption by charts
        const correlationData = Object.entries(assetTypeVulnerabilityMap).map(([type, counts]) => ({
          type,
          ...counts
        }));

        return {
          correlationData,
          mostVulnerableAssetType: this.findMostVulnerableAssetType(correlationData),
          leastVulnerableAssetType: this.findLeastVulnerableAssetType(correlationData),
          riskByAssetType: this.calculateRiskByAssetType(correlationData)
        };
      })
    );
  }

  /**
   * Finds the most vulnerable asset type based on correlation data
   * @param correlationData The correlation data to analyze
   * @returns The most vulnerable asset type
   */
  private findMostVulnerableAssetType(correlationData: any[]): { type: string; count: number; severity: string } {
    if (!correlationData.length) {
      return { type: 'unknown', count: 0, severity: 'low' };
    }

    // Sort by critical, then high, then medium, then total
    const sorted = [...correlationData].sort((a, b) => {
      if (a.critical !== b.critical) return b.critical - a.critical;
      if (a.high !== b.high) return b.high - a.high;
      if (a.medium !== b.medium) return b.medium - a.medium;
      return b.total - a.total;
    });

    const mostVulnerable = sorted[0];
    let severity = 'low';

    if (mostVulnerable.critical > 0) {
      severity = 'critical';
    } else if (mostVulnerable.high > 0) {
      severity = 'high';
    } else if (mostVulnerable.medium > 0) {
      severity = 'medium';
    }

    return {
      type: mostVulnerable.type,
      count: mostVulnerable.total,
      severity
    };
  }

  /**
   * Finds the least vulnerable asset type based on correlation data
   * @param correlationData The correlation data to analyze
   * @returns The least vulnerable asset type
   */
  private findLeastVulnerableAssetType(correlationData: any[]): { type: string; count: number } {
    if (!correlationData.length) {
      return { type: 'unknown', count: 0 };
    }

    // Filter out types with no assets
    const typesWithAssets = correlationData.filter(item => item.total > 0);

    // If all types have no vulnerabilities, return the first one
    if (typesWithAssets.length === 0) {
      return { type: correlationData[0].type, count: 0 };
    }

    // Sort by total vulnerabilities (ascending)
    const sorted = [...typesWithAssets].sort((a, b) => a.total - b.total);

    return {
      type: sorted[0].type,
      count: sorted[0].total
    };
  }

  /**
   * Calculates risk scores by asset type
   * @param correlationData The correlation data to analyze
   * @returns Risk scores by asset type
   */
  private calculateRiskByAssetType(correlationData: any[]): any[] {
    return correlationData.map(item => {
      // Calculate weighted risk score
      const riskScore = (item.critical * 10) + (item.high * 5) + (item.medium * 2) + item.low;

      // Determine risk level
      let riskLevel = 'low';
      if (riskScore > 50) {
        riskLevel = 'critical';
      } else if (riskScore > 20) {
        riskLevel = 'high';
      } else if (riskScore > 10) {
        riskLevel = 'medium';
      }

      return {
        type: item.type,
        riskScore,
        riskLevel
      };
    });
  }

  /**
   * Analyzes vulnerability trends over time
   * @param days Number of days to analyze (default: 30)
   * @returns Observable of trend analysis data
   */
  public analyzeVulnerabilityTrends(days: number = 30): Observable<{
    dailyTrends: Array<{ date: string; count: number; critical: number; high: number; medium: number; low: number }>;
    weeklyTrends: Array<{ week: string; count: number; critical: number; high: number; medium: number; low: number }>;
    monthlyTrends: Array<{ month: string; count: number; critical: number; high: number; medium: number; low: number }>;
    overallTrend: 'increasing' | 'decreasing' | 'stable';
    percentageChange: number;
  }> {
    return this.vulnerabilities$.pipe(
      map(vulnerabilities => {
        // In a real application, we would use actual historical data
        // For this demo, we'll generate synthetic data based on the current vulnerabilities

        // Generate dates for the past N days
        const dates: Date[] = [];
        const today = new Date();
        for (let i = 0; i < days; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          dates.unshift(date); // Add to beginning for chronological order
        }

        // Generate daily vulnerability counts with some randomness
        const dailyTrends = dates.map(date => {
          // Base the counts on the current data with some random variation
          const totalCount = vulnerabilities.length;
          const randomFactor = 0.8 + (Math.random() * 0.4); // Between 0.8 and 1.2
          const count = Math.round(totalCount * randomFactor);

          // Calculate severity distributions similar to current data
          const criticalRatio = vulnerabilities.filter(v => v.severity === 'critical').length / totalCount;
          const highRatio = vulnerabilities.filter(v => v.severity === 'high').length / totalCount;
          const mediumRatio = vulnerabilities.filter(v => v.severity === 'medium').length / totalCount;
          const lowRatio = vulnerabilities.filter(v => v.severity === 'low').length / totalCount;

          return {
            date: date.toISOString().split('T')[0], // YYYY-MM-DD format
            count,
            critical: Math.round(count * criticalRatio),
            high: Math.round(count * highRatio),
            medium: Math.round(count * mediumRatio),
            low: Math.round(count * lowRatio)
          };
        });

        // Calculate weekly trends by aggregating daily data
        const weeklyTrends = this.aggregateByWeek(dailyTrends);

        // Calculate monthly trends by aggregating daily data
        const monthlyTrends = this.aggregateByMonth(dailyTrends);

        // Calculate overall trend
        const firstWeek = weeklyTrends[0]?.count || 0;
        const lastWeek = weeklyTrends[weeklyTrends.length - 1]?.count || 0;
        const percentageChange = firstWeek === 0 ? 0 : ((lastWeek - firstWeek) / firstWeek) * 100;

        let overallTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
        if (percentageChange > 5) {
          overallTrend = 'increasing';
        } else if (percentageChange < -5) {
          overallTrend = 'decreasing';
        }

        return {
          dailyTrends,
          weeklyTrends,
          monthlyTrends,
          overallTrend,
          percentageChange
        };
      })
    );
  }

  /**
   * Aggregates daily data into weekly trends
   * @param dailyData The daily trend data
   * @returns Weekly aggregated data
   */
  private aggregateByWeek(dailyData: Array<{ date: string; count: number; critical: number; high: number; medium: number; low: number }>): Array<{ week: string; count: number; critical: number; high: number; medium: number; low: number }> {
    const weeklyData: Record<string, { count: number; critical: number; high: number; medium: number; low: number; days: number }> = {};

    dailyData.forEach(day => {
      const date = new Date(day.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Set to Sunday
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { count: 0, critical: 0, high: 0, medium: 0, low: 0, days: 0 };
      }

      weeklyData[weekKey].count += day.count;
      weeklyData[weekKey].critical += day.critical;
      weeklyData[weekKey].high += day.high;
      weeklyData[weekKey].medium += day.medium;
      weeklyData[weekKey].low += day.low;
      weeklyData[weekKey].days++;
    });

    // Convert to array and calculate averages
    return Object.entries(weeklyData).map(([week, data]) => ({
      week,
      count: Math.round(data.count / data.days),
      critical: Math.round(data.critical / data.days),
      high: Math.round(data.high / data.days),
      medium: Math.round(data.medium / data.days),
      low: Math.round(data.low / data.days)
    })).sort((a, b) => a.week.localeCompare(b.week));
  }

  /**
   * Aggregates daily data into monthly trends
   * @param dailyData The daily trend data
   * @returns Monthly aggregated data
   */
  private aggregateByMonth(dailyData: Array<{ date: string; count: number; critical: number; high: number; medium: number; low: number }>): Array<{ month: string; count: number; critical: number; high: number; medium: number; low: number }> {
    const monthlyData: Record<string, { count: number; critical: number; high: number; medium: number; low: number; days: number }> = {};

    dailyData.forEach(day => {
      const monthKey = day.date.substring(0, 7); // YYYY-MM format

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { count: 0, critical: 0, high: 0, medium: 0, low: 0, days: 0 };
      }

      monthlyData[monthKey].count += day.count;
      monthlyData[monthKey].critical += day.critical;
      monthlyData[monthKey].high += day.high;
      monthlyData[monthKey].medium += day.medium;
      monthlyData[monthKey].low += day.low;
      monthlyData[monthKey].days++;
    });

    // Convert to array and calculate averages
    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      count: Math.round(data.count / data.days),
      critical: Math.round(data.critical / data.days),
      high: Math.round(data.high / data.days),
      medium: Math.round(data.medium / data.days),
      low: Math.round(data.low / data.days)
    })).sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * Normalizes severity values to match our interface
   * @param severity The severity value to normalize
   * @returns Normalized severity value
   */
  private normalizeSeverity(severity: any): 'critical' | 'high' | 'medium' | 'low' {
    if (!severity) return 'medium';

    const severityStr = String(severity).toLowerCase();

    if (severityStr.includes('crit')) return 'critical';
    if (severityStr.includes('high') || severityStr.includes('important')) return 'high';
    if (severityStr.includes('med') || severityStr.includes('moderate')) return 'medium';
    if (severityStr.includes('low') || severityStr.includes('minor')) return 'low';

    // Handle numeric severities (e.g., CVSS scores)
    const severityNum = parseFloat(severityStr);
    if (!isNaN(severityNum)) {
      if (severityNum >= 9) return 'critical';
      if (severityNum >= 7) return 'high';
      if (severityNum >= 4) return 'medium';
      return 'low';
    }

    return 'medium'; // Default
  }

  /**
   * Normalizes status values to match our interface
   * @param status The status value to normalize
   * @returns Normalized status value
   */
  private normalizeStatus(status: any): 'open' | 'investigating' | 'in-progress' | 'resolved' {
    if (!status) return 'open';

    const statusStr = String(status).toLowerCase();

    if (statusStr.includes('open') || statusStr.includes('new')) return 'open';
    if (statusStr.includes('invest') || statusStr.includes('triage')) return 'investigating';
    if (statusStr.includes('progress') || statusStr.includes('active') || statusStr.includes('working')) return 'in-progress';
    if (statusStr.includes('resolv') || statusStr.includes('close') || statusStr.includes('done') || statusStr.includes('fixed')) return 'resolved';

    return 'open'; // Default
  }

  /**
   * Normalizes asset status values to match our interface
   * @param status The status value to normalize
   * @returns Normalized asset status value
   */
  private normalizeAssetStatus(status: any): 'secure' | 'vulnerable' | 'at-risk' {
    if (!status) return 'at-risk';

    const statusStr = String(status).toLowerCase();

    if (statusStr.includes('secure') || statusStr.includes('safe') || statusStr.includes('protected')) return 'secure';
    if (statusStr.includes('vuln') || statusStr.includes('risk')) return 'vulnerable';
    if (statusStr.includes('at-risk') || statusStr.includes('exposed')) return 'at-risk';

    return 'at-risk'; // Default
  }

  // Mock data generators
  private getMockIncidents(): SecurityIncident[] {
    return [
      {
        id: 'INC-1024',
        title: 'Tentative d\'accès non autorisé au serveur de production',
        severity: 'critical',
        status: 'investigating',
        source: 'SIEM',
        timestamp: new Date(Date.now() - 84 * 60000), // 84 minutes ago
        details: 'Multiple failed login attempts detected from suspicious IP addresses'
      },
      {
        id: 'INC-1023',
        title: 'Alerte de malware détectée sur poste de travail',
        severity: 'high',
        status: 'in-progress',
        source: 'EDR',
        timestamp: new Date(Date.now() - 135 * 60000), // 135 minutes ago
        details: 'Trojan detected on workstation DEV-042, quarantined but further investigation needed'
      },
      {
        id: 'INC-1022',
        title: 'Activité suspecte sur compte administrateur',
        severity: 'medium',
        status: 'open',
        source: 'IAM',
        timestamp: new Date(Date.now() - 222 * 60000), // 222 minutes ago
        details: 'Unusual login pattern detected for admin account from new location'
      },
      {
        id: 'INC-1021',
        title: 'Tentative de phishing détectée',
        severity: 'high',
        status: 'in-progress',
        source: 'Email Gateway',
        timestamp: new Date(Date.now() - 250 * 60000), // 250 minutes ago
        details: 'Sophisticated phishing campaign targeting finance department'
      },
      {
        id: 'INC-1020',
        title: 'Anomalie de trafic réseau détectée',
        severity: 'medium',
        status: 'investigating',
        source: 'NDR',
        timestamp: new Date(Date.now() - 335 * 60000), // 335 minutes ago
        details: 'Unusual outbound traffic pattern detected to unknown IP ranges'
      }
    ];
  }

  private getMockAssets(): SecurityAsset[] {
    return [
      {
        id: 'SRV-001',
        name: 'Production Web Server',
        type: 'server',
        status: 'vulnerable',
        lastScan: new Date(Date.now() - 24 * 60 * 60000), // 1 day ago
        vulnerabilities: 3
      },
      {
        id: 'APP-042',
        name: 'Customer Portal',
        type: 'application',
        status: 'at-risk',
        lastScan: new Date(Date.now() - 3 * 24 * 60 * 60000), // 3 days ago
        vulnerabilities: 7
      },
      {
        id: 'CLD-103',
        name: 'AWS S3 Storage',
        type: 'cloud',
        status: 'secure',
        lastScan: new Date(Date.now() - 12 * 60 * 60000), // 12 hours ago
        vulnerabilities: 0
      },
      {
        id: 'END-287',
        name: 'Finance Department Workstation',
        type: 'endpoint',
        status: 'vulnerable',
        lastScan: new Date(Date.now() - 2 * 24 * 60 * 60000), // 2 days ago
        vulnerabilities: 2
      },
      {
        id: 'NET-056',
        name: 'Primary Firewall',
        type: 'network',
        status: 'secure',
        lastScan: new Date(Date.now() - 6 * 60 * 60000), // 6 hours ago
        vulnerabilities: 0
      }
    ];
  }

  private getMockThreats(): SecurityThreat[] {
    return [
      {
        id: 'THR-001',
        title: 'Campagne de phishing ciblant le secteur financier',
        type: 'phishing',
        severity: 'high',
        source: 'OSINT',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60000), // 2 days ago
        iocs: ['domain.malicious.com', '192.168.1.100', 'malware.exe']
      },
      {
        id: 'THR-002',
        title: 'Nouvelle variante de ransomware détectée',
        type: 'ransomware',
        severity: 'critical',
        source: 'Darkweb',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60000), // 3 days ago
        iocs: ['ransom.exe', '2a7f1e3b5d8c9a6f4e2d1b3a5c7f9e8d']
      },
      {
        id: 'THR-003',
        title: 'Attaque DDoS contre infrastructure cloud',
        type: 'ddos',
        severity: 'medium',
        source: 'Partenaire',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60000), // 4 days ago
        iocs: ['botnet.command.net', '10.20.30.40']
      },
      {
        id: 'THR-004',
        title: 'Malware ciblant les systèmes industriels',
        type: 'malware',
        severity: 'high',
        source: 'Analyse interne',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60000), // 5 days ago
        iocs: ['scada.exploit.dll', '3c5a7b9d1e8f2a4c6b3d5e7a9c1b3f5d']
      },
      {
        id: 'THR-005',
        title: 'Activité APT détectée dans le secteur énergétique',
        type: 'apt',
        severity: 'critical',
        source: 'Renseignement',
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60000), // 6 days ago
        iocs: ['apt.backdoor.exe', 'c2.server.net', '5e7a9c1b3f5d3c5a7b9d1e8f2a4c6b3d']
      }
    ];
  }

  private getMockVulnerabilities(): SecurityVulnerability[] {
    return [
      {
        id: 'VUL-001',
        title: 'Exécution de code à distance dans Microsoft Exchange',
        cve: 'CVE-2023-23397',
        cvss: 9.8,
        severity: 'critical',
        affectedAssets: ['SRV-001', 'SRV-002'],
        status: 'open',
        discoveryDate: new Date(Date.now() - 7 * 24 * 60 * 60000) // 7 days ago
      },
      {
        id: 'VUL-002',
        title: 'Vulnérabilité d\'élévation de privilèges dans Linux Kernel',
        cve: 'CVE-2023-0386',
        cvss: 8.4,
        severity: 'high',
        affectedAssets: ['SRV-003', 'SRV-004', 'SRV-005'],
        status: 'in-progress',
        discoveryDate: new Date(Date.now() - 10 * 24 * 60 * 60000) // 10 days ago
      },
      {
        id: 'VUL-003',
        title: 'Faille de sécurité dans Apache Log4j',
        cve: 'CVE-2021-44228',
        cvss: 10.0,
        severity: 'critical',
        affectedAssets: ['APP-042', 'APP-043'],
        status: 'in-progress',
        discoveryDate: new Date(Date.now() - 14 * 24 * 60 * 60000) // 14 days ago
      },
      {
        id: 'VUL-004',
        title: 'Vulnérabilité dans OpenSSL',
        cve: 'CVE-2022-3786',
        cvss: 7.5,
        severity: 'high',
        affectedAssets: ['SRV-001', 'APP-042', 'APP-044'],
        status: 'open',
        discoveryDate: new Date(Date.now() - 21 * 24 * 60 * 60000) // 21 days ago
      },
      {
        id: 'VUL-005',
        title: 'Faille dans VMware vCenter Server',
        cve: 'CVE-2023-20887',
        cvss: 9.1,
        severity: 'critical',
        affectedAssets: ['CLD-103', 'CLD-104'],
        status: 'open',
        discoveryDate: new Date(Date.now() - 5 * 24 * 60 * 60000) // 5 days ago
      }
    ];
  }
}
