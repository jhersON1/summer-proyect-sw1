import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-apunte-page',
  templateUrl: './apunte-page.component.html',
  styleUrl: './apunte-page.component.scss'
})
export class ApuntePageComponent implements OnInit {

  tamanoPapel: string = 'letter';

  items: MenuItem[] | undefined;

  cambiarTamanoPapel(tamano: string){
      this.tamanoPapel = tamano;
  }

  ngOnInit() {
      // los items del toolbar
      this.items = [
          {
              label: 'Archivo',
              icon: 'pi pi-folder'
          },
          {
              label: 'Editar',
              icon: 'pi pi-clipboard'
          },
          {
              label: 'Formato',
              icon: 'pi pi-file',
              items: [
                  {
                      label: 'Tamaño de hoja',
                      icon: 'pi pi-expand',
                      items: [
                          {
                              label: 'Carta',
                              command: () => this.cambiarTamanoPapel('letter')
                          },
                          {
                              label: 'Oficio',
                              command: () => this.cambiarTamanoPapel('oficio')
                          },
                          {
                              label: 'Tabloide',
                              command: () => this.cambiarTamanoPapel('tabloid')
                          },
                          {
                              label: 'A4',
                              command: () => this.cambiarTamanoPapel('a4')
                          },
                          {
                              label: 'A5',
                              command: () => this.cambiarTamanoPapel('a5')
                          },
                          {
                              label: 'Infinito',
                              command: () => this.cambiarTamanoPapel('infinito')
                          }
                      ]
                  },
              ]
          },
      ]
  }
}
