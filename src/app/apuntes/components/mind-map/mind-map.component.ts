import { Component, inject, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import mermaid from 'mermaid';

@Component({
  selector: 'app-mind-map',
  template: `
    <div class="flex flex-column gap-3 w-full">
      <div class="flex justify-content-between align-items-center">
        <h3>Mapa Mental Generado</h3>
        <p-button
          icon="pi pi-external-link"
          label="Abrir en nueva pestaña"
          (onClick)="openInNewTab()"
          class="p-button-text">
        </p-button>
      </div>

      <div #mermaidDiv class="mermaid-container">
        {{ mermaidCode }}
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
  `]
})
export class MindMapComponent implements OnInit {
  private dialogRef = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);

  mermaidCode: string = '';

  constructor() {
    console.log('[MindmapDiagramComponent] Initializing');
    // Configurar Mermaid
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose'
    });
  }

  ngOnInit() {
    console.log('[MindmapDiagramComponent] Initializing component');
    this.mermaidCode = this.config.data?.mermaidCode || '';
    console.log('[MindmapDiagramComponent] Mermaid code:', this.mermaidCode);

    // Renderizar el diagrama después de que el componente se inicialice
    setTimeout(() => {
      this.renderDiagram();
    }, 0);
  }

  private async renderDiagram() {
    try {
      console.log('[MindmapDiagramComponent] Rendering diagram');
      await mermaid.run();
      console.log('[MindmapDiagramComponent] Diagram rendered successfully');
    } catch (error) {
      console.error('[MindmapDiagramComponent] Error rendering diagram:', error);
    }
  }

  openInNewTab() {
    console.log('[MindmapDiagramComponent] Opening diagram in new tab');

    // Crear una página HTML simple con el diagrama
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Mapa Mental</title>
          <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
          <script>
            mermaid.initialize({ startOnLoad: true });
          </script>
          <style>
            body { margin: 20px; }
            .mermaid { display: flex; justify-content: center; }
          </style>
        </head>
        <body>
          <pre class="mermaid">
            ${this.mermaidCode}
          </pre>
        </body>
      </html>
    `;

    // Abrir nueva pestaña y escribir el contenido
    const newWindow = window.open('');
    newWindow?.document.write(html);
    newWindow?.document.close();
  }
}
