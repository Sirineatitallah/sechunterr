import { Routes } from '@angular/router';
import { AttackSurfaceComponent } from './components/attack-surface/attack-surface.component';
import { ExternalRisksComponent } from './components/external-risks/external-risks.component';
import { RiskScoreComponent } from './components/risk-score/risk-score.component';

export const ASM_ROUTES: Routes = [
  { path: '', component: AttackSurfaceComponent },
  { path: 'surface', component: AttackSurfaceComponent },
  { path: 'risks', component: ExternalRisksComponent },
  { path: 'score', component: RiskScoreComponent }
];
