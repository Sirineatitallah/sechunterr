import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authStateSubject = new BehaviorSubject<boolean>(false);
  public authState$: Observable<boolean> = this.authStateSubject.asObservable();

  constructor() {
    // Check if user is already authenticated
    const token = localStorage.getItem('access_token');
    const expString = localStorage.getItem('token_exp');

    if (token && expString) {
      try {
        // Check if token is expired
        const exp = parseInt(expString, 10);
        const now = Math.floor(Date.now() / 1000);

        if (now < exp) {
          // Token is valid
          this.authStateSubject.next(true);
          console.log('User authenticated from stored token');
        } else {
          // Token is expired
          console.log('Stored token is expired');
          this.logout();
        }
      } catch (error) {
        console.error('Invalid token data:', error);
        this.logout(); // Clear invalid token
      }
    } else {
      console.log('No valid authentication data found');
    }
  }

  isAuthenticated(): boolean {
    // First check the current auth state
    if (!this.authStateSubject.value) {
      return false;
    }

    // Then verify token expiration
    const token = localStorage.getItem('access_token');
    const expString = localStorage.getItem('token_exp');

    if (!token || !expString) {
      this.logout(); // Clear invalid state
      return false;
    }

    // Check if token is expired
    const exp = parseInt(expString, 10);
    const now = Math.floor(Date.now() / 1000);

    if (now >= exp) {
      console.log('Token expired');
      this.logout(); // Clear expired token
      return false;
    }

    return true;
  }

  login(username: string, password: string): boolean {
    // Mock authentication - in a real app, this would be an API call
    if (username === 'admin' && password === 'Admin1!/') {
      // Create a mock token with expiration (24 hours from now)
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = 24 * 60 * 60; // 24 hours in seconds
      const exp = now + expiresIn;

      // In a real app, this token would come from the server
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIFVzZXIiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MTYyMzkwMjJ9';

      // Store auth data in localStorage
      localStorage.setItem('access_token', mockToken);
      localStorage.setItem('token_exp', exp.toString());
      localStorage.setItem('user_role', 'admin');
      localStorage.setItem('user_name', 'Admin User');
      localStorage.setItem('user_email', 'admin@sechunter.com');

      // Update auth state
      this.authStateSubject.next(true);
      console.log('User authenticated successfully');
      return true;
    } else if (username === 'client' && password === 'Client1!/') {
      // Client user authentication
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = 24 * 60 * 60; // 24 hours in seconds
      const exp = now + expiresIn;

      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5ODc2NTQzMjEwIiwibmFtZSI6IkNsaWVudCBVc2VyIiwicm9sZSI6ImNsaWVudCIsImlhdCI6MTUxNjIzOTAyMn0';

      localStorage.setItem('access_token', mockToken);
      localStorage.setItem('token_exp', exp.toString());
      localStorage.setItem('user_role', 'client');
      localStorage.setItem('user_name', 'Client User');
      localStorage.setItem('user_email', 'client@example.com');

      this.authStateSubject.next(true);
      console.log('Client user authenticated successfully');
      return true;
    }

    console.log('Authentication failed');
    return false;
  }

  register(userData: any): boolean {
    // In a real application, this would make an API call to register the user
    // For demo purposes, we'll just simulate a successful registration
    console.log('Registering user:', userData);
    return true;
  }

  logout(): void {
    // Clear all auth-related data from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_exp');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');

    // Update auth state
    this.authStateSubject.next(false);
    console.log('User logged out');
  }

  getUserRole(): string {
    return localStorage.getItem('user_role') || 'client';
  }

  getUserName(): string {
    return localStorage.getItem('user_name') || 'User';
  }

  getUserEmail(): string {
    return localStorage.getItem('user_email') || '';
  }
}
