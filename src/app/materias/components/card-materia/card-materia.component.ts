import { Component, Input, OnInit } from '@angular/core';
import { Materia } from '../../interfaces/materia.interface';
import { MenuItem } from 'primeng/api';
import { MateriaService } from '../../services/materia.service';

@Component({
  selector: 'app-card-materia',
  templateUrl: './card-materia.component.html',
  styleUrls: ['./card-materia.component.scss']
})
export class CardMateriaComponent implements OnInit {
  materiaOptions : MenuItem[] = [];

  @Input()
  materia! : Materia;

  constructor(
    private materiaService: MateriaService
  ){}

  ngOnInit(): void {
    this.materiaOptions = [
      {
        label: 'Borrar Materia',
        icon: 'pi pi-trash',
        command: () => {
          this.materiaService.deleteMateria(this.materia.id).subscribe(() => {
            console.log('materia borrada con id ' + this.materia.id);
          });
        },
      }
    ]
  }
}
