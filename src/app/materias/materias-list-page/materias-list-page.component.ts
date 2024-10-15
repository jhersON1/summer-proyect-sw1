import { Component, Input, OnInit } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { MateriaService } from '../services/materia.service';
import { Materia } from '../interfaces/materia.interface';
import { CreateMateria } from '../interfaces/create-materia.interface';

@Component({
  selector: 'app-materias-list-page',
  templateUrl: './materias-list-page.component.html',
  styleUrl: './materias-list-page.component.scss'
})
export class MateriasListPageComponent implements OnInit{
  tabItems: MenuItem[] = [];
  activeItem : MenuItem | undefined;

  materias : Materia[] = [];

  showCreateMateria: boolean = false;

  constructor(
    private router: Router,
    private materiaService :MateriaService,
    private messageService: MessageService,  // Esto es para las notificaciones de primeng
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
    });
  }

  onMateriaEliminada(materiaId: number): void {
    this.materiaService.deleteMateria(materiaId).subscribe({
      next: () => {
        this.materias = this.materias.filter(m => m.id !== materiaId);
      },
      error: (error) => {
        this.showError()
      }
    });
  }

  onNuevaMateria(nuevaMateria: CreateMateria) :void {
    console.log('añadir materia a la lista')
  }

  toggleCreateMateria():void{
    this.showCreateMateria = true;
  }

  showError():void {
    this.messageService.add(
      {
        severity: 'error',
        summary: 'Error',
        detail: 'Materia no borrada por X motivo'
      }
    );
  }



}
