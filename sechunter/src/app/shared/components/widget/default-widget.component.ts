import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetPosition } from '../../../core/models/widget-position.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-default-widget',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="default-widget">
      <div class="header">
        <mat-icon>warning</mat-icon>
        <h3>{{ config.title || 'Widget non configuré' }}</h3>
      </div>
      <div class="content">
        <p>Ce widget n'a pas de configuration spécifique</p>
        <button mat-stroked-button (click)="handleRefresh()">
          <mat-icon>refresh</mat-icon>
          Réessayer
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./default-widget.component.scss']
})
export class DefaultWidgetComponent {
  @Input() config!: WidgetPosition;

  handleRefresh() {
    window.location.reload();
  }
}