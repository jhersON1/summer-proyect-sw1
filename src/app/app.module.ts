import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { HomeModule } from './home/home.module';
import { LayoutModule } from './layout/layout.module';
// @ts-ignore
import { QuillModule } from 'ngx-quill';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    QuillModule.forRoot(),

    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    HomeModule,
    LayoutModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
