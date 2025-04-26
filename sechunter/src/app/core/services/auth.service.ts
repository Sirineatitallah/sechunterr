import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import { tap, BehaviorSubject, Observable } from 'rxjs';

interface DecodedToken {
  exp: number;
  roles?: string[];
  [key: string]: any;
}

interface User {
  id: string;
  email: string;
  roles: string[];
}
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'secHunter_token';
  private isBrowser: boolean;
  currentUser = new BehaviorSubject<User | null>(null);


  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.initializeUser();
  }

  private initializeUser() {
    if (this.isBrowser) {
      const token = localStorage.getItem(this.TOKEN_KEY);
      if (token) {
        const decoded = jwtDecode<DecodedToken>(token);
        this.currentUser.next({
          id: decoded['sub'] || '',
          email: decoded['email'] || '',
          roles: decoded.roles || []
        });
      }
    }
  }
  login(credentials: { email: string; password: string }): Observable<{ token: string }> {
    return this.http.post<{ token: string }>('/api/auth/login', credentials).pipe(
      tap((response) => {
        this.storeToken(response.token);
        const decoded = jwtDecode<DecodedToken>(response.token);
        this.currentUser.next({
          id: decoded['sub'] || '',
          email: decoded['email'] || '',
          roles: decoded.roles || []
        });
      })
    );
  }
  isAuthenticated(): boolean {
    if (!this.isBrowser) return false;
    
    const token = localStorage.getItem('access_token');
    return !!token && !this.isTokenExpired(token);
  }

  private isTokenExpired(token: string): boolean {
    const decoded = jwtDecode(token);
    return decoded.exp! < Date.now() / 1000;
  }

  logout() {
    if (this.isBrowser) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  private storeToken(token: string) {
    if (this.isBrowser) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  getCurrentUser() {
    if (!this.isBrowser) return null;
    
    const token = localStorage.getItem(this.TOKEN_KEY);
    return token ? jwtDecode(token) : null;
  }

  isLoggedIn() {
    if (!this.isBrowser) return false;
    
    return !!localStorage.getItem(this.TOKEN_KEY);
  }
}