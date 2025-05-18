import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface NotificationPreferences {
  updateIntervalSeconds: number;
  showSeconds: boolean;
  timeFormat: 'relative' | 'absolute';
  language: 'fr' | 'en';
}

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  updateIntervalSeconds: 60,
  showSeconds: true,
  timeFormat: 'relative',
  language: 'fr'
};

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {
  private readonly NOTIFICATION_PREFS_KEY = 'notification_preferences';
  
  private notificationPreferences = new BehaviorSubject<NotificationPreferences>(
    this.loadNotificationPreferences()
  );

  constructor() {}

  /**
   * Get notification preferences as an observable
   */
  getNotificationPreferences(): Observable<NotificationPreferences> {
    return this.notificationPreferences.asObservable();
  }

  /**
   * Get current notification preferences value
   */
  getCurrentNotificationPreferences(): NotificationPreferences {
    return this.notificationPreferences.value;
  }

  /**
   * Update notification preferences
   */
  updateNotificationPreferences(preferences: Partial<NotificationPreferences>): void {
    const currentPrefs = this.notificationPreferences.value;
    const updatedPrefs = { ...currentPrefs, ...preferences };
    
    // Save to localStorage
    this.saveNotificationPreferences(updatedPrefs);
    
    // Update the BehaviorSubject
    this.notificationPreferences.next(updatedPrefs);
  }

  /**
   * Reset notification preferences to defaults
   */
  resetNotificationPreferences(): void {
    this.saveNotificationPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
    this.notificationPreferences.next(DEFAULT_NOTIFICATION_PREFERENCES);
  }

  /**
   * Load notification preferences from localStorage
   */
  private loadNotificationPreferences(): NotificationPreferences {
    try {
      const storedPrefs = localStorage.getItem(this.NOTIFICATION_PREFS_KEY);
      
      if (storedPrefs) {
        return JSON.parse(storedPrefs);
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
    
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }

  /**
   * Save notification preferences to localStorage
   */
  private saveNotificationPreferences(preferences: NotificationPreferences): void {
    try {
      localStorage.setItem(this.NOTIFICATION_PREFS_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    }
  }
}
