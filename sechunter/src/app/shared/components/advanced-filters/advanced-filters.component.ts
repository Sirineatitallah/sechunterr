import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatSliderModule } from '@angular/material/slider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface FilterOption {
  id: string;
  label: string;
  type: 'select' | 'date' | 'dateRange' | 'text' | 'number' | 'slider' | 'checkbox' | 'radio';
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: any;
}

export interface FilterConfig {
  id: string;
  label: string;
  icon: string;
  options: FilterOption[];
}

@Component({
  selector: 'app-advanced-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatSliderModule,
    MatExpansionModule,
    MatTooltipModule
  ],
  template: `
    <div class="advanced-filters-container" [class.expanded]="isExpanded">
      <div class="filters-header" (click)="toggleExpand()">
        <div class="header-title">
          <mat-icon>filter_list</mat-icon>
          <span>Filtres avancés</span>
        </div>
        <div class="active-filters-count" *ngIf="activeFiltersCount > 0">
          {{activeFiltersCount}} filtre{{activeFiltersCount > 1 ? 's' : ''}} actif{{activeFiltersCount > 1 ? 's' : ''}}
        </div>
        <button mat-icon-button>
          <mat-icon>{{isExpanded ? 'expand_less' : 'expand_more'}}</mat-icon>
        </button>
      </div>
      
      <div class="filters-content" *ngIf="isExpanded">
        <form [formGroup]="filterForm">
          <mat-expansion-panel *ngFor="let category of filterConfig" class="filter-category">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon>{{category.icon}}</mat-icon>
                {{category.label}}
              </mat-panel-title>
            </mat-expansion-panel-header>
            
            <div class="filter-options">
              <div *ngFor="let option of category.options" class="filter-option">
                <div [ngSwitch]="option.type">
                  <!-- Select dropdown -->
                  <mat-form-field *ngSwitchCase="'select'" appearance="outline">
                    <mat-label>{{option.label}}</mat-label>
                    <mat-select [formControlName]="option.id">
                      <mat-option value="">Tous</mat-option>
                      <mat-option *ngFor="let opt of option.options" [value]="opt.value">
                        {{opt.label}}
                      </mat-option>
                    </mat-select>
                  </mat-form-field>
                  
                  <!-- Text input -->
                  <mat-form-field *ngSwitchCase="'text'" appearance="outline">
                    <mat-label>{{option.label}}</mat-label>
                    <input matInput [formControlName]="option.id">
                  </mat-form-field>
                  
                  <!-- Number input -->
                  <mat-form-field *ngSwitchCase="'number'" appearance="outline">
                    <mat-label>{{option.label}}</mat-label>
                    <input matInput type="number" [formControlName]="option.id">
                  </mat-form-field>
                  
                  <!-- Date picker -->
                  <mat-form-field *ngSwitchCase="'date'" appearance="outline">
                    <mat-label>{{option.label}}</mat-label>
                    <input matInput [matDatepicker]="picker" [formControlName]="option.id">
                    <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                    <mat-datepicker #picker></mat-datepicker>
                  </mat-form-field>
                  
                  <!-- Date range -->
                  <div *ngSwitchCase="'dateRange'" class="date-range-container">
                    <span class="option-label">{{option.label}}</span>
                    <div class="date-range-inputs">
                      <mat-form-field appearance="outline">
                        <mat-label>Début</mat-label>
                        <input matInput [matDatepicker]="startPicker" [formControlName]="option.id + 'Start'">
                        <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                        <mat-datepicker #startPicker></mat-datepicker>
                      </mat-form-field>
                      
                      <mat-form-field appearance="outline">
                        <mat-label>Fin</mat-label>
                        <input matInput [matDatepicker]="endPicker" [formControlName]="option.id + 'End'">
                        <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                        <mat-datepicker #endPicker></mat-datepicker>
                      </mat-form-field>
                    </div>
                  </div>
                  
                  <!-- Slider -->
                  <div *ngSwitchCase="'slider'" class="slider-container">
                    <span class="option-label">{{option.label}}: {{filterForm.get(option.id)?.value}}</span>
                    <mat-slider
                      [min]="option.min || 0"
                      [max]="option.max || 100"
                      [step]="option.step || 1"
                      [discrete]="true">
                      <input matSliderThumb [formControlName]="option.id">
                    </mat-slider>
                  </div>
                </div>
              </div>
            </div>
          </mat-expansion-panel>
        </form>
        
        <div class="filter-actions">
          <button mat-button color="warn" (click)="resetFilters()">
            <mat-icon>clear</mat-icon>
            Réinitialiser
          </button>
          <button mat-raised-button color="primary" (click)="applyFilters()">
            <mat-icon>check</mat-icon>
            Appliquer
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .advanced-filters-container {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      margin-bottom: 1.5rem;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    
    .filters-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      cursor: pointer;
      transition: background 0.3s ease;
    }
    
    .filters-header:hover {
      background: rgba(255, 255, 255, 0.05);
    }
    
    .header-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.9);
    }
    
    .active-filters-count {
      background: rgba(71, 118, 230, 0.2);
      color: #4776E6;
      padding: 0.3rem 0.8rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
    }
    
    .filters-content {
      padding: 0 1.5rem 1.5rem;
      animation: slideDown 0.3s ease;
    }
    
    .filter-category {
      margin-bottom: 1rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .filter-options {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 0.5rem;
    }
    
    .filter-option {
      width: 100%;
    }
    
    .date-range-container, .slider-container {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .date-range-inputs {
      display: flex;
      gap: 1rem;
    }
    
    .option-label {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.9rem;
    }
    
    .filter-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1rem;
    }
    
    mat-form-field {
      width: 100%;
    }
    
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class AdvancedFiltersComponent implements OnInit {
  @Input() filterConfig: FilterConfig[] = [];
  @Output() filtersChanged = new EventEmitter<any>();
  
  isExpanded = false;
  filterForm: FormGroup;
  activeFiltersCount = 0;
  
  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({});
  }
  
  ngOnInit(): void {
    this.initializeForm();
  }
  
  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }
  
  resetFilters(): void {
    this.filterForm.reset();
    this.activeFiltersCount = 0;
    this.filtersChanged.emit({});
  }
  
  applyFilters(): void {
    const filters = this.filterForm.value;
    
    // Count active filters
    this.activeFiltersCount = Object.keys(filters).filter(key => {
      const value = filters[key];
      return value !== null && value !== '' && value !== undefined;
    }).length;
    
    this.filtersChanged.emit(filters);
  }
  
  private initializeForm(): void {
    const formControls: any = {};
    
    this.filterConfig.forEach(category => {
      category.options.forEach(option => {
        if (option.type === 'dateRange') {
          formControls[option.id + 'Start'] = [option.defaultValue?.start || null];
          formControls[option.id + 'End'] = [option.defaultValue?.end || null];
        } else {
          formControls[option.id] = [option.defaultValue || null];
        }
      });
    });
    
    this.filterForm = this.fb.group(formControls);
  }
}
