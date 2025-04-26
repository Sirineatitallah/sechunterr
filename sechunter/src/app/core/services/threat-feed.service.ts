import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface ThreatFeed {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  date: string;
  source: string;
}

@Injectable({ providedIn: 'root' })
export class ThreatFeedService {
  private apiUrl = '/api/threat-intelligence';

  constructor(private http: HttpClient) {}

  getLatestThreats(): Observable<ThreatFeed[]> {
    // Use map instead of switchMap for this simple operation
    return this.http.get<ThreatFeed[]>(`${this.apiUrl}/latest`).pipe(
      map(threats => threats.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())),
      catchError(() => of([]))
    );
  }

  getThreatsByCategory(category: string): Observable<ThreatFeed[]> {
    return this.http.get<ThreatFeed[]>(`${this.apiUrl}/category/${category}`).pipe(
      catchError(() => of([]))
    );
  }

  getThreatDetails(threatId: string): Observable<ThreatFeed | null> {
    return this.http.get<ThreatFeed>(`${this.apiUrl}/details/${threatId}`).pipe(
      catchError(() => of(null))
    );
  }
}