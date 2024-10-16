import { Component, Input, OnInit } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
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
  activeItem: MenuItem | undefined;

  materias: Materia[] = [];

  showCreateMateria: boolean = false;
  showEditMateria: boolean = false;
  selectedMateriaEditar!: Materia | null; // Materia seleccionada para editar

  constructor(
    private router: Router,
    private materiaService: MateriaService,
    private messageService: MessageService, // Esto es para las notificaciones de primeng
    private confirmationService: ConfirmationService //servicio para el dialogo de confirmacion
  ) {}

  ngOnInit() {
    this.tabItems = [
      { label: 'Materias', icon: 'pi pi-home' },
      {
        label: 'Compartido',
        icon: 'pi pi-palette',
        command: () => {
          this.router.navigate(['/shared']);
        },
      },
    ];

    this.activeItem = this.tabItems[0];
    this.loadMaterias();
  }

  loadMaterias(): void {
    this.materiaService.getMaterias().subscribe((materias: Materia[]) => {
      this.materias = materias;
    });
  }

  onNuevaMateria(nuevaMateria: CreateMateriaResponse): void {
    const newMateria: Materia = {
      id: nuevaMateria.id,
      nombre: nuevaMateria.nombre,
      descripcion: nuevaMateria.descripcion,
    };
    this.materias.push(newMateria);
    this.messageService.add({
      severity: 'info',
      summary: 'Éxito',
      detail: 'Materia Creada',
    });
  }

  toggleCreateMateria(): void {
    this.showCreateMateria = true;
  }

  // Abrir el diálogo de edición
  onMateriaSeleccionadaEditar(materia: Materia): void {
    this.selectedMateriaEditar = materia;
    this.showEditMateria = true;
  }

  // Manejar la materia editada
  onMateriaEditada(updatedMateria: Materia): void {
    const index = this.materias.findIndex((m) => m.id === updatedMateria.id);
    if (index !== -1) {
      this.materias[index] = updatedMateria; // Actualizar la materia en la lista
    }
  }

  onMateriaEliminada(materiaId: number): void {
    this.confirmarEliminarMateria(materiaId);
  }

  confirmarEliminarMateria(materiaId: number): void {
    this.confirmationService.confirm({
      header: 'Eliminar',
      message: '¿Eliminar Materia?',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      acceptIcon: 'none',
      rejectIcon: 'none',

      accept: () => {
        this.materiaService.deleteMateria(materiaId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'info',
              summary: 'Exito',
              detail: 'Materia Eliminada',
            });
            this.materias = this.materias.filter((m) => m.id !== materiaId);
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Materia no borrada por X motivo',
            });
          },
        });
      },
      reject: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Cancelado',
          detail: 'La materia no se eliminó',
        });
      },
    });
  }
}
