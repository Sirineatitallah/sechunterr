import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private jwtHelper = inject(JwtHelperService);
  private platformId = inject(PLATFORM_ID);
  
  redirectUrl: string | null = null;
  private authStatus = new BehaviorSubject<boolean>(this.isAuthenticated());
  authState$ = this.authStatus.asObservable();

  register(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post('/api/auth/register', credentials).pipe(
      tap(() => {
        this.router.navigate(['/auth'], { 
          queryParams: { registered: true } 
        });
      }),
      catchError(error => this.handleError(error))
    );
  }

login(credentials: { email: string; password: string }): Observable<any> {
    // Map email to username for backend
    const payload = { username: credentials.email, password: credentials.password };
    return this.http.post<{ token: string }>('/login', payload).pipe(
            tap(res => this.handleAuthentication(res)),
            catchError(error => this.handleError(error))
    );
  }

  private handleAuthentication(res: { token: string }): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('access_token', res.token);
    }
    this.authStatus.next(true);
    this.router.navigateByUrl(this.redirectUrl || '/dashboard');
    this.redirectUrl = null;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    this.authStatus.next(false);
    this.router.navigate(['/auth']);
  }

  isAuthenticated(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    const token = localStorage.getItem('access_token');
    return !!token && !this.jwtHelper.isTokenExpired(token);
  }

  getDecodedToken(): any {
    const token = localStorage.getItem('access_token');
    if (token) {
      return this.jwtHelper.decodeToken(token);
    }
    return null;
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }
    return this.http.post<{ accessToken: string }>('/api/auth/refresh-token', { refreshToken }).pipe(
      tap(res => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('access_token', res.accessToken);
        }
      }),
      catchError(error => this.handleError(error))
    );
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  toggleMFA(): Observable<any> {
    return this.http.post('/api/auth/toggle-mfa', {}).pipe(
      catchError(error => this.handleError(error))
    );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.statusText) {
      errorMessage = error.statusText;
    }
    return throwError(() => new Error(errorMessage));
  }
}
