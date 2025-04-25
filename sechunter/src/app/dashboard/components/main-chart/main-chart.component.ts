// src/app/dashboard/components/main-chart/main-chart.component.ts
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <!-- Intégrer ici ApexCharts ou une autre bibliothèque -->
      <div class="chart-placeholder">
        <h4>Vulnerability Trends Chart</h4>
        <p *ngIf="!data?.length">No data available</p>
        <ul *ngIf="data?.length">
          <li *ngFor="let item of data">
            {{item.date}}: {{item.critical}} critical, {{item.high}} high
          </li>
        </ul>
      </div>
    </div>
  `,
  styleUrls: ['./main-chart.component.scss']
})
export class MainChartComponent implements OnInit, OnChanges {
  @Input() data: any[] = [];

  ngOnInit() {
    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.updateChart();
    }
  }

  private initChart() {
    // Initialiser le graphique
    console.log('Chart initialized with data:', this.data);
  }

  private updateChart() {
    // Mettre à jour le graphique avec les nouvelles données
    console.log('Chart updated with data:', this.data);
  }
}