import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone, Input, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { A11yModule, LiveAnnouncer } from '@angular/cdk/a11y';
import { Subscription, interval, take } from 'rxjs';
import { NotificationService, Notification, NotificationType, NotificationPriority } from '../../../core/services/notification.service';
import { UserPreferencesService, NotificationPreferences } from '../../../core/services/user-preferences.service';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatTabsModule,
    MatTooltipModule,
    MatMenuModule,
    MatSliderModule,
    MatSlideToggleModule,
    FormsModule,
    RouterModule,
    A11yModule
  ],
  templateUrl: './notification-center.component.html',
  styleUrls: ['./notification-center.component.scss']
})
export class NotificationCenterComponent implements OnInit, OnDestroy {
  // Allow parent components to set the update interval
  @Input() updateIntervalSeconds: number = 60; // Default: 1 minute

  isOpen = false;
  isSettingsOpen = false;
  notifications: Notification[] = [];
  unreadCount = 0;
  activeTab = 'all';

  // Time display settings
  showSeconds = true;
  timeFormat: 'relative' | 'absolute' = 'relative';

  // Language settings
  currentLanguage: 'fr' | 'en' = 'fr'; // Default to French

  // For easy access in template
  notificationTypes = NotificationType;

  // Accessibility
  lastFocusedElement: HTMLElement | null = null;

  // Cache for relative times to prevent ExpressionChangedAfterItHasBeenCheckedError
  private relativeTimeCache: Map<string, string> = new Map();
  private lastUpdateTimestamp: number = Date.now();
  private updateIntervalMs: number = 60000; // Default: 1 minute in milliseconds

  private subscriptions: Subscription[] = [];

  constructor(
    private notificationService: NotificationService,
    private userPreferencesService: UserPreferencesService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private elementRef: ElementRef,
    private liveAnnouncer: LiveAnnouncer
  ) {}

  ngOnInit(): void {
    // Load user preferences
    this.loadUserPreferences();

    // Subscribe to notifications
    this.subscriptions.push(
      this.notificationService.getNotifications().subscribe(notifications => {
        this.notifications = notifications;
        this.unreadCount = notifications.filter(n => !n.read).length;

        // Initialize time cache for all notifications
        this.updateRelativeTimeCache();

        // Announce new notifications for screen readers
        if (this.unreadCount > 0) {
          const message = this.currentLanguage === 'fr'
            ? `${this.unreadCount} nouvelle${this.unreadCount > 1 ? 's' : ''} notification${this.unreadCount > 1 ? 's' : ''}`
            : `${this.unreadCount} new notification${this.unreadCount > 1 ? 's' : ''}`;
          this.liveAnnouncer.announce(message, 'polite');
        }
      })
    );

    // Subscribe to preference changes
    this.subscriptions.push(
      this.userPreferencesService.getNotificationPreferences().subscribe(prefs => {
        this.applyPreferences(prefs);
      })
    );

    // Start the timer with the current interval
    this.startUpdateTimer();

    // Set up keyboard event listeners for accessibility
    this.setupKeyboardListeners();
  }

  /**
   * Load user preferences from service
   */
  private loadUserPreferences(): void {
    const prefs = this.userPreferencesService.getCurrentNotificationPreferences();
    this.applyPreferences(prefs);
  }

  /**
   * Apply preferences to component
   */
  private applyPreferences(prefs: NotificationPreferences): void {
    this.updateIntervalSeconds = prefs.updateIntervalSeconds;
    this.updateIntervalMs = prefs.updateIntervalSeconds * 1000;
    this.showSeconds = prefs.showSeconds;
    this.timeFormat = prefs.timeFormat;
    this.currentLanguage = prefs.language;

    // Update the cache with new preferences
    this.updateRelativeTimeCache();

    // Restart timer if interval changed
    this.startUpdateTimer();
  }

  /**
   * Set up keyboard event listeners for accessibility
   */
  private setupKeyboardListeners(): void {
    // Use NgZone.runOutsideAngular for better performance with event listeners
    this.ngZone.runOutsideAngular(() => {
      this.elementRef.nativeElement.addEventListener('keydown', (event: KeyboardEvent) => {
        if (this.isOpen) {
          if (event.key === 'Escape') {
            this.ngZone.run(() => {
              this.closeNotificationCenter();
              event.preventDefault();
            });
          }
        }
      });
    });
  }

