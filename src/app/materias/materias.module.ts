import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MateriasRoutingModule } from './materias-routing.module';
import { MateriasListPageComponent } from './materias-list-page/materias-list-page.component';
import { NewMateriaComponent } from './components/new-materia/new-materia.component';
import { CardMateriaComponent } from './components/card-materia/card-materia.component';

import { TabMenuModule } from 'primeng/tabmenu';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';


@NgModule({
  declarations: [
    CardMateriaComponent,
    MateriasListPageComponent,
    NewMateriaComponent
  ],
  imports: [
    CommonModule,
    MateriasRoutingModule,

    TabMenuModule,
    CardModule,
    ButtonModule,
  ]
})
export class MateriasModule { }
