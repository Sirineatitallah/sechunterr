import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-display.component.html',
  styleUrls: ['./error-display.component.scss']
})
export class ErrorDisplayComponent {
  @Input() message: string = 'Une erreur est survenue lors du chargement des données.';
  @Input() errorDetails?: string;
  @Input() retryable: boolean = true;
  @Input() height: string = '200px';
  @Input() width: string = '100%';
  
  @Output() retry = new EventEmitter<void>();

  showDetails = false;

  onRetry(): void {
    this.retry.emit();
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }
}
