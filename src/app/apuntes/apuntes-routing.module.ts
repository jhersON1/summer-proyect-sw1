import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApuntePageComponent } from './pages/apunte-page/apunte-page.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '1', pathMatch: 'full'
  },
  {
    path: ':apunteId',
    component: ApuntePageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApuntesRoutingModule { }
