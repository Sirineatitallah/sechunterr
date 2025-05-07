import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * IMPORTANT: This module is not needed for standalone components.
 *
 * The application is using Angular's standalone component API, where each component
 * imports its own dependencies. This module is kept for documentation purposes only.
 *
 * All chart components in this directory are already configured as standalone components:
 * - ChartsDashboardComponent
 * - CountryMapComponent
 * - RevenueBarChartComponent
 * - SatisfactionLineChartComponent
 * - TargetRealityChartComponent
 * - TopProductsChartComponent
 * - VolumeServiceChartComponent
 *
 * To use these components in other standalone components, import them directly:
 *
 * ```typescript
 * @Component({
 *   standalone: true,
 *   imports: [
 *     CommonModule,
 *     RevenueBarChartComponent,
 *     CountryMapComponent,
 *     // etc.
 *   ]
 * })
 * ```
 */
@NgModule({
  imports: [
    CommonModule
  ]
})
export class DashboardChartsModule { }
