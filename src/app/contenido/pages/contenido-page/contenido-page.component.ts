import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Tema } from '../../interfaces/tema.interface';
import { TemaService } from '../../services/tema.service';
import { switchMap } from 'rxjs';
import { Table, TableRowSelectEvent, TableRowUnSelectEvent } from 'primeng/table';
import { ConfirmationService, MessageService, SortEvent } from 'primeng/api';

@Component({
  templateUrl: './contenido-page.component.html',
  styleUrl: './contenido-page.component.scss'
})
export class ContenidoPageComponent implements OnInit {

  private materiaId: string | null = null;
  public temaPadreId?: number;

  public temas: Tema[] = [];

  @ViewChild('dt')
  private dt!: Table;
  private isSorted?: boolean;
  private initialValue: Tema[] = [];

  private lastClickTime: number = 0;
  private readonly doubleClickThreshold: number = 500;  //500 milisegundos

  public tema: Tema = {
    id: 0,
    nombre: '',
  };

  // public tema!: Tema;

  public temaDialog: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private temaService: TemaService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {

    this.materiaId = this.activatedRoute.snapshot.paramMap.get('materiaId');
    // this.activatedRoute.paramMap.subscribe(params => {
    //   this.materiaId = params.get('materiaId');
    // });

    if (!this.router.url.includes('tema')) {
      this.temaService.getMateriaContentById(+this.materiaId!)
        .subscribe(temas => {
          this.temas = temas;
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
            return this.temaService.getTemaContentById(temaId);
          })
        ).subscribe(({ subTemas }) => {
          this.temas = subTemas;
          this.initialValue = [...subTemas];
          return;
        });
    }
  }

  editTema(tema: Tema) {
    this.tema = { ...tema };
    this.temaDialog = true;
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

  createApunte() {

  }

  // {
  //   "id": 123,
  //   "nombre": "gaaaa",
  //   "materiaId": 2,
  //   "temaPadreId": 9
  // }

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

  private updateTema(temaId: number) {
    this.temaService.updateTema(this.tema)
      .subscribe(tema => {
        this.temas[this.findIndexById(temaId)] = this.tema;
        this.initialValue = [...this.temas];
        this.temas = [...this.temas];
        this.messageService.add({ severity: 'success', summary: 'Actualización realizada', detail: 'Tema actualizado correctamente', life: 3000 });
      });
  }

  private storeTema() {
    this.temaService.addTema(this.tema)
      .subscribe(tema => {
        this.tema = { ...tema }
        this.temas.push(this.tema);
        this.messageService.add({ severity: 'success', summary: 'Nuevo tema', detail: 'Tema creado correctamente', life: 3000 });
      });
  }

  private findIndexById(id: number): number {
    let index = -1;
    for (let i = 0; i < this.temas.length; i++) {
      if (this.temas[i].id === id) {
        index = i;
        break;
      }
    }

    return index;
  }

  hideDialog() {
    this.temaDialog = false;
    // this.submitted = false;
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
              return this.messageService.add({ severity: 'error', summary: `Error: No  se pudo eliminar el tema ${tema.nombre}` , detail: 'Primero debe eliminar sus apuntes', life: 3000 });
            }
            this.temas = this.temas.filter((t) => t.id !== tema.id);
            this.initialValue = [...this.temas];
            this.messageService.add({ severity: 'success', summary: 'Eliminación realizada', detail: `El tema ${tema.nombre} fue eliminado`, life: 3000 });
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
      this.temas = [...this.initialValue];
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

    const temaId = event.data.id;
    this.router.navigateByUrl(`/app/materia/${this.materiaId}/tema/${temaId}`);
  }

  applyFilter(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.dt.filterGlobal(inputElement.value, 'contains');
  }
}
