import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TabMenuModule } from 'primeng/tabmenu';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MateriasPageComponent } from './pages/materias-page/materias-page.component';
import { CardMateriaComponent } from './components/card-materia/card-materia.component';
import { NewMateriaComponent } from './components/new-materia/new-materia.component';
import { CompartidosPageComponent } from './pages/compartidos-page/compartidos-page.component';

@NgModule({
  declarations: [
    MateriasPageComponent,
    CardMateriaComponent,
    NewMateriaComponent,
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
    InputTextareaModule
  ],
  providers:[
    MessageService
  ]
})
export class HomeModule { }
