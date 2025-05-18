import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';

export interface ThreatFeed {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  date: Date;
  source: string;
  indicators: string[];
  confidenceLevel: number;
}

@Injectable({ providedIn: 'root' })
export class ThreatFeedService {
  private http = inject(HttpClient);
  private apiUrl = '/api/threat-intelligence';

  getLatestThreats(limit = 10): Observable<ThreatFeed[]> {
    return this.http.get<ThreatFeed[]>(`${this.apiUrl}/latest`).pipe(
      map(threats => this.sortAndLimitThreats(threats, limit)),
      catchError(() => throwError(() => new Error('Failed to load threats')))
    );
  }

  private sortAndLimitThreats(threats: ThreatFeed[], limit: number): ThreatFeed[] {
    return threats
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  }

  getThreatDetails(threatId: string): Observable<ThreatFeed> {
    return this.http.get<ThreatFeed>(`${this.apiUrl}/details/${threatId}`).pipe(
      catchError(() => throwError(() => new Error('Threat not found')))
    );
  }
}