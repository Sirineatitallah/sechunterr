import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, of, map, startWith } from 'rxjs';

export interface FilterOption {
  value: string;
  label: string;
  group?: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  type: 'select' | 'multiselect' | 'date' | 'daterange' | 'text' | 'number' | 'range' | 'boolean' | 'autocomplete';
  options?: FilterOption[];
  placeholder?: string;
  defaultValue?: any;
  min?: number;
  max?: number;
  step?: number;
}

export interface FilterState {
  [key: string]: any;
}

export interface TimeRange {
  id: string;
  label: string;
  value: { start: Date | null; end: Date | null } | number;
}

@Component({
  selector: 'app-advanced-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatExpansionModule,
    MatSliderModule,
    MatCheckboxModule,
    MatAutocompleteModule
  ],
  templateUrl: './advanced-filter.component.html',
  styleUrls: ['./advanced-filter.component.scss']
})
export class AdvancedFilterComponent implements OnInit {
  @Input() filters: FilterConfig[] = [];
  @Input() timeRanges: TimeRange[] = [
    { id: '24h', label: '24 heures', value: 24 },
    { id: '7d', label: '7 jours', value: 7 * 24 },
    { id: '30d', label: '30 jours', value: 30 * 24 },
    { id: '90d', label: '90 jours', value: 90 * 24 },
    { id: 'custom', label: 'Personnalisé', value: { start: null, end: null } }
  ];
  @Input() defaultTimeRange: string = '7d';
  @Input() showSearch: boolean = true;
  @Input() showTimeRange: boolean = true;
  @Input() showAdvancedFilters: boolean = true;
  @Input() initialFilterState: FilterState = {};

  @Output() filterChange = new EventEmitter<FilterState>();
  @Output() timeRangeChange = new EventEmitter<TimeRange>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() resetFilters = new EventEmitter<void>();

  filterForm!: FormGroup;
  selectedTimeRange: TimeRange;
  searchQuery: string = '';
  advancedFiltersExpanded: boolean = false;
  filteredOptions: { [key: string]: Observable<FilterOption[]> } = {};
  activeFilters: { key: string; label: string; value: string }[] = [];

  constructor(private fb: FormBuilder) {
    this.selectedTimeRange = this.timeRanges.find(range => range.id === this.defaultTimeRange) || this.timeRanges[0];
  }

  ngOnInit(): void {
    this.initForm();
    this.updateActiveFilters();
  }

  private initForm(): void {
    const formControls: { [key: string]: any } = {};
    
    this.filters.forEach(filter => {
      const initialValue = this.initialFilterState[filter.id] !== undefined 
        ? this.initialFilterState[filter.id] 
        : filter.defaultValue;
      
      formControls[filter.id] = [initialValue];
      
      if (filter.type === 'autocomplete') {
        this.setupAutocomplete(filter);
      }
    });
    
    this.filterForm = this.fb.group(formControls);
    
    this.filterForm.valueChanges.subscribe(() => {
      this.updateActiveFilters();
      this.emitFilterChange();
    });
  }

  private setupAutocomplete(filter: FilterConfig): void {
    if (!filter.options) return;
    
    this.filteredOptions[filter.id] = this.filterForm.get(filter.id)!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value, filter.options || []))
    );
  }

  private _filter(value: string, options: FilterOption[]): FilterOption[] {
    const filterValue = value.toLowerCase();
    return options.filter(option => option.label.toLowerCase().includes(filterValue));
  }

  setTimeRange(range: TimeRange): void {
    this.selectedTimeRange = range;
    this.timeRangeChange.emit(range);
  }

  onSearchChange(): void {
    this.searchChange.emit(this.searchQuery);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchChange.emit('');
  }

  toggleAdvancedFilters(): void {
    this.advancedFiltersExpanded = !this.advancedFiltersExpanded;
  }

  resetAllFilters(): void {
    this.filterForm.reset();
    this.searchQuery = '';
    this.selectedTimeRange = this.timeRanges.find(range => range.id === this.defaultTimeRange) || this.timeRanges[0];
    this.activeFilters = [];
    this.resetFilters.emit();
    this.searchChange.emit('');
    this.timeRangeChange.emit(this.selectedTimeRange);
  }

  removeFilter(key: string): void {
    this.filterForm.get(key)?.reset();
    this.updateActiveFilters();
    this.emitFilterChange();
  }

  private updateActiveFilters(): void {
    this.activeFilters = [];
    const formValues = this.filterForm.value;
    
    Object.keys(formValues).forEach(key => {
      const value = formValues[key];
      if (value !== null && value !== undefined && value !== '') {
        const filter = this.filters.find(f => f.id === key);
        if (filter) {
          let displayValue = '';
          
          if (filter.type === 'select' || filter.type === 'autocomplete') {
            const option = filter.options?.find(opt => opt.value === value);
            displayValue = option?.label || value;
          } else if (filter.type === 'multiselect' && Array.isArray(value)) {
            displayValue = value.map(v => {
              const option = filter.options?.find(opt => opt.value === v);
              return option?.label || v;
            }).join(', ');
          } else if (filter.type === 'boolean') {
            displayValue = value ? 'Oui' : 'Non';
          } else if (filter.type === 'daterange' && value.start && value.end) {
            displayValue = `${this.formatDate(value.start)} - ${this.formatDate(value.end)}`;
          } else if (filter.type === 'date') {
            displayValue = this.formatDate(value);
          } else if (filter.type === 'range') {
            displayValue = `${value[0]} - ${value[1]}`;
          } else {
            displayValue = value.toString();
          }
          
          this.activeFilters.push({
            key,
            label: filter.label,
            value: displayValue
          });
        }
      }
    });
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  }

  private emitFilterChange(): void {
    this.filterChange.emit(this.filterForm.value);
  }

  getOptionGroups(options: FilterOption[]): { [key: string]: FilterOption[] } {
    const groups: { [key: string]: FilterOption[] } = {};
    
    options.forEach(option => {
      const group = option.group || 'default';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(option);
    });
    
    return groups;
  }

  hasGroupedOptions(options: FilterOption[]): boolean {
    return options.some(option => !!option.group);
  }
}
