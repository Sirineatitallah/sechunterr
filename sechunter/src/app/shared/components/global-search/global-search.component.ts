import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'vulnerability' | 'threat' | 'asset' | 'incident' | 'task';
  icon: string;
  link: string;
}

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <div class="global-search-container" [class.expanded]="isExpanded">
      <div class="search-input-container">
        <mat-form-field appearance="outline" class="search-field">
          <mat-icon matPrefix>search</mat-icon>
          <input
            matInput
            type="text"
            placeholder="Rechercher dans tous les modules..."
            [(ngModel)]="searchQuery"
            (focus)="expandSearch()"
            (keyup)="onSearchInput()"
            [matAutocomplete]="auto"
          >
          <button
            *ngIf="searchQuery"
            matSuffix
            mat-icon-button
            aria-label="Clear"
            (click)="clearSearch()">
            <mat-icon>close</mat-icon>
          </button>
        </mat-form-field>

        <div class="search-filters" *ngIf="isExpanded">
          <div class="filter-chips">
            <mat-chip-listbox multiple>
              <mat-chip-option
                *ngFor="let filter of filters"
                [selected]="filter.selected"
                (selectionChange)="toggleFilter(filter)">
                <mat-icon>{{filter.icon}}</mat-icon>
                {{filter.label}}
              </mat-chip-option>
            </mat-chip-listbox>
          </div>

          <div class="advanced-search-toggle">
            <button mat-button (click)="toggleAdvancedSearch()">
              <mat-icon>{{showAdvancedSearch ? 'expand_less' : 'expand_more'}}</mat-icon>
              {{showAdvancedSearch ? 'Masquer les options avancées' : 'Options avancées'}}
            </button>
          </div>

          <div class="advanced-search-options" *ngIf="showAdvancedSearch">
            <div class="date-range">
              <span>Période:</span>
              <button mat-button [class.active]="dateRange === 'today'" (click)="setDateRange('today')">Aujourd'hui</button>
              <button mat-button [class.active]="dateRange === 'week'" (click)="setDateRange('week')">Cette semaine</button>
              <button mat-button [class.active]="dateRange === 'month'" (click)="setDateRange('month')">Ce mois</button>
              <button mat-button [class.active]="dateRange === 'custom'" (click)="setDateRange('custom')">Personnalisé</button>
            </div>

            <div class="severity-filters">
              <span>Sévérité:</span>
              <button mat-button [class.active]="severityFilters.critical" (click)="toggleSeverity('critical')">Critique</button>
              <button mat-button [class.active]="severityFilters.high" (click)="toggleSeverity('high')">Élevée</button>
              <button mat-button [class.active]="severityFilters.medium" (click)="toggleSeverity('medium')">Moyenne</button>
              <button mat-button [class.active]="severityFilters.low" (click)="toggleSeverity('low')">Faible</button>
            </div>
          </div>
        </div>
      </div>

      <mat-autocomplete #auto="matAutocomplete">
        <mat-option *ngFor="let result of searchResults" [value]="result.title" (click)="selectResult(result)">
          <div class="search-result-item">
            <mat-icon [ngClass]="result.type">{{result.icon}}</mat-icon>
            <div class="result-content">
              <div class="result-title">{{result.title}}</div>
              <div class="result-description">{{result.description}}</div>
            </div>
            <mat-icon class="result-action">arrow_forward</mat-icon>
          </div>
        </mat-option>
      </mat-autocomplete>
    </div>
  `,
  styles: [`
    .global-search-container {
      position: relative;
      width: 300px;
      transition: all 0.3s ease;
    }

    .global-search-container.expanded {
      width: 500px;
    }

    .search-input-container {
      display: flex;
      flex-direction: column;
    }

    .search-field {
      width: 100%;
    }

    .search-filters {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 0 0 8px 8px;
      padding: 10px;
      margin-top: -10px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-top: none;
      animation: slideDown 0.3s ease;
    }

    .filter-chips {
      margin-bottom: 10px;
    }

    .advanced-search-toggle {
      text-align: center;
      margin: 5px 0;
    }

    .advanced-search-options {
      animation: fadeIn 0.3s ease;
    }

    .date-range, .severity-filters {
      display: flex;
      align-items: center;
      gap: 5px;
      margin: 10px 0;
      flex-wrap: wrap;
    }

    .date-range span, .severity-filters span {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.9rem;
      margin-right: 5px;
    }

    button.active {
      background: rgba(71, 118, 230, 0.2);
      color: #4776E6;
    }

    .search-result-item {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .result-content {
      flex: 1;
    }

    .result-title {
      font-weight: 500;
    }

    .result-description {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.7);
    }

    .result-action {
      color: rgba(255, 255, 255, 0.5);
    }

    mat-icon.vulnerability { color: #ff4757; }
    mat-icon.threat { color: #ffa502; }
    mat-icon.asset { color: #1e90ff; }
    mat-icon.incident { color: #8e54e9; }
    mat-icon.task { color: #2ed573; }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class GlobalSearchComponent implements OnInit {
  @Output() search = new EventEmitter<string>();
  @Output() resultSelected = new EventEmitter<SearchResult>();

  searchQuery = '';
  isExpanded = false;
  showAdvancedSearch = false;
  dateRange: 'today' | 'week' | 'month' | 'custom' = 'week';

  severityFilters = {
    critical: true,
    high: true,
    medium: true,
    low: false
  };

  filters = [
    { id: 'vulnerabilities', label: 'Vulnérabilités', icon: 'bug_report', selected: true },
    { id: 'threats', label: 'Menaces', icon: 'gpp_maybe', selected: true },
    { id: 'assets', label: 'Actifs', icon: 'devices', selected: true },
    { id: 'incidents', label: 'Incidents', icon: 'healing', selected: true },
    { id: 'tasks', label: 'Tâches', icon: 'assignment', selected: false }
  ];

  searchResults: SearchResult[] = [];
  private searchSubject = new Subject<string>();

  constructor() { }

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.performSearch(query);
    });
  }

  expandSearch(): void {
    this.isExpanded = true;
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchQuery);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
    this.isExpanded = false;
  }

  toggleAdvancedSearch(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  toggleFilter(filter: any): void {
    filter.selected = !filter.selected;
    this.performSearch(this.searchQuery);
  }

  setDateRange(range: 'today' | 'week' | 'month' | 'custom'): void {
    this.dateRange = range;
    this.performSearch(this.searchQuery);
  }

  toggleSeverity(severity: string): void {
    this.severityFilters[severity as keyof typeof this.severityFilters] =
      !this.severityFilters[severity as keyof typeof this.severityFilters];
    this.performSearch(this.searchQuery);
  }

  selectResult(result: SearchResult): void {
    this.resultSelected.emit(result);
  }

  private performSearch(query: string): void {
    if (!query || query.length < 2) {
      this.searchResults = [];
      return;
    }

    // Mock search results - in a real app, this would call a service
    const mockResults: SearchResult[] = [
      {
        id: '1',
        title: 'CVE-2023-1234',
        description: 'Vulnérabilité critique dans Apache Log4j',
        type: 'vulnerability',
        icon: 'bug_report',
        link: '/dashboard/vi'
      },
      {
        id: '2',
        title: 'APT-29 (Cozy Bear)',
        description: 'Groupe de menace d\'origine russe',
        type: 'threat',
        icon: 'gpp_maybe',
        link: '/dashboard/cti'
      },
      {
        id: '3',
        title: 'SRV-001',
        description: 'Serveur avec 5 vulnérabilités critiques',
        type: 'asset',
        icon: 'devices',
        link: '/dashboard/asm'
      },
      {
        id: '4',
        title: 'INC-001',
        description: 'Incident de malware en cours',
        type: 'incident',
        icon: 'healing',
        link: '/dashboard'
      },
      {
        id: '5',
        title: 'Analyse de vulnérabilité',
        description: 'Tâche assignée il y a 2 heures',
        type: 'task',
        icon: 'assignment',
        link: '#'
      }
    ];

    this.searchResults = mockResults.filter(result => {
      // Apply filters
      const matchesQuery = result.title.toLowerCase().includes(query.toLowerCase()) ||
                          result.description.toLowerCase().includes(query.toLowerCase());

      const typeFilter = this.filters.find(f => {
        if (f.id === 'vulnerabilities' && result.type === 'vulnerability') return true;
        if (f.id === 'threats' && result.type === 'threat') return true;
        if (f.id === 'assets' && result.type === 'asset') return true;
        if (f.id === 'incidents' && result.type === 'incident') return true;
        if (f.id === 'tasks' && result.type === 'task') return true;
        return false;
      });

      return matchesQuery && typeFilter?.selected;
    });

    this.search.emit(query);
  }
}
