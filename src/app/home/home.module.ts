import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MateriasPageComponent } from './pages/materias-page/materias-page.component';
import { NewMateriaComponent } from './components/new-materia/new-materia.component';
import { CardMateriaComponent } from './components/card-materia/card-materia.component';
import { CompartidosPageComponent } from './pages/compartidos-page/compartidos-page.component';
import { EditMateriaComponent } from './components/edit-materia/edit-materia.component';

import { ConfirmationService, MessageService } from 'primeng/api';
import { TabMenuModule } from 'primeng/tabmenu';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MenuModule } from 'primeng/menu';

import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@NgModule({
  declarations: [
    MateriasPageComponent,
    CardMateriaComponent,
    NewMateriaComponent,
    EditMateriaComponent,
    CompartidosPageComponent
  ],
  imports: [
    CommonModule,
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
    ConfirmDialogModule,
  ],
  providers:[
    MessageService,
    ConfirmationService,
  ]
})
export class HomeModule { }
