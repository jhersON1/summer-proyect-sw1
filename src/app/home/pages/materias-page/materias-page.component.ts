import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Materia } from '../../interfaces/materia.interface';
import { MateriaService } from '../../services/materia.service';
import { CreateMateriaResponse } from '../../interfaces/create-materia-response.interface';

import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../../auth/interfaces';
import { ApuntesCompartidosService } from '../../../apuntes/services/apuntes-compartidos.service';

@Component({
  selector: 'app-materias-page',
  templateUrl: './materias-page.component.html',
  styleUrl: './materias-page.component.scss'
})
export class MateriasPageComponent implements OnInit{
  materias: Materia[] = [];

  showCreateMateria: boolean = false;
  showEditMateria: boolean = false;
  selectedMateriaEditar!: Materia | null; // Materia seleccionada para editar

  apuntesCompartidos: any[] = [];
  loadingApuntesCompartidos = false;

  constructor(
    private router: Router,
    private materiaService: MateriaService,
    private messageService: MessageService, // Esto es para las notificaciones de primeng
    private confirmationService: ConfirmationService, //servicio para el dialogo de confirmacion
    private authService: AuthService,
    private apuntesCompartidosService: ApuntesCompartidosService,
  ) {}

  ngOnInit() {
    this.loadMaterias();
    this.loadApuntesCompartidos();
  }

  loadMaterias(): void {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No user is currently logged in.',
      });
      return;

    }
    const currentUser = JSON.parse(storedUser) as User;

    console.log('el usuario actual es ', currentUser);
    const user_id = currentUser ? currentUser.id : null;



    this.materiaService.getMaterias().subscribe((materias: Materia[]) => {
      this.materias = materias.filter(materia => materia.usuario.id === user_id);
    });
  }

  onNuevaMateria(nuevaMateria: CreateMateriaResponse): void {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No user is currently logged in.',
      });
      return;

    }
    const currentUser = JSON.parse(storedUser) as User;

    if (!currentUser) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No user is currently logged in.',
      });
      return;
    }

    const newMateria: Materia = {
      id: nuevaMateria.id,
      nombre: nuevaMateria.nombre,
      descripcion: nuevaMateria.descripcion,
      usuario: nuevaMateria.usuario,
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

  loadApuntesCompartidos(): void {
    const currentUser = this.authService.currentUser();
    if (!currentUser?.email) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo obtener el usuario actual',
      });
      return;
    }

    this.loadingApuntesCompartidos = true;
    this.apuntesCompartidosService.getApuntesCompartidosByEmail(currentUser.email)
      .subscribe({
        next: (response: any) => {
          this.apuntesCompartidos = response.data;
          this.loadingApuntesCompartidos = false;
        },
        error: (error) => {
          console.error('Error loading shared notes:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los apuntes compartidos'
          });
          this.loadingApuntesCompartidos = false;
        }
      });
  }

  navigateToSharedNote(url: string): void {
    window.open(url, '_blank');
  }
}
