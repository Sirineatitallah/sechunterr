import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VisualizationService } from '../../../shared/services/visualization.service';
import { Subscription } from 'rxjs';

interface ExternalRisk {
  id: string;
  category: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  asset: string;
  discoveryDate: Date;
  status: 'open' | 'in_progress' | 'resolved';
  remediation?: string;
}

@Component({
  selector: 'app-external-risks',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './external-risks.component.html',
  styleUrls: ['./external-risks.component.scss']
})
export class ExternalRisksComponent implements OnInit, OnDestroy {
  // External risks data
  externalRisks: ExternalRisk[] = [];
  
  // Filtered risks
  filteredRisks: ExternalRisk[] = [];
  
  // Filter state
  activeFilter: 'all' | 'critical' | 'high' | 'medium' | 'low' = 'all';
  
  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor(private visualizationService: VisualizationService) { }

  ngOnInit(): void {
    // Load initial data
    this.loadData();
    
    // Subscribe to time range changes
    this.subscriptions.push(
      this.visualizationService.selectedTimeRange$.subscribe(() => {
        this.loadData();
        this.applyFilter(this.activeFilter);
      })
    );
    
    // Subscribe to refresh trigger
    this.subscriptions.push(
      this.visualizationService.refreshTrigger$.subscribe(trigger => {
        if (trigger) {
          this.loadData();
          this.applyFilter(this.activeFilter);
        }
      })
    );
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Load external risks data
  loadData(): void {
    // In a real application, this would fetch data from an API
    // For demo purposes, we'll use mock data
    this.externalRisks = [
      {
        id: 'RISK-001',
        category: 'Exposed Service',
        description: 'Port 443 ouvert et accessible depuis Internet',
        severity: 'high',
        asset: 'web-prod-01',
        discoveryDate: new Date('2023-05-10'),
        status: 'open',
        remediation: 'Restreindre l\'accès au port 443 aux adresses IP autorisées uniquement'
      },
      {
        id: 'RISK-002',
        category: 'SSL Certificate',
        description: 'Certificat SSL expiré sur www.example.com',
        severity: 'medium',
        asset: 'www.example.com',
        discoveryDate: new Date('2023-05-12'),
        status: 'in_progress',
        remediation: 'Renouveler le certificat SSL et configurer le renouvellement automatique'
      },
      {
        id: 'RISK-003',
        category: 'Sensitive Information',
        description: 'Informations sensibles exposées dans le code source public',
        severity: 'critical',
        asset: 'github.com/example/repo',
        discoveryDate: new Date('2023-05-08'),
        status: 'open',
        remediation: 'Supprimer les informations sensibles et utiliser des variables d\'environnement'
      },
      {
        id: 'RISK-004',
        category: 'Misconfiguration',
        description: 'Base de données MongoDB accessible sans authentification',
        severity: 'critical',
        asset: 'db-prod-01',
        discoveryDate: new Date('2023-05-05'),
        status: 'in_progress',
        remediation: 'Activer l\'authentification et restreindre l\'accès réseau'
      },
      {
        id: 'RISK-005',
        category: 'Outdated Software',
        description: 'Version obsolète d\'Apache avec vulnérabilités connues',
        severity: 'high',
        asset: 'web-prod-02',
        discoveryDate: new Date('2023-05-15'),
        status: 'open',
        remediation: 'Mettre à jour Apache vers la dernière version stable'
      },
      {
        id: 'RISK-006',
        category: 'DNS Misconfiguration',
        description: 'Enregistrements SPF mal configurés',
        severity: 'medium',
        asset: 'example.com',
        discoveryDate: new Date('2023-05-11'),
        status: 'resolved',
        remediation: 'Corriger les enregistrements SPF pour prévenir l\'usurpation d\'e-mail'
      },
      {
        id: 'RISK-007',
        category: 'Default Credentials',
        description: 'Identifiants par défaut utilisés pour l\'interface d\'administration',
        severity: 'high',
        asset: 'router-01',
        discoveryDate: new Date('2023-05-09'),
        status: 'open',
        remediation: 'Changer les identifiants par défaut et mettre en place une politique de mots de passe forts'
      },
      {
        id: 'RISK-008',
        category: 'Insecure API',
        description: 'API exposée sans authentification',
        severity: 'high',
        asset: 'api.example.com',
        discoveryDate: new Date('2023-05-14'),
        status: 'open',
        remediation: 'Mettre en place une authentification OAuth2 pour l\'API'
      }
    ];
    
    // Apply initial filter
    this.applyFilter(this.activeFilter);
  }

  // Apply filter
  applyFilter(filter: 'all' | 'critical' | 'high' | 'medium' | 'low'): void {
    this.activeFilter = filter;
    
    if (filter === 'all') {
      this.filteredRisks = [...this.externalRisks];
    } else {
      this.filteredRisks = this.externalRisks.filter(risk => risk.severity === filter);
    }
  }

  // Refresh data
  refreshData(): void {
    this.loadData();
  }

  // Get severity class
  getSeverityClass(severity: string): string {
    return severity.toLowerCase();
  }

  // Get status class
  getStatusClass(status: string): string {
    return status.replace('_', '-');
  }

  // Format date
  formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Get count by severity
  getCountBySeverity(severity: 'critical' | 'high' | 'medium' | 'low'): number {
    return this.externalRisks.filter(risk => risk.severity === severity).length;
  }

  // Get count by status
  getCountByStatus(status: 'open' | 'in_progress' | 'resolved'): number {
    return this.externalRisks.filter(risk => risk.status === status).length;
  }
}
