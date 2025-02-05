import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MateriasPageComponent } from './pages/materias-page/materias-page.component';
import { NewMateriaComponent } from './components/new-materia/new-materia.component';
import { CardMateriaComponent } from './components/card-materia/card-materia.component';
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
import { HomeLayoutComponent } from './layout/home-layout/home-layout.component';
import { HomeRoutingModule } from './home-routing.module';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@NgModule({
  declarations: [
    MateriasPageComponent,
    CardMateriaComponent,
    NewMateriaComponent,
    EditMateriaComponent,
    HomeLayoutComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
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
    ProgressSpinnerModule
  ],
  providers:[
    MessageService,
    ConfirmationService,
  ]
})
export class HomeModule { }
