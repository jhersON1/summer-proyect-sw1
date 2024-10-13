import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterBody } from '../../interfaces';
import { ValidationsService } from '../../services/validations.service';

@Component({
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss'
})
export class RegisterPageComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private validationsService = inject(ValidationsService);
  private router = inject(Router);

  public registerForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.pattern(this.validationsService.emailPattern)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    password_confirm: ['', [Validators.required]],
    telefono: ['', [Validators.required, Validators.pattern(this.validationsService.phonePattern)]],
  }, {
    validators: [
      this.validationsService.isFieldOneEqualFieldTwo('password', 'password_confirm'),
    ]
  });

  register() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { password_confirm, ...registerBody } = this.registerForm.value;
    console.log(registerBody);
    const { email, password } = registerBody;

    this.authService.register(registerBody)
      .subscribe(() => {

        this.authService.login(email, password)
          .subscribe(result => {
            if (result) this.router.navigateByUrl('/app');
          })
      });
  }

  fieldHasErrors(field: string): boolean {
    return this.validationsService.fieldHasErros(this.registerForm, field);
  }

  getFieldError(field: string): string {
    return this.validationsService.getFieldError(this.registerForm, field) ?? '';
  }
}
