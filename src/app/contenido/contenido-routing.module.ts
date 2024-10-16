import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContenidoPageComponent } from './pages/contenido-page/contenido-page.component';

const routes: Routes = [
  {
    path: '',
    component: ContenidoPageComponent
  },
  {
    path: 'tema/:temaId',
    component: ContenidoPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContenidoRoutingModule { }
