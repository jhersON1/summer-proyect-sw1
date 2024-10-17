import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Tema } from '../../interfaces/tema.interface';
import { TemaService } from '../../services/tema.service';
import { switchMap } from 'rxjs';
import { Table, TableRowSelectEvent, TableRowUnSelectEvent } from 'primeng/table';
import { MessageService, SortEvent } from 'primeng/api';

@Component({
  templateUrl: './contenido-page.component.html',
  styleUrl: './contenido-page.component.scss'
})
export class ContenidoPageComponent implements OnInit {

  private materiaId: string | null = null;

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
  public temaDialog: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private temaService: TemaService,
    private messageService: MessageService
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

  saveTema() {
    //TODO: Validacion de nombre de Tema no duplicado la base tiene a nombre de tema unico
    if (!this.tema.nombre.trim()) return;

    const temaId =  this.tema.id;
    if (temaId) {
      this.temaService.updateTema(this.tema)
        .subscribe( tema => {
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Tema Actualizado', life: 3000 });
          this.temas[this.findIndexById(temaId)] = this.tema;
        });
    } else {
      // this.product.image = 'product-placeholder.svg';
      // this.products.push(this.product);
      // this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Created', life: 3000 });
    }

    this.temas = [...this.temas];

    this.temaDialog = false;
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
}
