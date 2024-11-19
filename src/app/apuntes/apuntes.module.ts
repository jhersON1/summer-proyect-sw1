import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApuntesRoutingModule } from './apuntes-routing.module';

import { ApuntePageComponent } from './pages/apunte-page/apunte-page.component';
import { EditorComponent } from "./components/editor/editor.component";

import { MenubarModule } from 'primeng/menubar';

import { QuillEditorComponent } from 'ngx-quill';


@NgModule({
  declarations: [
    ApuntePageComponent,
    EditorComponent
  ],
  imports: [
    CommonModule,
    ApuntesRoutingModule,
    MenubarModule,

    QuillEditorComponent,
]
})
export class ApuntesModule { }
