import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContenidoRoutingModule } from './contenido-routing.module';
import { ContenidoPageComponent } from './pages/contenido-page/contenido-page.component';

import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TableModule } from 'primeng/table';

@NgModule({
  declarations: [
    ContenidoPageComponent
  ],
  imports: [
    CommonModule,
    ContenidoRoutingModule,

    BreadcrumbModule,
    TableModule,
  ]
})
export class ContenidoModule { }
