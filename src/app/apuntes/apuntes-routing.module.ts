import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditorPageComponent } from './pages/editor-page/editor-page.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '1', pathMatch: 'full'
  },

  {
    path: ':apunteId',
    component: EditorPageComponent,
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApuntesRoutingModule { }
