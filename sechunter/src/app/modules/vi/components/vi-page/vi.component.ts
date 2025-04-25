// Update vi.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { WidgetComponent } from '../../../../shared/components/widget/widget.component';

@Component({
  standalone: true,
  imports: [CommonModule, WidgetComponent],
  templateUrl: './vi.component.html',
  styleUrls: ['./vi.component.scss']
})
export class ViComponent {
  widgetConfig = { 
    type: 'vi-dashboard',
    refreshInterval: 300000 // 5 minutes
  };
}