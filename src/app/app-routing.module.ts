import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LayoutPageComponent } from './layout/layout-page/layout-page.component';
import { isAuthenticatedGuard, isNotAuthenticatedGuard } from './auth/guards';
import { MateriasPageComponent } from './home/pages/materias-page/materias-page.component';
import { CompartidosPageComponent } from './home/pages/compartidos-page/compartidos-page.component';

const routes: Routes = [
  {
    path: '',
    // canActivate: [ isNotAuthenticatedGuard ],
    loadChildren: () => import('./landing/landing.module').then(m => m.LandingModule)
  },
  {
    path: 'auth',
    canActivate: [isNotAuthenticatedGuard],
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'app',
    canActivate: [isAuthenticatedGuard],
    component: LayoutPageComponent,
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
  },
  {
    path: '**',
    redirectTo: 'auth'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