  /**
   * Start or restart the update timer with the current interval
   */
  private startUpdateTimer(): void {
    // Clear any existing timer
    this.stopUpdateTimer();

    // Set up a timer outside Angular's change detection to update relative times
    this.ngZone.runOutsideAngular(() => {
      const timeUpdateSubscription = interval(this.updateIntervalMs).subscribe(() => {
        this.updateRelativeTimeCache();

        // Run change detection manually after updating the cache
        this.ngZone.run(() => {
          this.cdr.detectChanges();
        });
      });

      this.subscriptions.push(timeUpdateSubscription);
    });
  }

  /**
   * Stop the update timer
   */
  private stopUpdateTimer(): void {
    // Find and remove the timer subscription
    const timerIndex = this.subscriptions.findIndex(sub =>
      sub.constructor.name === 'Subscriber' &&
      (sub as any).source?.constructor.name === 'IntervalObservable'
    );

    if (timerIndex !== -1) {
      this.subscriptions[timerIndex].unsubscribe();
      this.subscriptions.splice(timerIndex, 1);
    }
  }

  /**
   * Update the refresh interval
   */
  updateRefreshInterval(seconds: number): void {
    this.updateIntervalSeconds = seconds;
    this.updateIntervalMs = seconds * 1000;

    // Save to preferences
    this.userPreferencesService.updateNotificationPreferences({
      updateIntervalSeconds: seconds
    });

    // Announce for screen readers
    const message = this.currentLanguage === 'fr'
      ? `Intervalle de mise à jour défini à ${seconds} secondes`
      : `Update interval set to ${seconds} seconds`;
    this.liveAnnouncer.announce(message, 'polite');

    // Restart the timer with the new interval
    this.startUpdateTimer();

    // Update the cache immediately
    this.updateRelativeTimeCache();
  }

