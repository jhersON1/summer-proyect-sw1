import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Message } from 'primeng/api';
import { AuthService } from '../services/auth.service';
import { ValidationsService } from '../services/validations.service';

@Component({
    templateUrl: './login-page.component.html',
    styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {

    private fb = inject( FormBuilder );
    private authService = inject( AuthService );
    private validationsService = inject( ValidationsService );
    private router = inject( Router );

    public loginForm: FormGroup = this.fb.group({
        email: ['', [ Validators.required, Validators.pattern(this.validationsService.emailPattern) ]],
        password: ['', [ Validators.required ]]
    });

    public messages: Message[] = [];

    login() {
        if ( this.loginForm.invalid ) {
            this.loginForm.markAllAsTouched();
            return;
        }

        const { email, password } = this.loginForm.value;

        this.authService.login(email, password)
        .subscribe({
         next: () => this.router.navigateByUrl('/app'),
            error: (message) => {
                //Swal.fire('Error', message, 'error');
                console.error(message);
                this.messages = [{ severity: 'error', detail: 'El correo o la contraseña son incorrectos' }];
            }
        });
    }

    fieldHasErrors(field: string): boolean {
        return this.validationsService.fieldHasErros(this.loginForm, field);
    }

    getFieldError(field: string): string {
      const fieldError = this.validationsService.getFieldError(this.loginForm, field);
      if(fieldError){
        return fieldError
      }else{
        return ''
      }
    }
}
