import { Routes } from '@angular/router';
import { TopVulnerabilitiesComponent } from './components/top-vulnerabilities/top-vulnerabilities.component';
import { SeverityDistributionComponent } from './components/severity-distribution/severity-distribution.component';
import { MonthlyTrendsComponent } from './components/monthly-trends/monthly-trends.component';

export const VI_ROUTES: Routes = [
  { path: '', component: TopVulnerabilitiesComponent },
  { path: 'top', component: TopVulnerabilitiesComponent },
  { path: 'severity', component: SeverityDistributionComponent },
  { path: 'trends', component: MonthlyTrendsComponent }
];