  /**
   * Update the cache of relative times for all notifications
   */
  private updateRelativeTimeCache(): void {
    this.lastUpdateTimestamp = Date.now();

    // Clear the cache and rebuild it
    this.relativeTimeCache.clear();

    for (const notification of this.notifications) {
      const id = notification.id;
      const timestamp = notification.timestamp;
      const relativeTime = this.calculateRelativeTime(timestamp);
      this.relativeTimeCache.set(id, relativeTime);
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Toggle notification center visibility
   */
  toggleNotificationCenter(): void {
    if (!this.isOpen) {
      // Opening the panel
      this.openNotificationCenter();
    } else {
      // Closing the panel
      this.closeNotificationCenter();
    }
  }

  /**
   * Open notification center
   */
  openNotificationCenter(): void {
    // Save the currently focused element to restore focus later
    this.lastFocusedElement = document.activeElement as HTMLElement;

    // Open the panel
    this.isOpen = true;

    // Announce for screen readers
    const message = this.currentLanguage === 'fr'
      ? 'Centre de notifications ouvert'
      : 'Notification center opened';
    this.liveAnnouncer.announce(message, 'assertive');

    // Set focus to the first interactive element after panel is visible
    setTimeout(() => {
      const firstFocusable = this.getFirstFocusableElement();
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }, 100);
  }

  /**
   * Close notification center
   */
  closeNotificationCenter(): void {
    this.isOpen = false;

    // Announce for screen readers
    const message = this.currentLanguage === 'fr'
      ? 'Centre de notifications fermé'
      : 'Notification center closed';
    this.liveAnnouncer.announce(message, 'assertive');

    // Restore focus to the element that was focused before opening
    if (this.lastFocusedElement) {
      setTimeout(() => {
        this.lastFocusedElement?.focus();
      }, 100);
    }
  }

  /**
   * Get the first focusable element in the notification panel
   */
  private getFirstFocusableElement(): HTMLElement | null {
    const panel = this.elementRef.nativeElement.querySelector('.notification-panel');
    if (!panel) return null;

    const focusableElements = panel.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    return focusableElements.length > 0 ? focusableElements[0] as HTMLElement : null;
  }

  /**
   * Set active tab
   */
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  /**
   * Get filtered notifications based on active tab
   */
  get filteredNotifications(): Notification[] {
    if (this.activeTab === 'all') {
      return this.notifications;
    }
    return this.notifications.filter(n => n.type === this.activeTab);
  }

  /**
   * Get count of notifications by type
   */
  getCountByType(type: NotificationType): number {
    return this.notifications.filter(n => n.type === type).length;
  }

  /**
   * Get unread count by type
   */
  getUnreadCountByType(type: NotificationType): number {
    return this.notifications.filter(n => n.type === type && !n.read).length;
  }

  /**
   * Mark a notification as read
   */
  markAsRead(id: string): void {
    // Find notification to get its title for the announcement
    const notification = this.notifications.find(n => n.id === id);

    this.notificationService.markAsRead(id);

    // Announce for screen readers
    if (notification) {
      const message = this.currentLanguage === 'fr'
        ? `Notification "${notification.title}" marquée comme lue`
        : `Notification "${notification.title}" marked as read`;
      this.liveAnnouncer.announce(message, 'polite');
    }

    // No need to update cache here as read status doesn't affect relative time
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.notificationService.markAllAsRead();

    // Announce for screen readers
    const message = this.currentLanguage === 'fr'
      ? 'Toutes les notifications ont été marquées comme lues'
      : 'All notifications marked as read';
    this.liveAnnouncer.announce(message, 'polite');

    // No need to update cache here as read status doesn't affect relative time
  }

  /**
   * Delete a notification
   */
  deleteNotification(id: string, event: Event): void {
    event.stopPropagation();

    // Find notification to get its title for the announcement
    const notification = this.notifications.find(n => n.id === id);

    // Remove from cache before deleting
    this.relativeTimeCache.delete(id);

    this.notificationService.deleteNotification(id);

    // Announce for screen readers
    if (notification) {
      const message = this.currentLanguage === 'fr'
        ? `Notification "${notification.title}" supprimée`
        : `Notification "${notification.title}" deleted`;
      this.liveAnnouncer.announce(message, 'polite');
    }
  }

  /**
   * Get relative time from cache to prevent ExpressionChangedAfterItHasBeenCheckedError
   */
  getRelativeTime(date: Date): string {
    // Find the notification with this timestamp
    const notification = this.notifications.find(n => n.timestamp === date);

    if (notification && this.relativeTimeCache.has(notification.id)) {
      // Return cached value if available
      return this.relativeTimeCache.get(notification.id) || this.calculateRelativeTime(date);
    }

    // If not in cache (shouldn't happen), calculate it
    return this.calculateRelativeTime(date);
  }

  /**
   * Calculate relative time without caching
   * This is a private method that does the actual calculation
   */
  private calculateRelativeTime(date: Date): string {
    // If absolute time format is selected, return formatted date
    if (this.timeFormat === 'absolute') {
      return this.formatAbsoluteTime(date);
    }

    const now = new Date(this.lastUpdateTimestamp); // Use the timestamp from last update for consistency
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);
    const diffWeek = Math.round(diffDay / 7);
    const diffMonth = Math.round(diffDay / 30);

    // Use the appropriate language for time formatting
    if (this.currentLanguage === 'fr') {
      return this.formatRelativeTimeFrench(diffSec, diffMin, diffHour, diffDay, diffWeek, diffMonth);
    } else {
      return this.formatRelativeTimeEnglish(diffSec, diffMin, diffHour, diffDay, diffWeek, diffMonth);
    }
  }

  /**
   * Format relative time in French
   */
  private formatRelativeTimeFrench(diffSec: number, diffMin: number, diffHour: number,
                                  diffDay: number, diffWeek: number, diffMonth: number): string {
    if (diffSec < 5) {
      return 'À l\'instant';
    } else if (diffSec < 60 && this.showSeconds) {
      return `Il y a ${diffSec} seconde${diffSec > 1 ? 's' : ''}`;
    } else if (diffMin < 60) {
      return `Il y a ${diffMin} minute${diffMin > 1 ? 's' : ''}`;
    } else if (diffHour < 24) {
      return `Il y a ${diffHour} heure${diffHour > 1 ? 's' : ''}`;
    } else if (diffDay < 7) {
      return `Il y a ${diffDay} jour${diffDay > 1 ? 's' : ''}`;
    } else if (diffWeek < 4) {
      return `Il y a ${diffWeek} semaine${diffWeek > 1 ? 's' : ''}`;
    } else {
      return `Il y a ${diffMonth} mois`;
    }
  }

  /**
   * Format relative time in English
   */
  private formatRelativeTimeEnglish(diffSec: number, diffMin: number, diffHour: number,
                                   diffDay: number, diffWeek: number, diffMonth: number): string {
    if (diffSec < 5) {
      return 'Just now';
    } else if (diffSec < 60 && this.showSeconds) {
      return `${diffSec} second${diffSec > 1 ? 's' : ''} ago`;
    } else if (diffMin < 60) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffDay < 7) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else if (diffWeek < 4) {
      return `${diffWeek} week${diffWeek > 1 ? 's' : ''} ago`;
    } else {
      return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;
    }
  }

