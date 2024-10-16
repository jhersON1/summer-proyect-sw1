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
    children: [
      { path: '', redirectTo: 'materia', pathMatch: 'full' }, // Redirect to /app/materia
      {
        path: 'materia',
        children: [
          { path: '',  component: MateriasPageComponent },
          { path: ':materiaId', loadChildren: () => import('./contenido/contenido.module').then(m => m.ContenidoModule) }
        ]
      },
      { path: 'compartido', component: CompartidosPageComponent },
    ]
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
