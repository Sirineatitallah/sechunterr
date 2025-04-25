// auth.service.ts
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'secHunter_token';
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
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

  login(credentials: { email: string; password: string }) {
    return this.http.post<{ token: string }>('/api/auth/login', credentials)
      .pipe(tap((response: { token: string; }) => this.storeToken(response.token)));
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