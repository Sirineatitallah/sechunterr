import { Routes } from '@angular/router';
import { IncidentTimelineComponent } from './components/incident-timeline/incident-timeline.component';
import { ResolutionRateComponent } from './components/resolution-rate/resolution-rate.component';
import { ActivePlaybooksComponent } from './components/active-playbooks/active-playbooks.component';

export const SOAR_ROUTES: Routes = [
  { path: '', component: IncidentTimelineComponent },
  { path: 'timeline', component: IncidentTimelineComponent },
  { path: 'resolution', component: ResolutionRateComponent },
  { path: 'playbooks', component: ActivePlaybooksComponent }
];
