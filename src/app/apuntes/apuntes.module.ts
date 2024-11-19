import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApuntesRoutingModule } from './apuntes-routing.module';
import { EditorPageComponent } from './pages/editor-page/editor-page.component';
import { EditorComponent } from "./components/editor/editor.component";

import { QuillEditorComponent } from 'ngx-quill';

import { MenubarModule } from 'primeng/menubar';

@NgModule({
  declarations: [
    EditorPageComponent,
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
