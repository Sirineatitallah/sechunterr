//vi.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { WidgetComponent } from './../../../../shared/components/widget/widget.component';
import { WidgetPosition } from './../../../../core/models/widget-position.model';


@Component({
  standalone: true,
  imports: [CommonModule, WidgetComponent],
  templateUrl: './vi.component.html',
  styleUrls: ['./vi.component.scss']
})
export class ViComponent {
  widgetConfig: WidgetPosition = {
    id: 'vi-widget-1',
    type: 'vulnerability',
    x: 0,
    y: 0,
    cols: 4,
    rows: 2,
    config: {
      refreshInterval: 3000
    }
  };
}