import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApuntesRoutingModule } from './apuntes-routing.module';

import { ApuntePageComponent } from './pages/apunte-page/apunte-page.component';
import { EditorComponent } from "./components/editor/editor.component";

import { MenubarModule } from 'primeng/menubar';

// @ts-ignore
import { QuillEditorComponent } from 'ngx-quill';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ChipModule } from 'primeng/chip';
import { CheckboxModule } from 'primeng/checkbox';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';
import { MessagesModule } from 'primeng/messages';
import { InviteDialogComponent } from './components/invite-dialog/invite-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';

import { QuillModule } from 'ngx-quill';

@NgModule({
  declarations: [
    ApuntePageComponent,
    EditorComponent,
    InviteDialogComponent
  ],
  imports: [
    CommonModule,
    ApuntesRoutingModule,
    MenubarModule,

    // PrimeNG
    MenubarModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ChipModule,
    CheckboxModule,
    DynamicDialogModule,
    ToastModule,
    MessagesModule,

    QuillModule,

    QuillEditorComponent,
    ReactiveFormsModule,
  ]
})
export class ApuntesModule { }
