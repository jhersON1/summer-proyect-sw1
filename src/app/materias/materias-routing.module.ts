import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MateriasListPageComponent } from './materias-list-page/materias-list-page.component';

const routes: Routes = [
  {
    path: '',
    component: MateriasListPageComponent
  },
  {
    path: 'materia/:id',
    loadChildren: () => import('../contenido/contenido.module').then(m => m.ContenidoModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MateriasRoutingModule { }
