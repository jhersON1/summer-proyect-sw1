import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Materia } from '../../interfaces/materia.interface';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-card-materia',
  templateUrl: './card-materia.component.html',
  styleUrls: ['./card-materia.component.scss']
})
export class CardMateriaComponent implements OnInit {
  materiaOptions : MenuItem[] = [];

  @Input()
  materia! : Materia;

  @Output()
  materiaEliminada : EventEmitter<number> = new EventEmitter<number>();

  @Output()
  materiaSeleccionadaEditar: EventEmitter<Materia> = new EventEmitter<Materia>();

  constructor(
  ){}

  ngOnInit(): void {
    this.materiaOptions = [
      {
        label: 'Editar Materia',
        icon: 'pi pi-pencil',
        command: () =>{
          this.materiaSeleccionadaEditar.emit(this.materia);
        }
      },
      {
        label: 'Borrar Materia',
        icon: 'pi pi-trash',
        command: () => {
          this.materiaEliminada.emit(this.materia.id);
        }
      },
    ]
  }
}
