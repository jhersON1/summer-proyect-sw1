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

  constructor(
  ){}

  ngOnInit(): void {
    this.materiaOptions = [
      {
        label: 'Borrar Materia',
        icon: 'pi pi-trash',
        command: () => {
          console.log('materia eliminada con id: ' + this.materia.id)
          this.materiaEliminada.emit(this.materia.id);
        },
      }
    ]
  }
}
