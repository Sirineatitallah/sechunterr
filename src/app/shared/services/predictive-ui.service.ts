import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LocalStorageService } from '../../core/services/local-storage.service';

export interface UserInteraction {
  timestamp: number;
  action: 'view' | 'click' | 'search' | 'filter' | 'navigate';
  target: string;
  context?: string;
  duration?: number;
  metadata?: any;
}

export interface WidgetSuggestion {
  id: string;
  title: string;
  type: string;
  confidence: number;
  reason: string;
}

export interface NavigationSuggestion {
  path: string;
  title: string;
  confidence: number;
  reason: string;
}

export interface FilterSuggestion {
  field: string;
  value: any;
  confidence: number;
  reason: string;
}

export interface UISuggestion {
  widgets: WidgetSuggestion[];
  navigation: NavigationSuggestion[];
  filters: FilterSuggestion[];
}

@Injectable({
  providedIn: 'root'
})
export class PredictiveUiService {
  private readonly STORAGE_KEY = 'user_interactions';
  private readonly MAX_INTERACTIONS = 1000;
  private readonly ANALYSIS_INTERVAL = 60000; // 1 minute

  private userInteractions: UserInteraction[] = [];
  private interactionsSubject = new BehaviorSubject<UserInteraction[]>([]);
  private suggestionsSubject = new BehaviorSubject<UISuggestion>({
    widgets: [],
    navigation: [],
    filters: []
  });

  private analysisTimer: any;
  private lastAnalysisTime = 0;

  constructor(private localStorageService: LocalStorageService) {
    this.loadInteractions();
    this.startAnalysisTimer();
  }

  /**
   * Track a user interaction
   */
  trackInteraction(interaction: UserInteraction): void {
    // Add timestamp if not provided
    if (!interaction.timestamp) {
      interaction.timestamp = Date.now();
    }

    // Add to interactions array
    this.userInteractions.push(interaction);

    // Limit array size
    if (this.userInteractions.length > this.MAX_INTERACTIONS) {
      this.userInteractions = this.userInteractions.slice(-this.MAX_INTERACTIONS);
    }

    // Save to storage
    this.saveInteractions();

    // Notify subscribers
    this.interactionsSubject.next(this.userInteractions);

    // Analyze if enough time has passed
    if (Date.now() - this.lastAnalysisTime > this.ANALYSIS_INTERVAL) {
      this.analyzeInteractions();
    }
  }

  /**
   * Get user interactions as observable
   */
  getInteractions(): Observable<UserInteraction[]> {
    return this.interactionsSubject.asObservable();
  }

  /**
   * Get UI suggestions as observable
   */
  getSuggestions(): Observable<UISuggestion> {
    return this.suggestionsSubject.asObservable();
  }

  /**
   * Clear all interactions
   */
  clearInteractions(): void {
    this.userInteractions = [];
    this.saveInteractions();
    this.interactionsSubject.next(this.userInteractions);
    this.suggestionsSubject.next({
      widgets: [],
      navigation: [],
      filters: []
    });
  }

  /**
   * Load interactions from storage
   */
  private loadInteractions(): void {
    const stored = this.localStorageService.getItem<UserInteraction[]>(this.STORAGE_KEY);
    if (stored) {
      this.userInteractions = stored;
      this.interactionsSubject.next(this.userInteractions);
    }
  }

  /**
   * Save interactions to storage
   */
  private saveInteractions(): void {
    this.localStorageService.setItem(this.STORAGE_KEY, this.userInteractions);
  }

  /**
   * Start analysis timer
   */
  private startAnalysisTimer(): void {
    this.analysisTimer = setInterval(() => {
      this.analyzeInteractions();
    }, this.ANALYSIS_INTERVAL);
  }

  /**
   * Stop analysis timer
   */
  private stopAnalysisTimer(): void {
    if (this.analysisTimer) {
      clearInterval(this.analysisTimer);
    }
  }

  /**
   * Analyze user interactions to generate suggestions
   */
  private analyzeInteractions(): void {
    this.lastAnalysisTime = Date.now();

    // Skip if not enough interactions
    if (this.userInteractions.length < 10) {
      return;
    }

    // Get recent interactions (last 24 hours)
    const recentTime = Date.now() - 24 * 60 * 60 * 1000;
    const recentInteractions = this.userInteractions.filter(i => i.timestamp >= recentTime);

    // Generate suggestions
    const suggestions: UISuggestion = {
      widgets: this.suggestWidgets(recentInteractions),
      navigation: this.suggestNavigation(recentInteractions),
      filters: this.suggestFilters(recentInteractions)
    };

    // Notify subscribers
    this.suggestionsSubject.next(suggestions);
  }

  /**
   * Suggest widgets based on user interactions
   */
  private suggestWidgets(interactions: UserInteraction[]): WidgetSuggestion[] {
    const suggestions: WidgetSuggestion[] = [];
    
    // Count view and click actions by target
    const targetCounts: { [key: string]: { views: number, clicks: number } } = {};
    
    interactions.forEach(interaction => {
      if (interaction.target && (interaction.action === 'view' || interaction.action === 'click')) {
        if (!targetCounts[interaction.target]) {
          targetCounts[interaction.target] = { views: 0, clicks: 0 };
        }
        
        if (interaction.action === 'view') {
          targetCounts[interaction.target].views++;
        } else if (interaction.action === 'click') {
          targetCounts[interaction.target].clicks++;
        }
      }
    });
    
    // Calculate engagement score for each target
    const targetScores = Object.entries(targetCounts).map(([target, counts]) => {
      const engagementScore = counts.views + (counts.clicks * 3); // Clicks weighted higher
      return { target, engagementScore };
    });
    
    // Sort by engagement score
    targetScores.sort((a, b) => b.engagementScore - a.engagementScore);
    
    // Generate suggestions for top targets
    const topTargets = targetScores.slice(0, 5);
    
    topTargets.forEach(({ target, engagementScore }) => {
      // Only suggest if engagement score is significant
      if (engagementScore > 10) {
        // Extract widget type from target
        const parts = target.split('-');
        const widgetType = parts[0];
        
        suggestions.push({
          id: `suggested-${target}`,
          title: this.getWidgetTitle(target),
          type: widgetType,
          confidence: Math.min(engagementScore / 50, 0.95), // Cap at 95%
          reason: `Vous utilisez fréquemment ce widget (${engagementScore} interactions)`
        });
      }
    });
    
    return suggestions;
  }

