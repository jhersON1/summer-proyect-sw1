import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MateriasListPageComponent } from './materias-list-page/materias-list-page.component';

const routes: Routes = [
  {
    path: '',
    component: MateriasListPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MateriasRoutingModule { }
