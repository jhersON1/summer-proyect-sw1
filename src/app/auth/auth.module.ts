import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AuthRoutingModule } from './auth-routing.module';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { LoginPageComponent } from './login-page/login-page.component';

import { MessagesModule } from 'primeng/messages';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { StepsModule } from 'primeng/steps';

@NgModule({
  declarations: [
    AuthLayoutComponent,
    LoginPageComponent,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    RouterOutlet,
    ReactiveFormsModule,
    FormsModule,

    ButtonModule,
    InputTextModule,
    InputNumberModule,
    StepsModule,
    CheckboxModule,
    PasswordModule,
    MessagesModule,
  ]
})
export class AuthModule { }
