import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationCenterComponent } from './notification-center.component';
import { NotificationService, Notification, NotificationType, NotificationPriority } from '../../../core/services/notification.service';
import { BehaviorSubject } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { A11yModule, LiveAnnouncer } from '@angular/cdk/a11y';
import { ChangeDetectorRef, NgZone, ElementRef } from '@angular/core';
import { UserPreferencesService } from '../../../core/services/user-preferences.service';

describe('NotificationCenterComponent', () => {
  let component: NotificationCenterComponent;
  let fixture: ComponentFixture<NotificationCenterComponent>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockUserPreferencesService: jasmine.SpyObj<UserPreferencesService>;
  let mockLiveAnnouncer: jasmine.SpyObj<LiveAnnouncer>;
  let mockNotifications: Notification[];

  beforeEach(async () => {
    mockNotifications = [
      {
        id: '1',
        title: 'Test Alert',
        message: 'This is a test alert',
        type: NotificationType.ALERT,
        priority: NotificationPriority.HIGH,
        timestamp: new Date(),
        read: false,
        icon: 'warning'
      },
      {
        id: '2',
        title: 'Test Task',
        message: 'This is a test task',
        type: NotificationType.TASK,
        priority: NotificationPriority.MEDIUM,
        timestamp: new Date(),
        read: false,
        icon: 'assignment'
      }
    ];

    mockNotificationService = jasmine.createSpyObj('NotificationService', [
      'getNotifications',
      'getUnreadCount',
      'markAsRead',
      'markAllAsRead',
      'deleteNotification',
      'filterByType'
    ]);

    mockUserPreferencesService = jasmine.createSpyObj('UserPreferencesService', [
      'getNotificationPreferences',
      'getCurrentNotificationPreferences',
      'updateNotificationPreferences',
      'resetNotificationPreferences'
    ]);

    mockLiveAnnouncer = jasmine.createSpyObj('LiveAnnouncer', ['announce']);

    // Set up mock return values
    mockUserPreferencesService.getCurrentNotificationPreferences.and.returnValue({
      updateIntervalSeconds: 60,
      showSeconds: true,
      timeFormat: 'relative' as const,
      language: 'fr' as const
    });

    mockUserPreferencesService.getNotificationPreferences.and.returnValue(new BehaviorSubject({
      updateIntervalSeconds: 60,
      showSeconds: true,
      timeFormat: 'relative' as const,
      language: 'fr' as const
    }));

    mockNotificationService.getNotifications.and.returnValue(
      new BehaviorSubject<Notification[]>(mockNotifications)
    );

    await TestBed.configureTestingModule({
      imports: [
        NotificationCenterComponent,
        MatIconModule,
        MatBadgeModule,
        MatTooltipModule,
        MatMenuModule,
        MatSliderModule,
        MatSlideToggleModule,
        RouterTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: UserPreferencesService, useValue: mockUserPreferencesService },
        { provide: LiveAnnouncer, useValue: mockLiveAnnouncer },
        { provide: ElementRef, useValue: { nativeElement: document.createElement('div') } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load notifications on init', () => {
    expect(component.notifications.length).toBe(2);
    expect(component.unreadCount).toBe(2);
  });

  it('should toggle notification center', () => {
    expect(component.isOpen).toBeFalse();
    component.toggleNotificationCenter();
    expect(component.isOpen).toBeTrue();
    component.toggleNotificationCenter();
    expect(component.isOpen).toBeFalse();
  });

  it('should set active tab', () => {
    component.setActiveTab(NotificationType.ALERT);
    expect(component.activeTab).toBe(NotificationType.ALERT);
    expect(component.filteredNotifications.length).toBe(1);
    expect(component.filteredNotifications[0].type).toBe(NotificationType.ALERT);
  });

  it('should mark notification as read', () => {
    component.markAsRead('1');
    expect(mockNotificationService.markAsRead).toHaveBeenCalledWith('1');
  });

  it('should mark all notifications as read', () => {
    component.markAllAsRead();
    expect(mockNotificationService.markAllAsRead).toHaveBeenCalled();
  });

  it('should delete notification and remove from cache', () => {
    // Create a test notification
    const testId = 'test-delete';
    const now = new Date();
    const testNotification: Notification = {
      id: testId,
      title: 'Test Delete',
      message: 'Test message',
      type: NotificationType.ALERT,
      priority: NotificationPriority.HIGH,
      timestamp: now,
      read: false
    };

    // Update component's notifications
    component.notifications = [testNotification];

    // Update cache
    (component as any).updateRelativeTimeCache();

    // Verify cache has the entry
    expect((component as any).relativeTimeCache.has(testId)).toBeTrue();

    // Delete the notification
    const event = new Event('click');
    spyOn(event, 'stopPropagation');
    component.deleteNotification(testId, event);

    // Verify event was stopped and service was called
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(mockNotificationService.deleteNotification).toHaveBeenCalledWith(testId);

    // Verify cache entry was removed
    expect((component as any).relativeTimeCache.has(testId)).toBeFalse();
  });

  it('should get count by type', () => {
    expect(component.getCountByType(NotificationType.ALERT)).toBe(1);
    expect(component.getCountByType(NotificationType.TASK)).toBe(1);
    expect(component.getCountByType(NotificationType.REPORT)).toBe(0);
  });

  it('should get unread count by type', () => {
    expect(component.getUnreadCountByType(NotificationType.ALERT)).toBe(1);
    expect(component.getUnreadCountByType(NotificationType.TASK)).toBe(1);
    expect(component.getUnreadCountByType(NotificationType.REPORT)).toBe(0);
  });

  it('should format relative time correctly', () => {
    // Set up test notifications with specific timestamps
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    // Create test notifications with these timestamps
    const testNotifications: Notification[] = [
      {
        id: 'now',
        title: 'Just Now',
        message: 'Test message',
        type: NotificationType.ALERT,
        priority: NotificationPriority.HIGH,
        timestamp: now,
        read: false
      },
      {
        id: 'minutes',
        title: 'Minutes Ago',
        message: 'Test message',
        type: NotificationType.ALERT,
        priority: NotificationPriority.HIGH,
        timestamp: fiveMinutesAgo,
        read: false
      },
      {
        id: 'hours',
        title: 'Hours Ago',
        message: 'Test message',
        type: NotificationType.ALERT,
        priority: NotificationPriority.HIGH,
        timestamp: twoHoursAgo,
        read: false
      },
      {
        id: 'days',
        title: 'Days Ago',
        message: 'Test message',
        type: NotificationType.ALERT,
        priority: NotificationPriority.HIGH,
        timestamp: threeDaysAgo,
        read: false
      }
    ];

    // Update component's notifications
    component.notifications = testNotifications;

    // Call updateRelativeTimeCache to populate the cache
    (component as any).updateRelativeTimeCache();

    // Now test the getRelativeTime method
    expect(component.getRelativeTime(now)).toBe('À l\'instant');
    expect(component.getRelativeTime(fiveMinutesAgo)).toBe('Il y a 5 minutes');
    expect(component.getRelativeTime(twoHoursAgo)).toBe('Il y a 2 heures');
    expect(component.getRelativeTime(threeDaysAgo)).toBe('Il y a 3 jours');
  });

  it('should calculate relative time correctly', () => {
    const now = new Date();

    // Test "À l'instant"
    expect((component as any).calculateRelativeTime(now)).toBe('À l\'instant');

    // Test minutes
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    expect((component as any).calculateRelativeTime(fiveMinutesAgo)).toBe('Il y a 5 minutes');

    // Test hours
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    expect((component as any).calculateRelativeTime(twoHoursAgo)).toBe('Il y a 2 heures');

    // Test days
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    expect((component as any).calculateRelativeTime(threeDaysAgo)).toBe('Il y a 3 jours');
  });

  it('should update relative time cache', () => {
    // Create test notifications
    const now = new Date();
    const testNotifications: Notification[] = [
      {
        id: 'test1',
        title: 'Test 1',
        message: 'Test message 1',
        type: NotificationType.ALERT,
        priority: NotificationPriority.HIGH,
        timestamp: now,
        read: false
      },
      {
        id: 'test2',
        title: 'Test 2',
        message: 'Test message 2',
        type: NotificationType.TASK,
        priority: NotificationPriority.MEDIUM,
        timestamp: new Date(now.getTime() - 10 * 60 * 1000), // 10 minutes ago
        read: false
      }
    ];

    // Update component's notifications
    component.notifications = testNotifications;

    // Call updateRelativeTimeCache
    (component as any).updateRelativeTimeCache();

    // Check that cache has entries for both notifications
    expect((component as any).relativeTimeCache.has('test1')).toBeTrue();
    expect((component as any).relativeTimeCache.has('test2')).toBeTrue();

    // Check cache values
    expect((component as any).relativeTimeCache.get('test1')).toBe('À l\'instant');
    expect((component as any).relativeTimeCache.get('test2')).toBe('Il y a 10 minutes');
  });

  it('should toggle time format and update cache', () => {
    // Set up test notifications
    const now = new Date();
    const testNotification: Notification = {
      id: 'test1',
      title: 'Test 1',
      message: 'Test message',
      type: NotificationType.ALERT,
      priority: NotificationPriority.HIGH,
      timestamp: now,
      read: false
    };

    component.notifications = [testNotification];

    // Initial format should be relative
    expect(component.timeFormat).toBe('relative');

    // Update cache with relative format
    (component as any).updateRelativeTimeCache();

    // Get initial cache value
    const initialValue = (component as any).relativeTimeCache.get('test1');
    expect(initialValue).toBe('À l\'instant');

    // Toggle to absolute format
    component.toggleTimeFormat();

    // Format should now be absolute
    expect(component.timeFormat).toBe('absolute');

    // Cache should be updated with absolute format
    const newValue = (component as any).relativeTimeCache.get('test1');
    expect(newValue).not.toBe(initialValue);
    expect(newValue).toContain(now.getFullYear().toString());
  });

  it('should toggle seconds display and update cache', () => {
    // Create a notification from 30 seconds ago
    const now = new Date();
    const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);

    const testNotification: Notification = {
      id: 'test-seconds',
      title: 'Test Seconds',
      message: 'Test message',
      type: NotificationType.ALERT,
      priority: NotificationPriority.HIGH,
      timestamp: thirtySecondsAgo,
      read: false
    };

    component.notifications = [testNotification];

    // Enable seconds display
    component.showSeconds = true;
    (component as any).updateRelativeTimeCache();

    // With seconds enabled, should show seconds
    const withSeconds = (component as any).relativeTimeCache.get('test-seconds');
    expect(withSeconds).toContain('seconde');

    // Disable seconds display
    component.toggleSecondsDisplay();

    // Seconds should now be disabled
    expect(component.showSeconds).toBeFalse();

    // Cache should be updated without seconds
    const withoutSeconds = (component as any).relativeTimeCache.get('test-seconds');
    expect(withoutSeconds).not.toContain('seconde');
  });

  it('should change language and update cache', () => {
    const now = new Date();
    const testNotification: Notification = {
      id: 'test-lang',
      title: 'Test Language',
      message: 'Test message',
      type: NotificationType.ALERT,
      priority: NotificationPriority.HIGH,
      timestamp: now,
      read: false
    };

    component.notifications = [testNotification];

    // Default language should be French
    expect(component.currentLanguage).toBe('fr');
    (component as any).updateRelativeTimeCache();

    // Should have French text
    const frenchText = (component as any).relativeTimeCache.get('test-lang');
    expect(frenchText).toBe('À l\'instant');

    // Change to English
    component.changeLanguage('en');

    // Language should now be English
    expect(component.currentLanguage).toBe('en');

    // Cache should be updated with English text
    const englishText = (component as any).relativeTimeCache.get('test-lang');
    expect(englishText).toBe('Just now');
  });

  it('should update refresh interval and save to preferences', () => {
    // Default interval should be 60 seconds
    expect(component.updateIntervalSeconds).toBe(60);
    expect((component as any).updateIntervalMs).toBe(60000);

    // Update to 30 seconds
    component.updateRefreshInterval(30);

    // Interval should be updated
    expect(component.updateIntervalSeconds).toBe(30);
    expect((component as any).updateIntervalMs).toBe(30000);

    // Preferences should be updated
    expect(mockUserPreferencesService.updateNotificationPreferences).toHaveBeenCalledWith({
      updateIntervalSeconds: 30
    });

    // Screen reader announcement should be made
    expect(mockLiveAnnouncer.announce).toHaveBeenCalled();
  });

  it('should load preferences on init', () => {
    expect(mockUserPreferencesService.getCurrentNotificationPreferences).toHaveBeenCalled();
    expect(component.updateIntervalSeconds).toBe(60);
    expect(component.showSeconds).toBe(true);
    expect(component.timeFormat).toBe('relative');
    expect(component.currentLanguage).toBe('fr');
  });

  it('should toggle time format and save to preferences', () => {
    // Initial format should be relative
    expect(component.timeFormat).toBe('relative');

    // Toggle format
    component.toggleTimeFormat();

    // Format should now be absolute
    expect(component.timeFormat).toBe('absolute');

    // Preferences should be updated
    expect(mockUserPreferencesService.updateNotificationPreferences).toHaveBeenCalledWith({
      timeFormat: 'absolute'
    });

    // Screen reader announcement should be made
    expect(mockLiveAnnouncer.announce).toHaveBeenCalled();
  });

  it('should toggle seconds display and save to preferences', () => {
    // Initial setting should be true
    expect(component.showSeconds).toBe(true);

    // Toggle seconds display
    component.toggleSecondsDisplay();

    // Setting should now be false
    expect(component.showSeconds).toBe(false);

    // Preferences should be updated
    expect(mockUserPreferencesService.updateNotificationPreferences).toHaveBeenCalledWith({
      showSeconds: false
    });

    // Screen reader announcement should be made
    expect(mockLiveAnnouncer.announce).toHaveBeenCalled();
  });

  it('should change language and save to preferences', () => {
    // Initial language should be French
    expect(component.currentLanguage).toBe('fr');

    // Change language to English
    component.changeLanguage('en');

    // Language should now be English
    expect(component.currentLanguage).toBe('en');

    // Preferences should be updated
    expect(mockUserPreferencesService.updateNotificationPreferences).toHaveBeenCalledWith({
      language: 'en'
    });

    // Screen reader announcement should be made
    expect(mockLiveAnnouncer.announce).toHaveBeenCalled();
  });

  it('should reset preferences', () => {
    // Call reset
    component.resetPreferences();

    // Service method should be called
    expect(mockUserPreferencesService.resetNotificationPreferences).toHaveBeenCalled();

    // Screen reader announcement should be made
    expect(mockLiveAnnouncer.announce).toHaveBeenCalled();
  });

  it('should announce when marking notification as read', () => {
    component.markAsRead('1');
    expect(mockNotificationService.markAsRead).toHaveBeenCalledWith('1');
    expect(mockLiveAnnouncer.announce).toHaveBeenCalled();
  });

  it('should announce when marking all notifications as read', () => {
    component.markAllAsRead();
    expect(mockNotificationService.markAllAsRead).toHaveBeenCalled();
    expect(mockLiveAnnouncer.announce).toHaveBeenCalled();
  });

  it('should announce when deleting a notification', () => {
    const event = new Event('click');
    spyOn(event, 'stopPropagation');
    component.deleteNotification('1', event);
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(mockNotificationService.deleteNotification).toHaveBeenCalledWith('1');
    expect(mockLiveAnnouncer.announce).toHaveBeenCalled();
  });
});
