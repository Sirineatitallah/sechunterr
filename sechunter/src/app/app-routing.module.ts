import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { SignupComponent } from './signup/signup.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';
import { AdminDashboardComponent } from './modules/admin/components/admin-dashboard/admin-dashboard.component';
import { ClientDashboardComponent } from './modules/client/components/client-dashboard/client-dashboard.component';
import { RoleGuard } from './core/guards/role.guard';
import { UserRole } from './core/models/user.model';
import { GlobalInfoComponent } from './shared/components/global-info/global-info.component';
import { VisualizationDashboardComponent } from './dashboard/visualization-dashboard/visualization-dashboard.component';
import { CtiComponent } from './modules/cti/components/cti-page/cti.component';
import { AsmComponent } from './modules/asm/components/asm-page/asm.component';
import { SoarComponent } from './modules/soar/components/soar-page/soar.component';
import { ViComponent } from './modules/vi/components/vi-page/vi.component';
import { UserDashboardComponent } from './dashboard/user-dashboard/user-dashboard.component';
import { MainDashboardComponent } from './dashboard/main-dashboard/main-dashboard.component';

const routes: Routes = [
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  { path: 'auth', component: AuthComponent },
  { path: 'signup', component: SignupComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'main',
        pathMatch: 'full'
      },
      {
        path: 'main',
        component: MainDashboardComponent,
        canActivate: [RoleGuard],
        data: { roles: [UserRole.ADMIN] }
      },
      {
        path: 'user',
        component: UserDashboardComponent,
        canActivate: [RoleGuard],
        data: { roles: [UserRole.CLIENT] }
      },
      {
        path: 'admin',
        component: AdminDashboardComponent,
        canActivate: [RoleGuard],
        data: { roles: [UserRole.ADMIN, UserRole.SUPERUSER] }
      },
      {
        path: 'client',
        component: ClientDashboardComponent,
        canActivate: [RoleGuard],
        data: { roles: [UserRole.CLIENT] }
      },
      {
        path: 'info',
        component: GlobalInfoComponent
      },
      {
        path: 'visualizations',
        component: VisualizationDashboardComponent
      },
      {
        path: 'cti',
        component: CtiComponent
      },
      {
        path: 'asm',
        component: AsmComponent
      },
      {
        path: 'soar',
        component: SoarComponent
      },
      {
        path: 'vi',
        component: ViComponent
      }
    ]
  },
  { path: '**', redirectTo: '/auth' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
