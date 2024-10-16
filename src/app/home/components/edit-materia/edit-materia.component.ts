import { Component, EventEmitter, Input, Output, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MateriaService } from '../../services/materia.service';
import { Materia } from '../../interfaces/materia.interface';
import { MessageService } from 'primeng/api';
import { UpdateMateria } from '../../interfaces/update-materia.interface';

@Component({
  selector: 'app-edit-materia',
  templateUrl: './edit-materia.component.html',
  styleUrl: './edit-materia.component.scss',
})
export class EditMateriaComponent implements OnChanges {
  @Input() showEditMateria!: boolean;
  @Input() materia!: Materia|null; // Recibe la materia seleccionada para editar

  @Output() showEditMateriaChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() materiaEditada: EventEmitter<Materia> = new EventEmitter<Materia>();

  public editMateriaForm: FormGroup = this.formBuilder.group({
    nombre: ['', [Validators.required]],
    descripcion: ['', [Validators.required]],
  });

  constructor(
    private formBuilder: FormBuilder,
    private materiaService: MateriaService,
    private messageService: MessageService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['materia'] && this.materia) {
      // Actualiza el formulario con los valores de la materia
      this.editMateriaForm.patchValue({
        nombre: this.materia.nombre,
        descripcion: this.materia.descripcion,
      });
    }
  }

  cerrarDialog(): void {
    this.showEditMateria = false;
    this.showEditMateriaChange.emit(this.showEditMateria);
  }

  actualizarMateria(): void {
    if (this.editMateriaForm.invalid) {
      this.editMateriaForm.markAllAsTouched();
      return;
    }

    if(!this.materia){
      console.log('materia no seleccionada');
      return
    }

    const { nombre, descripcion } = this.editMateriaForm.value;
    const updatedMateria: UpdateMateria = { nombre, descripcion };

    this.materiaService.updateMateria(this.materia.id, updatedMateria).subscribe({
      next: (editMateriaResponse: Materia) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Materia actualizada',
          detail: 'La materia fue actualizada correctamente',
        });
        this.materiaEditada.emit(editMateriaResponse);
        this.cerrarDialog();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error actualizando la materia',
        });
      },
    });
  }
}
