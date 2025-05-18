import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export enum NotificationType {
  ALERT = 'alert',
  TASK = 'task',
  REPORT = 'report',
  EVENT = 'event'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  icon?: string;
  metadata?: any;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<Notification[]>([]);
  private mockNotifications: Notification[] = [];

  constructor() {
    // Initialize with mock data
    this.initMockNotifications();
  }

  /**
   * Get all notifications
   */
  getNotifications(): Observable<Notification[]> {
    return this.notifications.asObservable();
  }

  /**
   * Get unread notifications count
   */
  getUnreadCount(): Observable<number> {
    return new BehaviorSubject<number>(
      this.notifications.value.filter(n => !n.read).length
    ).asObservable();
  }

  /**
   * Add a new notification
   */
  addNotification(notification: Notification): void {
    const currentNotifications = this.notifications.value;
    this.notifications.next([notification, ...currentNotifications]);
  }

  /**
   * Mark a notification as read
   */
  markAsRead(id: string): void {
    const currentNotifications = this.notifications.value;
    const updatedNotifications = currentNotifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    this.notifications.next(updatedNotifications);
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    const currentNotifications = this.notifications.value;
    const updatedNotifications = currentNotifications.map(n => ({ ...n, read: true }));
    this.notifications.next(updatedNotifications);
  }

  /**
   * Delete a notification
   */
  deleteNotification(id: string): void {
    const currentNotifications = this.notifications.value;
    const updatedNotifications = currentNotifications.filter(n => n.id !== id);
    this.notifications.next(updatedNotifications);
  }

  /**
   * Filter notifications by type
   */
  filterByType(type: NotificationType): Observable<Notification[]> {
    return new BehaviorSubject<Notification[]>(
      this.notifications.value.filter(n => n.type === type)
    ).asObservable();
  }

  /**
   * Show a success notification
   */
  showSuccess(message: string, title: string = 'Succès'): void {
    this.addNotification({
      id: Date.now().toString(),
      title,
      message,
      type: NotificationType.ALERT,
      priority: NotificationPriority.LOW,
      timestamp: new Date(),
      read: false,
      icon: 'check_circle'
    });
  }

  /**
   * Show an info notification
   */
  showInfo(message: string, title: string = 'Information'): void {
    this.addNotification({
      id: Date.now().toString(),
      title,
      message,
      type: NotificationType.EVENT,
      priority: NotificationPriority.LOW,
      timestamp: new Date(),
      read: false,
      icon: 'info'
    });
  }

  /**
   * Show a warning notification
   */
  showWarning(message: string, title: string = 'Avertissement'): void {
    this.addNotification({
      id: Date.now().toString(),
      title,
      message,
      type: NotificationType.ALERT,
      priority: NotificationPriority.MEDIUM,
      timestamp: new Date(),
      read: false,
      icon: 'warning'
    });
  }

  /**
   * Show an error notification
   */
  showError(message: string, title: string = 'Erreur'): void {
    this.addNotification({
      id: Date.now().toString(),
      title,
      message,
      type: NotificationType.ALERT,
      priority: NotificationPriority.CRITICAL,
      timestamp: new Date(),
      read: false,
      icon: 'error'
    });
  }

  /**
   * Initialize mock notifications
   */
  private initMockNotifications(): void {
    const mockData: Notification[] = [
      {
        id: '1',
        title: 'Alerte critique détectée',
        message: 'Une vulnérabilité critique a été détectée dans le système Apache.',
        type: NotificationType.ALERT,
        priority: NotificationPriority.CRITICAL,
        timestamp: new Date(Date.now() - 30 * 60000), // 30 minutes ago
        read: false,
        icon: 'warning',
        actionUrl: '/dashboard/vi',
        actionLabel: 'Voir les détails'
      },
      {
        id: '2',
        title: 'Analyse de vulnérabilité requise',
        message: 'Veuillez analyser les nouvelles vulnérabilités détectées dans le module ASM.',
        type: NotificationType.TASK,
        priority: NotificationPriority.HIGH,
        timestamp: new Date(Date.now() - 2 * 60 * 60000), // 2 hours ago
        read: false,
        icon: 'assignment',
        actionUrl: '/dashboard/asm',
        actionLabel: 'Commencer l\'analyse'
      },
      {
        id: '3',
        title: 'Rapport hebdomadaire disponible',
        message: 'Le rapport hebdomadaire de sécurité est maintenant disponible.',
        type: NotificationType.REPORT,
        priority: NotificationPriority.MEDIUM,
        timestamp: new Date(Date.now() - 5 * 60 * 60000), // 5 hours ago
        read: true,
        icon: 'description',
        actionUrl: '#',
        actionLabel: 'Télécharger le rapport'
      },
      {
        id: '4',
        title: 'Maintenance planifiée',
        message: 'Une maintenance du système est prévue demain à 22h00.',
        type: NotificationType.EVENT,
        priority: NotificationPriority.LOW,
        timestamp: new Date(Date.now() - 12 * 60 * 60000), // 12 hours ago
        read: true,
        icon: 'event',
        actionUrl: '#',
        actionLabel: 'Voir le calendrier'
      },
      {
        id: '5',
        title: 'Nouvelle menace détectée',
        message: 'Une nouvelle menace a été identifiée dans le module CTI.',
        type: NotificationType.ALERT,
        priority: NotificationPriority.HIGH,
        timestamp: new Date(Date.now() - 45 * 60000), // 45 minutes ago
        read: false,
        icon: 'security',
        actionUrl: '/dashboard/cti',
        actionLabel: 'Examiner la menace'
      },
      {
        id: '6',
        title: 'Mise à jour des procédures',
        message: 'Veuillez mettre à jour les procédures de réponse aux incidents de phishing.',
        type: NotificationType.TASK,
        priority: NotificationPriority.MEDIUM,
        timestamp: new Date(Date.now() - 3 * 60 * 60000), // 3 hours ago
        read: false,
        icon: 'update',
        actionUrl: '/dashboard/soar',
        actionLabel: 'Mettre à jour'
      },
      {
        id: '7',
        title: 'Exercice de simulation prévu',
        message: 'Un exercice de simulation d\'incident est prévu pour vendredi prochain.',
        type: NotificationType.EVENT,
        priority: NotificationPriority.MEDIUM,
        timestamp: new Date(Date.now() - 24 * 60 * 60000), // 24 hours ago
        read: true,
        icon: 'event_available',
        actionUrl: '#',
        actionLabel: 'Voir les détails'
      }
    ];

    this.notifications.next(mockData);
  }
}
