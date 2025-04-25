import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridsterModule, GridsterConfig, GridsterItem, GridType } from 'angular-gridster2';
import { WidgetComponent } from './../shared/components/widget/widget.component';

// Étendre l'interface GridsterItem pour inclure la propriété 'type'
interface DashboardItem extends GridsterItem {
  type: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, GridsterModule, WidgetComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  gridsterOptions: GridsterConfig = {
    gridType: GridType.Fit,
    margin: 10,
    outerMargin: true,
    draggable: { enabled: true },
    resizable: { enabled: true },
    mobileBreakpoint: 768
  };
  
  dashboardWidgets: Array<DashboardItem> = [
    { cols: 2, rows: 1, x: 0, y: 0, type: 'vulnerability-chart' },
    { cols: 1, rows: 1, x: 2, y: 0, type: 'threat-feed' }
  ];
}