import { Component, inject, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { EditorService } from '../../services/editor.service';

@Component({
  selector: 'app-apunte-page',
  templateUrl: './apunte-page.component.html',
  styleUrl: './apunte-page.component.scss'
})
export class ApuntePageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private editorService = inject(EditorService);
  tamanoPapel: string = 'letter';

  items: MenuItem[] | undefined;

  cambiarTamanoPapel(tamano: string){
      this.tamanoPapel = tamano;
  }

  async ngOnInit() {
    console.log('[ApuntePageComponent] Initializing...');

    // Verificar sessionId en la URL
    this.route.queryParams.subscribe(async params => {
      const sessionId = params['sessionId'];
      if (sessionId) {
        console.log('[ApuntePageComponent] Session ID found:', sessionId);
        try {
          await this.editorService.joinSession(sessionId);
          console.log('[ApuntePageComponent] Joined collaborative session');
        } catch (error) {
          console.error('[ApuntePageComponent] Error joining session:', error);
        }
      } else {
        console.log('[ApuntePageComponent] No session ID in URL');
      }
    });

    // Inicializar menú (código existente)
    this.initializeMenu();
  }

  private initializeMenu() {
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
