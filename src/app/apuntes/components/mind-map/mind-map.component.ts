import { Component, OnInit, inject, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import mermaid from 'mermaid';
import { MessageService } from 'primeng/api';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-mind-map',
  template: `
    <div class="flex flex-column gap-3 w-full">
      <div class="flex justify-content-between align-items-center">
        <h3>Mapa Mental Generado</h3>

        <p-button
          icon="pi pi-save"
          label="Guardar"
          (onClick)="saveMindMap()"
          class="p-button-primary"
          [loading]="isSaving">
        </p-button>

        <p-button
          icon="pi pi-download"
          label="Exportar PNG"
          (onClick)="exportAsPNG()"
          class="p-button-secondary"
          [loading]="isExporting">
        </p-button>

        <p-button
          icon="pi pi-external-link"
          label="Abrir en nueva pestaña"
          (onClick)="openInNewTab()"
          class="p-button-text">
        </p-button>
      </div>

      <div #diagramContainer class="mermaid-container">
        <pre class="mermaid">
          {{mermaidCode}}
        </pre>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    .mermaid-container {
      width: 100%;
      min-height: 400px;
      overflow: auto;
    }
    pre.mermaid {
      margin: 0;
      padding: 16px;
    }
  `]
})
export class MindMapComponent implements OnInit, AfterViewInit {
  @ViewChild('diagramContainer') diagramContainer!: ElementRef;

  private dialogRef = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);
  private messageService = inject(MessageService);

  mermaidCode: string = '';
  isExporting: boolean = false;
  isSaving: boolean = false;

  constructor() {
    console.log('[MindmapDiagramComponent] Initializing');
    // Configurar Mermaid con opciones más específicas
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      logLevel: 'error',
      fontFamily: 'arial',
      mindmap: {
        padding: 16
      }
    });
  }

  ngOnInit() {
    console.log('[MindmapDiagramComponent] OnInit');
    this.mermaidCode = this.config.data?.mermaidCode || '';
    console.log('[MindmapDiagramComponent] Mermaid code:', this.mermaidCode);
  }

  async ngAfterViewInit() {
    console.log('[MindmapDiagramComponent] AfterViewInit - Starting render process');
    try {
      // Dar tiempo al DOM para estar completamente listo
      setTimeout(async () => {
        await this.renderDiagram();
      }, 100);
    } catch (error) {
      console.error('[MindmapDiagramComponent] Error in AfterViewInit:', error);
    }
  }

  private async renderDiagram() {
    try {
      console.log('[MindmapDiagramComponent] Rendering diagram');
      await mermaid.run({
        nodes: [this.diagramContainer.nativeElement.querySelector('.mermaid')]
      });
      console.log('[MindmapDiagramComponent] Diagram rendered successfully');
    } catch (error) {
      console.error('[MindmapDiagramComponent] Error rendering diagram:', error);
    }
  }

  openInNewTab() {
    console.log('[MindmapDiagramComponent] Opening diagram in new tab');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Mapa Mental</title>
          <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
          <script>
            mermaid.initialize({
              startOnLoad: true,
              theme: 'default',
              mindmap: {
                padding: 16
              }
            });
          </script>
          <style>
            body {
              margin: 20px;
              font-family: Arial, sans-serif;
            }
            .mermaid {
              display: flex;
              justify-content: center;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="mermaid">
            ${this.mermaidCode}
          </div>
        </body>
      </html>
    `;

    const newWindow = window.open('');
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.close();
    } else {
      console.error('[MindmapDiagramComponent] Could not open new window');
    }
  }

  async exportAsPNG() {
    console.log('[MindmapDiagramComponent] Starting PNG export');
    this.isExporting = true;

    try {
      const container = this.diagramContainer.nativeElement;
      const canvas = await html2canvas(container, {
        backgroundColor: 'white',
        scale: 2, // Mayor calidad
        logging: false,
        allowTaint: true,
        useCORS: true
      });

      // Crear y descargar el archivo PNG
      const link = document.createElement('a');
      link.download = 'mind-map.png';
      link.href = canvas.toDataURL('image/png');
      link.click();

      console.log('[MindmapDiagramComponent] PNG exported successfully');
      this.messageService.add({
        severity: 'success',
        detail: 'Mapa mental exportado correctamente'
      });
    } catch (error) {
      console.error('[MindmapDiagramComponent] Error exporting PNG:', error);
      this.messageService.add({
        severity: 'error',
        detail: 'Error al exportar el mapa mental'
      });
    } finally {
      this.isExporting = false;
    }
  }

  async saveMindMap() {
    console.log('[MindmapDiagramComponent] Saving mind map');
    this.isSaving = true;

    try {
      // Aquí iría la lógica real de guardado
      // TODO: Implementar lógica de guardado
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación de guardado
      console.log('Guardado exitoso');

      this.messageService.add({
        severity: 'success',
        detail: 'Mapa mental guardado correctamente'
      });
    } catch (error) {
      console.error('[MindmapDiagramComponent] Error saving mind map:', error);
      this.messageService.add({
        severity: 'error',
        detail: 'Error al guardar el mapa mental'
      });
    } finally {
      this.isSaving = false;
    }
  }
}
