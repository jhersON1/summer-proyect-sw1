import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContenidoRoutingModule } from './contenido-routing.module';
import { ContenidoPageComponent } from './pages/contenido-page/contenido-page.component';

import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmationService, MessageService } from 'primeng/api';

@NgModule({
  declarations: [
    ContenidoPageComponent
  ],
  imports: [
    CommonModule,
    ContenidoRoutingModule,
    FormsModule,

    BreadcrumbModule,
    TableModule,
    ButtonModule,
    DialogModule,
    ConfirmDialogModule,
    InputTextModule,
    ToastModule,
    IconFieldModule,
    InputIconModule,
  ],
  providers: [
    MessageService,
    ConfirmationService
  ]
})
export class ContenidoModule { }