  /**
   * Suggest navigation based on user interactions
   */
  private suggestNavigation(interactions: UserInteraction[]): NavigationSuggestion[] {
    const suggestions: NavigationSuggestion[] = [];
    
    // Count navigate actions by target
    const pathCounts: { [key: string]: number } = {};
    
    interactions.forEach(interaction => {
      if (interaction.action === 'navigate' && interaction.target) {
        if (!pathCounts[interaction.target]) {
          pathCounts[interaction.target] = 0;
        }
        pathCounts[interaction.target]++;
      }
    });
    
    // Calculate frequency for each path
    const pathFrequency = Object.entries(pathCounts).map(([path, count]) => {
      return { path, count };
    });
    
    // Sort by frequency
    pathFrequency.sort((a, b) => b.count - a.count);
    
    // Generate suggestions for top paths
    const topPaths = pathFrequency.slice(0, 3);
    
    topPaths.forEach(({ path, count }) => {
      // Only suggest if count is significant
      if (count > 5) {
        suggestions.push({
          path,
          title: this.getPathTitle(path),
          confidence: Math.min(count / 20, 0.9), // Cap at 90%
          reason: `Vous visitez fréquemment cette page (${count} fois)`
        });
      }
    });
    
    return suggestions;
  }

  /**
   * Suggest filters based on user interactions
   */
  private suggestFilters(interactions: UserInteraction[]): FilterSuggestion[] {
    const suggestions: FilterSuggestion[] = [];
    
    // Count filter actions by field and value
    const filterCounts: { [key: string]: { [value: string]: number } } = {};
    
    interactions.forEach(interaction => {
      if (interaction.action === 'filter' && interaction.target && interaction.metadata?.value) {
        const field = interaction.target;
        const value = JSON.stringify(interaction.metadata.value);
        
        if (!filterCounts[field]) {
          filterCounts[field] = {};
        }
        
        if (!filterCounts[field][value]) {
          filterCounts[field][value] = 0;
        }
        
        filterCounts[field][value]++;
      }
    });
    
    // Generate suggestions for each field
    Object.entries(filterCounts).forEach(([field, values]) => {
      // Find most used value for this field
      const sortedValues = Object.entries(values)
        .map(([valueStr, count]) => ({ value: JSON.parse(valueStr), count }))
        .sort((a, b) => b.count - a.count);
      
      if (sortedValues.length > 0 && sortedValues[0].count > 3) {
        const topValue = sortedValues[0];
        
        suggestions.push({
          field,
          value: topValue.value,
          confidence: Math.min(topValue.count / 10, 0.85), // Cap at 85%
          reason: `Vous utilisez souvent ce filtre (${topValue.count} fois)`
        });
      }
    });
    
    return suggestions;
  }

  /**
   * Get a human-readable title for a widget
   */
  private getWidgetTitle(target: string): string {
    // Map of widget IDs to human-readable titles
    const widgetTitles: { [key: string]: string } = {
      'vulnerability-chart': 'Tendances des Vulnérabilités',
      'threat-feed': 'Flux de Menaces',
      'asm-heatmap': 'Heatmap ASM',
      'vi-radar': 'Radar de Vulnérabilités',
      'cti-world-map': 'Carte Mondiale CTI',
      'soar-gantt': 'Workflow SOAR',
      'top-vulnerabilities': 'Top 5 Vulnérabilités',
      'severity-distribution': 'Distribution par Sévérité',
      'monthly-trends': 'Tendances Mensuelles',
      'threat-map': 'Carte des Menaces',
      'mitre-heatmap': 'Heatmap MITRE',
      'threat-evolution': 'Évolution des Menaces',
      'attack-surface': 'Surface d\'Attaque',
      'external-risks': 'Risques Externes',
      'risk-score': 'Score de Risque',
      'incident-timeline': 'Timeline des Incidents',
      'resolution-rate': 'Taux de Résolution',
      'active-playbooks': 'Playbooks Actifs',
      'event-timeline': 'Timeline des Événements',
      'osint-treemap': 'Treemap OSINT',
      'soar-workflow': 'Workflow SOAR'
    };
    
    return widgetTitles[target] || target;
  }

  /**
   * Get a human-readable title for a path
   */
  private getPathTitle(path: string): string {
    // Map of paths to human-readable titles
    const pathTitles: { [key: string]: string } = {
      '/dashboard': 'Dashboard Principal',
      '/dashboard/main': 'Dashboard Principal',
      '/dashboard/vi': 'Intelligence de Vulnérabilités',
      '/dashboard/asm': 'Gestion de Surface d\'Attaque',
      '/dashboard/cti': 'Intelligence de Menaces',
      '/dashboard/soar': 'Réponse aux Incidents',
      '/visualizations': 'Visualisations de Sécurité',
      '/settings': 'Paramètres',
      '/profile': 'Profil Utilisateur'
    };
    
    return pathTitles[path] || path;
  }
}
