import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MateriasRoutingModule } from './materias-routing.module';
import { MateriasListPageComponent } from './materias-list-page/materias-list-page.component';
import { NewMateriaComponent } from './components/new-materia/new-materia.component';
import { CardMateriaComponent } from './components/card-materia/card-materia.component';

import { TabMenuModule } from 'primeng/tabmenu';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { EditMateriaComponent } from './components/edit-materia/edit-materia.component';


@NgModule({
  declarations: [
    CardMateriaComponent,
    MateriasListPageComponent,
    NewMateriaComponent,
    EditMateriaComponent
  ],
  imports: [
    CommonModule,
    MateriasRoutingModule,
    ReactiveFormsModule,
    FormsModule,

    TabMenuModule,
    CardModule,
    ButtonModule,
    MenuModule,
    ToastModule,
    DialogModule,
    AvatarModule,
    AvatarGroupModule,
    InputTextModule,
    InputTextareaModule,
    ConfirmDialogModule
  ],
  providers:[
    MessageService,
    ConfirmationService,
  ]
})
export class MateriasModule { }
