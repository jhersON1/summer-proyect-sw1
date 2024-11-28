import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MateriaService } from '../../services/materia.service';
import { CreateMateria } from '../../interfaces/create-materia.interface';
import { CreateMateriaResponse } from '../../interfaces/create-materia-response.interface';
import { User } from '../../../auth/interfaces';

@Component({
  selector: 'app-new-materia',
  templateUrl: './new-materia.component.html',
  styleUrl: './new-materia.component.scss'
})
export class NewMateriaComponent {
  @Input()
  showCreateMateria! : boolean

  @Output()
  showCreateMateriaChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  nuevaMateriaEvent: EventEmitter<CreateMateriaResponse> = new EventEmitter<CreateMateriaResponse>();

  constructor(
    private formBuilder: FormBuilder,
    private materiaService: MateriaService
  ){}

  public createMateriaForm : FormGroup = this.formBuilder.group({
    nombre: ['', [Validators.required]],
    descripcion: ['',[Validators.required]],
  });

  cerrarDialog() : void{
    this.showCreateMateria = false;
    this.showCreateMateriaChange.emit(this.showCreateMateria);
  }

  crearMateria() : void{
    console.log('gola');

    const storedUser = localStorage.getItem('user');
    if (!storedUser) return;

    const currentUser = JSON.parse(storedUser) as User;

    if(this.createMateriaForm.invalid){
      this.createMateriaForm.markAllAsTouched();
      console.log('que esto');
      return;
    }

    const {nombre, descripcion} = this.createMateriaForm.value;
    const usuarioId = currentUser.id; //obtener de local storage

    const nuevaMateria: CreateMateria =
    {
      nombre : nombre,
      descripcion : descripcion,
      codigo_usuario : usuarioId
    }

    this.materiaService.addMateria(nuevaMateria).subscribe({
      next: (nuevaMateria: CreateMateriaResponse) => {
        console.log('Materia created successfully', nuevaMateria);
        this.nuevaMateriaEvent.emit(nuevaMateria);
      },
      error: (error) => {
        console.error('Error creating materia', error);
      }
    });

    this.cerrarDialog()
  }
}
