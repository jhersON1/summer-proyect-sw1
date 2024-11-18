import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Tema } from '../../interfaces/tema.interface';
import { TemaService } from '../../services/tema.service';
import { forkJoin, switchMap } from 'rxjs';
import { Table, TableRowSelectEvent, TableRowUnSelectEvent } from 'primeng/table';
import { ConfirmationService, MessageService, SortEvent } from 'primeng/api';
import { Apunte } from '../../interfaces/apunte.interface';
import { ApunteService } from '../../services/apunte.service';
import { MateriaService } from '../../../home/services/materia.service';

@Component({
  templateUrl: './contenido-page.component.html',
  styleUrl: './contenido-page.component.scss'
})
export class ContenidoPageComponent implements OnInit {

  private materiaId: string | null = null;
  public temaPadreId?: number;

  public elements: (Tema | Apunte) [] = [];

  @ViewChild('dt')
  private dt!: Table;
  private isSorted?: boolean;
  private initialValue: (Tema | Apunte) [] = [];

  private lastClickTime: number = 0;
  private readonly doubleClickThreshold: number = 500;  //500 milisegundos

  public tema: Tema = {
    id: 0,
    nombre: '',
  };

  public apunte: Apunte = {
    titulo: '',
  }

  public temaDialog: boolean = false;
  public apunteDialog: boolean = false;
  public invitationDialog: boolean = false;

