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
    console.log('Registration attempt with:', credentials);

    // For demo purposes, simulate successful registration
    if (credentials.email && credentials.password && credentials.password.length >= 6) {
      console.log('Registration successful');

      // Navigate to login page with success message
      setTimeout(() => {
        this.router.navigate(['/auth'], {
          queryParams: { registered: true }
        });
      }, 500);

      return new BehaviorSubject({ success: true }).asObservable();
    }

    // Return error for invalid credentials
    console.log('Registration failed: Invalid credentials');
    return throwError(() => new Error('Registration failed. Please provide a valid email and password.'));
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    // Special case for admin login
    if (credentials.email === 'admin' && credentials.password === 'Admin1!/') {
      const mockResponse = { token: 'admin-token' };
      this.handleAuthentication(mockResponse);
      return new BehaviorSubject(mockResponse).asObservable();
    }

    // Special case for analyst login
    if ((credentials.email === 'analyst' && credentials.password === 'Analyst1!/') ||
        (credentials.email === 'idanalyste' && credentials.password === 'Analyste1!/')) {
      const mockResponse = { token: 'analyst-token' };
      this.handleAuthentication(mockResponse);
      return new BehaviorSubject(mockResponse).asObservable();
    }

    // Special case for user login
    if (credentials.email === 'user' && credentials.password === 'userA1!/') {
      const mockResponse = { token: 'user-token' };
      this.handleAuthentication(mockResponse);
      return new BehaviorSubject(mockResponse).asObservable();
    }

    // For demo purposes, accept any login with valid format
    if (credentials.email && credentials.password && credentials.password.length >= 6) {
      const mockResponse = { token: 'client-token-1' };
      this.handleAuthentication(mockResponse);
      return new BehaviorSubject(mockResponse).asObservable();
    }

    // Return error for invalid credentials
    console.log('Login failed: Invalid credentials');
    return throwError(() => new Error('Login failed. Please provide a valid email and password.'));
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
      localStorage.removeItem('user_role');
      console.log('Logged out, cleared tokens and roles');
    }
    this.authStatus.next(false);
    this.router.navigate(['/auth']);
  }

  isAuthenticated(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    // Special case for admin token or client tokens
    if (token === 'admin-token' ||
        token === 'analyst-token' ||
        token === 'user-token' ||
        token.startsWith('client-token-') ||
        token.startsWith('analyst-token-') ||
        token.startsWith('user-token-')) {
      return true;
    }

    // Only try to validate with JWT helper if it looks like a JWT token
    // JWT tokens have the format: xxxxx.yyyyy.zzzzz
    if (token && token.split('.').length === 3) {
      try {
        return !this.jwtHelper.isTokenExpired(token);
      } catch (error) {
        console.error('Token validation error:', error);
        return false;
      }
    }

    // For any other token format, assume it's valid
    return true;
  }

  getDecodedToken(): any {
    const token = localStorage.getItem('access_token');
    const userRole = localStorage.getItem('user_role');

    if (!token) return null;

    console.log('Decoding token:', token);
    console.log('User role from localStorage:', userRole);

    // Check user_role in localStorage first
    if (userRole === 'analyst') {
      console.log('Using analyst role from localStorage');
      return {
        sub: 'analyst',
        id: 'analyst-1',
        email: 'analyst@example.com',
        name: 'Security Analyst',
        roles: ['analyst'],
        mfaEnabled: false,
        lastLogin: new Date()
      };
    }

    // Special case for admin token
    if (token === 'admin-token') {
      return {
        sub: 'admin',
        id: 'admin-1',
        email: 'admin',
        name: 'Administrator',
        roles: ['admin', 'superuser'],
        mfaEnabled: true,
        lastLogin: new Date()
      };
    }

    // Special case for client tokens
    if (token.startsWith('client-token-')) {
      const clientId = token.split('-')[2] || '1';
      return {
        sub: 'client',
        id: `client-${clientId}`,
        email: `client${clientId}@example.com`,
        name: `Client User ${clientId}`,
        roles: ['client'],
        clientId: clientId,
        clientName: `Client ${clientId}`,
        mfaEnabled: false,
        lastLogin: new Date()
      };
    }

    // Special case for analyst tokens
    if (token === 'analyst-token' || token.startsWith('analyst-token-')) {
      console.log('Using analyst role from token');
      return {
        sub: 'analyst',
        id: 'analyst-1',
        email: 'analyst@example.com',
        name: 'Security Analyst',
        roles: ['analyst'],
        mfaEnabled: false,
        lastLogin: new Date()
      };
    }

    // Special case for user token
    if (token === 'user-token' || token.startsWith('user-token-')) {
      return {
        sub: 'user',
        id: 'user-1',
        email: 'user@example.com',
        name: 'Regular User',
        roles: ['user'],
        mfaEnabled: false,
        lastLogin: new Date()
      };
    }

    // Only try to decode with JWT helper if it looks like a JWT token
    // JWT tokens have the format: xxxxx.yyyyy.zzzzz
    if (token && token.split('.').length === 3) {
      try {
        return this.jwtHelper.decodeToken(token);
      } catch (error) {
        console.error('Token decoding error:', error);
        // Fall back to a default user object
        return {
          sub: 'user',
          id: 'user-1',
          email: 'user@example.com',
          name: 'Default User',
          roles: ['user'],
          mfaEnabled: false,
          lastLogin: new Date()
        };
      }
    }

    // For non-JWT tokens that don't match any special case, return a default user
    return {
      sub: 'user',
      id: 'user-1',
      email: 'user@example.com',
      name: 'Default User',
      roles: ['user'],
      mfaEnabled: false,
      lastLogin: new Date()
    };
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('access_token'); // Use access token as refresh token
    if (!refreshToken) {
      return throwError(() => new Error('No token available'));
    }
    return this.http.post<{ token: string }>('/api/auth/refresh-token', { refreshToken }).pipe(
      tap(res => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('access_token', res.token);
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
