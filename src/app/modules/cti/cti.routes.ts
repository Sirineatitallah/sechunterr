import { Routes } from '@angular/router';
import { ThreatMapComponent } from './components/threat-map/threat-map.component';
import { MitreHeatmapComponent } from './components/mitre-heatmap/mitre-heatmap.component';
import { ThreatEvolutionComponent } from './components/threat-evolution/threat-evolution.component';
import { CtiDashboardComponent } from '../../../cti/components/cti-dashboard/cti-dashboard.component';

export const CTI_ROUTES: Routes = [
  { path: '', component: CtiDashboardComponent },
  { path: 'dashboard', component: CtiDashboardComponent },
  { path: 'map', component: ThreatMapComponent },
  { path: 'mitre', component: MitreHeatmapComponent },
  { path: 'evolution', component: ThreatEvolutionComponent }
];