  /**
   * Format absolute time
   */
  private formatAbsoluteTime(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };

    if (this.showSeconds) {
      options.second = '2-digit';
    }

    const locale = this.currentLanguage === 'fr' ? 'fr-FR' : 'en-US';
    return new Intl.DateTimeFormat(locale, options).format(date);
  }

  /**
   * Toggle time format between relative and absolute
   */
  toggleTimeFormat(): void {
    const newFormat = this.timeFormat === 'relative' ? 'absolute' : 'relative';
    this.timeFormat = newFormat;

    // Save to preferences
    this.userPreferencesService.updateNotificationPreferences({
      timeFormat: newFormat
    });

    // Announce for screen readers
    const message = this.currentLanguage === 'fr'
      ? `Format de temps ${newFormat === 'relative' ? 'relatif' : 'absolu'}`
      : `Time format set to ${newFormat}`;
    this.liveAnnouncer.announce(message, 'polite');

    this.updateRelativeTimeCache();
  }

  /**
   * Toggle seconds display
   */
  toggleSecondsDisplay(): void {
    const newValue = !this.showSeconds;
    this.showSeconds = newValue;

    // Save to preferences
    this.userPreferencesService.updateNotificationPreferences({
      showSeconds: newValue
    });

    // Announce for screen readers
    const message = this.currentLanguage === 'fr'
      ? `Affichage des secondes ${newValue ? 'activé' : 'désactivé'}`
      : `Seconds display ${newValue ? 'enabled' : 'disabled'}`;
    this.liveAnnouncer.announce(message, 'polite');

    this.updateRelativeTimeCache();
  }

  /**
   * Change language
   */
  changeLanguage(language: 'fr' | 'en'): void {
    this.currentLanguage = language;

    // Save to preferences
    this.userPreferencesService.updateNotificationPreferences({
      language: language
    });

    // Announce language change in the selected language
    const message = language === 'fr'
      ? 'Langue changée en français'
      : 'Language changed to English';
    this.liveAnnouncer.announce(message, 'assertive');

    this.updateRelativeTimeCache();
  }

  /**
   * Reset all preferences to defaults
   */
  resetPreferences(): void {
    this.userPreferencesService.resetNotificationPreferences();

    // Announce for screen readers
    const message = this.currentLanguage === 'fr'
      ? 'Préférences réinitialisées'
      : 'Preferences reset to defaults';
    this.liveAnnouncer.announce(message, 'assertive');
  }

  /**
   * Get icon for notification type
   */
  getTypeIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.ALERT:
        return 'warning';
      case NotificationType.TASK:
        return 'assignment';
      case NotificationType.REPORT:
        return 'description';
      case NotificationType.EVENT:
        return 'event';
      default:
        return 'notifications';
    }
  }

  /**
   * Get color for notification priority
   */
  getPriorityColor(priority: NotificationPriority): string {
    switch (priority) {
      case NotificationPriority.CRITICAL:
        return 'var(--critical-color, #ff4757)';
      case NotificationPriority.HIGH:
        return 'var(--high-color, #ffa502)';
      case NotificationPriority.MEDIUM:
        return 'var(--medium-color, #1e90ff)';
      case NotificationPriority.LOW:
        return 'var(--low-color, #2ed573)';
      default:
        return 'var(--medium-color, #1e90ff)';
    }
  }
}
