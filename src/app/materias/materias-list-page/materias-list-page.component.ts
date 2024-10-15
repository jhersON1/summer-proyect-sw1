import { Component, Input, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { MateriaService } from '../services/materia.service';
import { Materia } from '../interfaces/materia.interface';

@Component({
  selector: 'app-materias-list-page',
  templateUrl: './materias-list-page.component.html',
  styleUrl: './materias-list-page.component.scss'
})
export class MateriasListPageComponent implements OnInit{
  tabItems: MenuItem[] = [];
  activeItem : MenuItem | undefined;

  materias : Materia[] = [];

  constructor(
    private router: Router,
    private materiaService :MateriaService,
  ) {}

  ngOnInit() {
    this.tabItems = [
        { label: 'Materias', icon: 'pi pi-home' },
        {
            label: 'Compartido',
            icon: 'pi pi-palette',
            command: () => {
                this.router.navigate(['/shared']);
            }
        },
    ];

    this.activeItem = this.tabItems[0];
    this.loadMaterias();
  }

  loadMaterias() : void{
    this.materiaService.getMaterias().subscribe((materias: Materia[]) => {
      this.materias = materias;
      console.log(this.materias);
    });
  }

  onMateriaEliminada(materiaId: number) {
    this.materiaService.deleteMateria(materiaId).subscribe( () => {
        console.log('materia eliminada con id ' + materiaId)
        this.materias = this.materias.filter(m => m.id !== materiaId);
      }
    )
  }
}
