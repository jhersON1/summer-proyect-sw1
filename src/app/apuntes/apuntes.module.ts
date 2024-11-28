import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApuntesRoutingModule } from './apuntes-routing.module';

import { ApuntePageComponent } from './pages/apunte-page/apunte-page.component';
import { EditorComponent } from './components/editor/editor.component';

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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileUploadModule } from 'primeng/fileupload';

import { QuillModule } from 'ngx-quill';
import { UsersPanelComponent } from './components/users-panel/users-panel.component';
import { MenuModule } from 'primeng/menu';
import { SidebarModule } from 'primeng/sidebar';
import { MessageService } from 'primeng/api';
import { MindMapComponent } from './components/mind-map/mind-map.component';
import { AttachImagesComponent } from './components/attach-images/attach-images.component';
import { VideoModalComponent } from './components/video-modal/video-modal.component';

@NgModule({
  declarations: [
    ApuntePageComponent,
    EditorComponent,
    InviteDialogComponent,
    UsersPanelComponent,
    MindMapComponent,
    AttachImagesComponent,
    VideoModalComponent,
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
    MenuModule,
    SidebarModule,
    FileUploadModule, // Importa el módulo de PrimeNG
    ButtonModule, // Para el botón
    QuillModule,

    QuillEditorComponent,
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: [MessageService],
})
export class ApuntesModule {}
