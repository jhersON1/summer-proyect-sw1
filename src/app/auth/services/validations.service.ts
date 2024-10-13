import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class ValidationsService {

  constructor() { }

  public firstNameAndLastnamePattern: string = '([a-zA-Z]+) ([a-zA-Z]+)';
  public emailPattern: string = "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$";
  public phonePattern: string = '[0-9]+';

  public fieldHasErros(form: FormGroup, field: string): boolean {
    const hasError = form.controls[field].errors && form.controls[field].touched;
    if (hasError) { return hasError }
    else { return false }
  }

  getFieldError(form: FormGroup, field: string): string | null {
    if (!form.controls[field]) return null;

    const errors = form.controls[field].errors || {};
    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
          return `Este campo es requerido`;
        case 'minlength':
          return `Minimo ${errors['minlength'].requiredLength} caracteres`;
        case 'pattern':
          const requiredPattern = errors['pattern'].requiredPattern;
          if (requiredPattern === this.emailPattern) {
            return 'El correo electronico no es valido';
          }
          if (requiredPattern === this.phonePattern) {
            return 'El telefono no es valido';
          }
          return 'El campo no es valido';
        case 'notEqual':
          return 'Los campos no coinciden';
      }
    }
    return null;
  }

  public isFieldOneEqualFieldTwo(field1: string, field2: string) {
    return (formGroup: AbstractControl): ValidationErrors | null => {

      const fieldValue1 = formGroup.get(field1)?.value;
      const fieldValue2 = formGroup.get(field2)?.value;

      if (fieldValue1 !== fieldValue2) {
        formGroup.get(field2)?.setErrors({ notEqual: true });
        return { notEqual: true }
      }

      formGroup.get(field2)?.setErrors(null);
      return null;
    }
  }
}
