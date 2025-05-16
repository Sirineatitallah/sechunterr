import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';

interface SecurityEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'maintenance' | 'update' | 'exercise' | 'incident' | 'other';
  status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  location?: string;
  participants?: string[];
  link?: string;
}

@Component({
  selector: 'app-security-events',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTooltipModule,
    RouterModule
  ],
  templateUrl: './security-events.component.html',
  styleUrls: ['./security-events.component.scss']
})
export class SecurityEventsComponent implements OnInit {
  securityEvents: SecurityEvent[] = [];
  filteredEvents: SecurityEvent[] = [];
  activeFilter: 'all' | 'upcoming' | 'in-progress' = 'all';

  constructor() { }

  ngOnInit(): void {
    this.initMockEvents();
    this.filterEvents(this.activeFilter);
  }

  /**
   * Filter events by status
   */
  filterEvents(filter: 'all' | 'upcoming' | 'in-progress'): void {
    this.activeFilter = filter;
    
    if (filter === 'all') {
      this.filteredEvents = this.securityEvents;
    } else {
      this.filteredEvents = this.securityEvents.filter(event => event.status === filter);
    }
  }

  /**
   * Get icon for event type
   */
  getEventIcon(type: string): string {
    switch (type) {
      case 'maintenance':
        return 'build';
      case 'update':
        return 'system_update';
      case 'exercise':
        return 'fitness_center';
      case 'incident':
        return 'warning';
      default:
        return 'event';
    }
  }

  /**
   * Get color for event priority
   */
  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'critical':
        return '#ff4757';
      case 'high':
        return '#ffa502';
      case 'medium':
        return '#1e90ff';
      case 'low':
        return '#2ed573';
      default:
        return '#1e90ff';
    }
  }

  /**
   * Format date to readable string
   */
  formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Initialize mock security events
   */
  private initMockEvents(): void {
    this.securityEvents = [
      {
        id: '1',
        title: 'Maintenance planifiée',
        description: 'Maintenance du système de détection d\'intrusion. Interruption possible des alertes pendant 30 minutes.',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        type: 'maintenance',
        status: 'upcoming',
        priority: 'medium',
        location: 'Datacenter principal',
        participants: ['Équipe Sécurité', 'Équipe Infrastructure']
      },
      {
        id: '2',
        title: 'Exercice de simulation d\'incident',
        description: 'Simulation d\'une attaque par ransomware pour tester les procédures de réponse aux incidents.',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        type: 'exercise',
        status: 'upcoming',
        priority: 'high',
        participants: ['Équipe CERT', 'Équipe Sécurité', 'Direction']
      },
      {
        id: '3',
        title: 'Mise à jour des signatures antivirus',
        description: 'Déploiement des nouvelles signatures antivirus sur tous les endpoints.',
        date: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour from now
        type: 'update',
        status: 'upcoming',
        priority: 'low'
      },
      {
        id: '4',
        title: 'Analyse de vulnérabilité',
        description: 'Analyse complète des vulnérabilités sur l\'infrastructure critique.',
        date: new Date(), // Now
        type: 'maintenance',
        status: 'in-progress',
        priority: 'medium',
        location: 'Tous les systèmes critiques'
      },
      {
        id: '5',
        title: 'Incident de sécurité',
        description: 'Investigation en cours sur une tentative d\'accès non autorisé aux serveurs de base de données.',
        date: new Date(), // Now
        type: 'incident',
        status: 'in-progress',
        priority: 'critical',
        participants: ['Équipe CERT', 'Équipe Base de données', 'Direction Sécurité']
      },
      {
        id: '6',
        title: 'Mise à jour du firewall',
        description: 'Mise à jour des règles du firewall pour implémenter les nouvelles politiques de sécurité.',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        type: 'update',
        status: 'completed',
        priority: 'high',
        location: 'Firewall périmétrique'
      }
    ];
  }
}
