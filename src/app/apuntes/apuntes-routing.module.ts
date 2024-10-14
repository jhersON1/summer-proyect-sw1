import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApuntesPageComponent } from './pages/apuntes-page/apuntes-page.component';

const routes: Routes = [
  {
    path: '',
    component: ApuntesPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApuntesRoutingModule { }
