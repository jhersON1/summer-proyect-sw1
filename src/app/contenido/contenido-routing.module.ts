import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContenidoPageComponent } from './pages/contenido-page/contenido-page.component';
import { temaExistsGuard } from './guards/tema-exists.guard';

const routes: Routes = [
  {
    path: '',
    component: ContenidoPageComponent
  },
  {
    path: 'tema/:temaId',
    canActivate: [temaExistsGuard],
    component: ContenidoPageComponent
  },
  {
    path: '**',
    redirectTo: '',
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContenidoRoutingModule { }
