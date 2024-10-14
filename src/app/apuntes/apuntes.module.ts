import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApuntesRoutingModule } from './apuntes-routing.module';
import { ApuntesPageComponent } from './pages/apuntes-page/apuntes-page.component';
import { PrimengModule } from '../shared/primeng.module';
import { DataViewModule } from 'primeng/dataview';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';

@NgModule({
  declarations: [
    ApuntesPageComponent
  ],
  imports: [
    CommonModule,
    ApuntesRoutingModule,

    PrimengModule,
    DataViewModule,
    TagModule,
    RatingModule,
  ]
})
export class ApuntesModule { }
