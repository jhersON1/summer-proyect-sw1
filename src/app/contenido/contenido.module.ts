import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContenidoRoutingModule } from './contenido-routing.module';
import { ContenidoPageComponent } from './pages/contenido-page/contenido-page.component';


@NgModule({
  declarations: [
    ContenidoPageComponent
  ],
  imports: [
    CommonModule,
    ContenidoRoutingModule
  ]
})
export class ContenidoModule { }