  public title: string = '';
  public guestEmail: string = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private temaService: TemaService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private apunteService: ApunteService,
    private materiaService: MateriaService
  ) { }

  ngOnInit(): void {

    this.materiaId = this.activatedRoute.snapshot.paramMap.get('materiaId');

    this.apunte.materiaId = +this.materiaId!;

    if (!this.router.url.includes('tema')) {
      this.materiaService.getMateriaById(+this.materiaId!)
        .subscribe(materia => {
        this.title = materia.nombre
        });

      this.temaService.getMateriaContentById(+this.materiaId!)
        .subscribe(temas => {
          this.elements = temas;
          this.initialValue = [...temas];
          return;
        });
    } else {
      //No funciona con snapshot porque el valor de temaId en la ruta es cambiado por este componente
      //al hacer doble click en un tema
      this.activatedRoute.params
        .pipe(
          switchMap(({ temaId }) => {
            this.temaPadreId = +temaId;

            return forkJoin({
              subtemasResponse: this.temaService.getTemaContentById(temaId), // Obtener subtemas
              apuntes: this.temaService.getApuntesById(temaId),  // Obtener apuntes
            });
          })
        ).subscribe(({ subtemasResponse, apuntes }) => {
          this.title = subtemasResponse.nombre;
          const temas = subtemasResponse.subTemas;
          this.elements = [...temas, ...apuntes];
          this.initialValue = [...this.elements];
          return;
        });
    }
  }

  editElement(element: Tema | Apunte) {
    if (this.isTema(element)) {
      this.tema = { ...element };
      this.temaDialog = true
    }

    if (this.isApunte(element)) {
      this.apunte = { ...element };
      this.apunteDialog = true
    }
  }

  createTema() {
    this.tema = {
      id: -1,
      nombre: '',
      materiaId: +this.materiaId!,
      temaPadreId: this.temaPadreId
    };
    // this.submitted = false;
    this.temaDialog = true;
  }


  //TODO: Agregar endpoint GET /tema/idTema/apuntes, para obtener los apuntes de un tema

  createApunte() {
    this.apunte = {
      id: -1,
      titulo: '',
      materiaId: +this.materiaId!,
      temaId: this.temaPadreId
    };
    // this.submitted = false;
    this.apunteDialog = true;
  }

  saveTema() {
    //TODO: Validacion de nombre de Tema no duplicado la base tiene a nombre de tema unico
    if (!this.tema.nombre.trim()) return;

    const temaId = this.tema.id;
    if (temaId && temaId !== -1) {
      this.updateTema(temaId);
    } else {
      this.storeTema();
    }
    this.temaDialog = false;
  }

  saveApunte() {
    //TODO: Validacion de nombre de Tema no duplicado la base tiene a nombre de tema unico
    if (!this.apunte.titulo.trim()) return;

    const apunteId = this.apunte.id;
    if (apunteId && apunteId !== -1) {
      this.updateApunte(apunteId);
    } else {
      this.storeApunte();
    }
    this.apunteDialog = false;
  }

  sendInvitation() {
    if (!this.guestEmail.trim()) return;
    console.log(`ENVIAR INVITACION AL APUNTE ${this.apunte.titulo} al usuario ${this.guestEmail}`);
    this.messageService.add({ severity: 'success', summary: 'Invitación enviada', detail: `Se invito a ${this.guestEmail} al apunte ${this.apunte.titulo}`, life: 3000 });
    this.invitationDialog = false;
  }

  private updateTema(temaId: number) {
    this.temaService.updateTema(this.tema)
      .subscribe(tema => {
        this.elements[this.findElementIndexById(temaId, this.isTema)] = this.tema;
        this.initialValue = [...this.elements];
        this.elements = [...this.elements];
        this.messageService.add({ severity: 'success', summary: 'Actualización realizada', detail: 'Tema actualizado correctamente', life: 3000 });
      });
  }

  private updateApunte(apunteId: number) {
    this.apunteService.updateApunte(this.apunte)
      .subscribe(tema => {
        this.elements[this.findElementIndexById(apunteId, this.isApunte)] = this.apunte;
        this.initialValue = [...this.elements];
        this.elements = [...this.elements];
        this.messageService.add({ severity: 'success', summary: 'Actualización realizada', detail: 'Apunte actualizado correctamente', life: 3000 });
      });
  }

  private storeTema() {
    this.temaService.addTema(this.tema)
      .subscribe(tema => {
        this.tema = { ...tema }
        this.elements.push(this.tema);
        this.initialValue = [...this.elements];
        this.messageService.add({ severity: 'success', summary: 'Nuevo tema', detail: 'Tema creado correctamente', life: 3000 });
      });
  }

  private storeApunte() {
    this.apunteService.addApunte(this.apunte)
      .subscribe(apunte => {
        this.apunte = { ...apunte }
        this.elements.push(this.apunte);
        this.initialValue = [...this.elements];
        this.messageService.add({ severity: 'success', summary: 'Nuevo apunte', detail: 'Apunte creado correctamente', life: 3000 });
      });
  }

  private findElementIndexById(id: number, typeFilter: (element: Tema | Apunte) => boolean ): number {
    let index = -1;
    for (let i = 0; i < this.elements.length; i++) {
      const element = this.elements[i];
      if (typeFilter(element) && element.id === id) {
        index = i;
        break;
      }
    }

    return index;
  }

  hideTemaDialog() {
    this.temaDialog = false;
    // this.submitted = false;
  }

  hideApunteDialog() {
    this.apunteDialog = false;
  }

  hideInvitationDialog() {
    this.invitationDialog = false;
  }

  deleteElement(element: Tema | Apunte) {
    if (this.isTema(element))
      this.deleteTema(element);

    if (this.isApunte(element))
      this.deleteApunte(element);
  }

  deleteTema(tema: Tema) {
    this.confirmationService.confirm({
      message: `¿Esta seguro de eliminar el tema ${tema.nombre} y todo su contenido ?`,
      header: 'Eliminar tema',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.temaService.deleteTemaById(tema.id)
          .subscribe( temaDeleted => {
            if  (!temaDeleted) {
              return this.messageService.add({ severity: 'error', summary: `Error: No  se pudo eliminar el tema ${tema.nombre}` , detail: 'Primero debe eliminar sus apuntes manualmente', life: 3000 });
            }
            this.elements = this.elements.filter((element) => !(element.id === tema.id && this.isTema(element)));
            this.initialValue = [...this.elements];
            this.messageService.add({ severity: 'success', summary: 'Eliminación realizada', detail: `El tema ${tema.nombre} fue eliminado`, life: 3000 });
          });
      }
    });
  }

  deleteApunte(apunte: Apunte) {
    this.confirmationService.confirm({
      message: `¿Esta seguro de eliminar el apunte ${apunte.titulo} ?`,
      header: 'Eliminar apunte',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.apunteService.deleteApunteById(+apunte.id!)
          .subscribe( apunteDeleted => {
            if  (!apunteDeleted) {
              return this.messageService.add({ severity: 'error', summary: `Error: No  se pudo eliminar el apunte ${apunte.titulo}` , detail: 'Error al eliminar', life: 3000 });
            }
            this.elements = this.elements.filter((element) => !(element.id === apunte.id && this.isApunte(element)));
            this.initialValue = [...this.elements];
            this.messageService.add({ severity: 'success', summary: 'Eliminación realizada', detail: `El apunte ${apunte.titulo} fue eliminado`, life: 3000 });
          });
      }
    });
  }

  customSort(event: SortEvent) {
    if (this.isSorted == null || this.isSorted === undefined) {
      this.isSorted = true;
      this.sortTableData(event);
    } else if (this.isSorted == true) {
      this.isSorted = false;
      this.sortTableData(event);
    } else if (this.isSorted == false) {
      this.isSorted = undefined;  //null
      this.elements = [...this.initialValue];
      this.dt.reset();
    }
  }

  private sortTableData(event: SortEvent) {
    const field = event.field!;
    event.data!.sort((data1, data2) => {
      let value1 = data1[field];
      let value2 = data2[field];
      let result = null;
      if (value1 == null && value2 != null) result = -1;
      else if (value1 != null && value2 == null) result = 1;
      else if (value1 == null && value2 == null) result = 0;
      else if (typeof value1 === 'string' && typeof value2 === 'string') result = value1.localeCompare(value2);
      else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

      return event.order! * result;
    });
  }

  onRowSelect(event: TableRowSelectEvent) {
    this.lastClickTime = new Date().getTime();
    // const clickedRowData = event.data;
  }

  onRowUnselect(event: TableRowUnSelectEvent) {
    const currentTime = new Date().getTime();
    if ((currentTime - this.lastClickTime) > this.doubleClickThreshold) return;

    //const temaId = event.data.id;
    const element = event.data;
    if (this.isTema(element))
      this.router.navigateByUrl(`/app/materia/${this.materiaId}/tema/${element.id}`);

    if (this.isApunte(element))
      console.log(`REDIRIGIR AL EDITOR DEL APUNTE ${element.titulo}`);
  }

  applyFilter(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.dt.filterGlobal(inputElement.value, 'contains');
  }

  isTema(element: Tema | Apunte): element is Tema {
    return (element as Tema).nombre !== undefined;
  }

  isApunte(element: Tema | Apunte): element is Apunte {
    return (element as Apunte).titulo !== undefined;
  }

  invitePeople(apunte: Apunte) {
    this.apunte = { ...apunte };
    this.guestEmail = '';
    this.invitationDialog = true;
  }
}
