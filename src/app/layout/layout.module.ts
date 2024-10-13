import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutPageComponent } from './layout-page/layout-page.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { ButtonModule } from 'primeng/button';

import { RouterModule, RouterOutlet } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';



@NgModule({
  declarations: [
    LayoutPageComponent,
    TopbarComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule,

    ButtonModule,
  ],
  exports: [
    LayoutPageComponent
  ]
})
export class LayoutModule { }
