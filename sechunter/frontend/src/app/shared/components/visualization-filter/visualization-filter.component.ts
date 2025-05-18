import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormBuilder, FormGroup } from '@angular/forms';

export interface FilterOptions {
  severities: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  searchTerm: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

@Component({
  selector: 'app-visualization-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './visualization-filter.component.html',
  styleUrls: ['./visualization-filter.component.css']
})
export class VisualizationFilterComponent implements OnInit {
  @Input() availableSeverities: string[] = ['Critical', 'High', 'Medium', 'Low'];
  @Input() availableSortOptions: { value: string, label: string }[] = [
    { value: 'value', label: 'Score' },
    { value: 'name', label: 'Name' },
    { value: 'published', label: 'Date' }
  ];

  @Output() filterChange = new EventEmitter<FilterOptions>();

  filterForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      severities: [[]],
      dateRange: this.fb.group({
        start: [null],
        end: [null]
      }),
      searchTerm: [''],
      sortBy: ['value'],
      sortDirection: ['desc']
    });
  }

  ngOnInit(): void {
    // Initialize with default values
    this.filterForm.valueChanges.subscribe(values => {
      this.filterChange.emit(values);
    });

    // Emit initial values
    this.filterChange.emit(this.filterForm.value);
  }

  clearFilters(): void {
    this.filterForm.patchValue({
      severities: [],
      dateRange: {
        start: null,
        end: null
      },
      searchTerm: '',
      sortBy: 'value',
      sortDirection: 'desc'
    });
  }

  toggleSortDirection(): void {
    const currentDirection = this.filterForm.get('sortDirection')?.value;
    this.filterForm.get('sortDirection')?.setValue(
      currentDirection === 'asc' ? 'desc' : 'asc'
    );
  }
}
