import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutPageComponent } from './layout-page/layout-page.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { FooterComponent } from './components/footer/footer.component';

import { RouterModule, RouterOutlet } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';

import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';

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
    MenuModule
  ],
  exports: [
    LayoutPageComponent
  ]
})
export class LayoutModule { }
