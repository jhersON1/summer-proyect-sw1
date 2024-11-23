import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeLayoutComponent } from './layout/home-layout/home-layout.component';
import { MateriasPageComponent } from './pages/materias-page/materias-page.component';
import { CompartidosPageComponent } from './pages/compartidos-page/compartidos-page.component';
import { materiaExistsGuard } from './guards/materia-exists.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'materia', pathMatch: 'full'
  }, // Redirect to /app/materia
  {
    path:'',
    component: HomeLayoutComponent,
    children:[
      {
        path: 'materia',
        component: MateriasPageComponent,
      },
      {
        path: 'compartido',
        component: CompartidosPageComponent
      },
    ]
  },
  {
    path: 'materia/:materiaId',
    canActivate: [materiaExistsGuard],
    loadChildren: () => import('../contenido/contenido.module').then(m => m.ContenidoModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
