import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';

interface ProductData {
  name: string;
  popularity: number;
  sales: number;
  score: number;
}

@Component({
  selector: 'app-top-products-chart',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './top-products-chart.component.html',
  styleUrl: './top-products-chart.component.css'
})
export class TopProductsChartComponent implements OnInit {
  // Product data
  products: ProductData[] = [
    { name: 'Home Decor Bundle', popularity: 85, sales: 1250, score: 92 },
    { name: 'Galaxy Princess Mini Bag (L)', popularity: 72, sales: 980, score: 88 },
    { name: 'Bathroom Essentials', popularity: 65, sales: 1100, score: 78 },
    { name: 'Apple Smartwatches', popularity: 90, sales: 1500, score: 95 }
  ];

  // Chart options for horizontal bar chart
  view: [number, number] = [700, 300];
  showXAxis = true;
  showYAxis = true;
  gradient = true;
  showLegend = false;
  showXAxisLabel = true;
  xAxisLabel = 'Score';
  showYAxisLabel = false;

  colorScheme: any = {
    domain: ['#FF9F1C', '#2EC4B6', '#E71D36', '#011627']
  };

  // Chart data
  barChartData: any[] = [];

  constructor() { }

  ngOnInit(): void {
    this.prepareChartData();
  }

  prepareChartData(): void {
    this.barChartData = this.products.map(product => {
      return {
        name: product.name,
        value: product.score
      };
    });
  }

  getPopularityColor(value: number): string {
    if (value >= 90) return '#00E676';
    if (value >= 80) return '#2EC4B6';
    if (value >= 70) return '#FFD166';
    if (value >= 60) return '#FF9F1C';
    return '#E71D36';
  }

  getSalesColor(value: number): string {
    if (value >= 1400) return '#00E676';
    if (value >= 1100) return '#2EC4B6';
    if (value >= 900) return '#FFD166';
    if (value >= 700) return '#FF9F1C';
    return '#E71D36';
  }

  getScoreColor(value: number): string {
    if (value >= 90) return '#00E676';
    if (value >= 80) return '#2EC4B6';
    if (value >= 70) return '#FFD166';
    if (value >= 60) return '#FF9F1C';
    return '#E71D36';
  }

  onSelect(event: any): void {
    console.log('Item clicked', event);
  }
}
