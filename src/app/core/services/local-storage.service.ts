import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Get item from local storage
   */
  getItem<T>(key: string): T | null {
    if (!this.isBrowser) {
      return null;
    }

    const item = localStorage.getItem(key);
    if (item) {
      try {
        return JSON.parse(item) as T;
      } catch (e) {
        console.error('Error parsing stored item', e);
        return null;
      }
    }
    return null;
  }

  /**
   * Set item in local storage
   */
  setItem(key: string, value: any): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (e) {
      console.error('Error storing item', e);
    }
  }

  /**
   * Remove item from local storage
   */
  removeItem(key: string): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.removeItem(key);
  }

  /**
   * Clear all items from local storage
   */
  clear(): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.clear();
  }
}
