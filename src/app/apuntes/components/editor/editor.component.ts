import { Component, Input, OnInit, ViewChild, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuillEditorComponent } from 'ngx-quill';
import { EditorService } from '../../services/editor.service';
import { DialogService } from 'primeng/dynamicdialog';
import { InviteDialogComponent } from '../invite-dialog/invite-dialog.component';
import Quill from 'quill';
import { Subscription } from 'rxjs';
import { EditorChange, QuillDelta } from '../interfaces/editor.interface';
import Delta from 'quill-delta';
import { UsersPanelComponent } from '../users-panel/users-panel.component';
import { GptService } from '../../services/gpt.service';
import { MessageService } from 'primeng/api';
import { MindMapComponent } from '../mind-map/mind-map.component';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  providers: [DialogService]
})
export class EditorComponent implements OnInit, OnDestroy {
  @Input() tamanoPapel!: string;
  @ViewChild(QuillEditorComponent) quillEditor!: QuillEditorComponent;
  @ViewChild('usersPanel') usersPanel!: UsersPanelComponent;

  private route = inject(ActivatedRoute);
  private editorService = inject(EditorService);
  private dialogService = inject(DialogService);
  private gptService: GptService = inject(GptService);
  private messageService = inject(MessageService);


  isProcessingMindMap = false;

  private subscriptions: Subscription[] = [];
  protected quillInstance!: Quill;
  isCollaborativeMode = false;
  isProcessingRemoteChange = false;
  initialized = false;
  private pendingInitialContent: any = null;

  ngOnInit (): void {
    console.log('[EditorComponent] Initializing...');

    // Suscribirse a cambios del editor
    this.subscriptions.push(
      this.editorService.getChanges().subscribe({
        next: (change: EditorChange) => {
          console.log('[EditorComponent] Received change:', change);
          if (this.quillInstance && !this.isProcessingRemoteChange) {
            console.log('[EditorComponent] Applying remote change');
            this.isProcessingRemoteChange = true;
            this.quillInstance.updateContents(change.delta as any);
            this.isProcessingRemoteChange = false;
          }
        },
        error: (error) => {
          console.error('[EditorComponent] Error receiving changes:', error);
        }
      })
    );

    // Suscribirse a contenido inicial
    this.subscriptions.push(
      this.editorService.getInitialContent().subscribe(content => {
        console.log('[EditorComponent] Received initial content from service:', content);
        if (this.quillInstance) {
          console.log('[EditorComponent] Applying initial content immediately');
          this.applyInitialContent(content);
        } else {
          console.log('[EditorComponent] Storing initial content for later');
          this.pendingInitialContent = content;
        }
      })
    );

    // Verificar sessionId en URL
    this.route.queryParams.subscribe(params => {
      if (params['sessionId']) {
        console.log('[EditorComponent] Session ID in URL - activating collaborative mode');
        this.isCollaborativeMode = true;
      }
    });
  }

  created (quill: Quill) {
    console.log('[EditorComponent] Quill Editor Created');
    this.quillInstance = quill;

    // Si hay contenido inicial pendiente, aplicarlo ahora
    if (this.pendingInitialContent) {
      console.log('[EditorComponent] Applying pending initial content');
      this.applyInitialContent(this.pendingInitialContent);
      this.pendingInitialContent = null;
    } else {
      // Guardar contenido inicial en el servicio
      const contents = this.quillInstance.getContents();
      console.log('[EditorComponent] Initial editor contents:', contents);
      this.editorService.setCurrentContent(contents);
    }

    this.initialized = true;
  }

  private applyInitialContent (content: any) {
    if (!this.quillInstance) {
      console.error('[EditorComponent] Cannot apply content - editor not initialized');
      return;
    }

    console.log('[EditorComponent] Applying initial content:', content);
    this.isProcessingRemoteChange = true;
    try {
      // Asegurarse de que el contenido sea un Delta válido
      const delta = new Delta(content.ops);
      this.quillInstance.setContents(delta, 'silent');
      this.editorService.setCurrentContent(delta);
      console.log('[EditorComponent] Initial content applied successfully');
    } catch (error) {
      console.error('[EditorComponent] Error applying initial content:', error);
    }
    this.isProcessingRemoteChange = false;
  }

  changedContent (event: any) {
    if (!event?.delta || this.isProcessingRemoteChange) {
      console.log('[EditorComponent] Ignoring change event - processing remote change or no delta');
      return;
    }

    console.log('[EditorComponent] Content changed event:', event);

    if (this.quillInstance) {
      // Obtener el contenido completo actualizado
      const currentContents = this.quillInstance.getContents();
      console.log('[EditorComponent] Current editor contents:', currentContents);

      // Actualizar contenido en el servicio
      this.editorService.setCurrentContent(currentContents);

      if (this.isCollaborativeMode) {
        console.log('[EditorComponent] Sending collaborative change');
        // Enviar tanto el delta como el contenido completo
        this.editorService.sendChanges({
          delta: event.delta,
          contents: currentContents
        });
      }
    }
  }

  async showInviteDialog () {
    console.log('[EditorComponent] Opening invite dialog');
    if (!this.quillInstance) {
      console.error('[EditorComponent] Quill instance not initialized');
      return;
    }

    // Obtener el contenido actual antes de abrir el diálogo
    const currentContents = this.quillInstance.getContents();
    console.log('[EditorComponent] Current contents before opening dialog:', currentContents);
    this.editorService.setCurrentContent(currentContents);

    const ref = this.dialogService.open(InviteDialogComponent, {
      header: 'Invitar Colaboradores',
      width: '50%',
      contentStyle: {overflow: 'auto'},
      baseZIndex: 10000,
      maximizable: true
    });

    ref.onClose.subscribe((result) => {
      console.log('[EditorComponent] Dialog closed with result:', result);
      if (result) {
        this.isCollaborativeMode = true;
      }
    });
  }

  toggleUsersPanel (): void {
    console.log('[EditorComponent] Toggling users panel');
    if (this.usersPanel) {
      this.usersPanel.toggle();
    }
  }

  /*
    * Método para generar un mapa mental a partir del contenido del editor
  */

  async generateMindMap() {
    console.log('[EditorComponent] Starting mind map generation');

    if (!this.quillInstance) {
      console.error('[EditorComponent] Quill instance not initialized');
      return;
    }

    try {
      this.isProcessingMindMap = true;
      const content = this.quillInstance.getText();
      console.log('[EditorComponent] Current editor content:', content);

      if (!content.trim()) {
        console.warn('[EditorComponent] No content to analyze');
        this.messageService.add({
          severity: 'warn',
          detail: 'No hay contenido para analizar'
        });
        return;
      }

      this.gptService.generateMindMap(content).subscribe({
        next: (response: string) => {
          console.log('[EditorComponent] Mind map generated successfully');
          console.log('[EditorComponent] Mermaid code:', response);

          // Aquí podrías mostrar el mapa mental en un diálogo o en otra parte de la UI
          this.messageService.add({
            severity: 'success',
            detail: 'Mapa mental generado correctamente'
          });

          // Si quieres mostrar el mapa mental en un diálogo, podrías usar:
          this.showMindMapDialog(response);
        },
        error: (error) => {
          console.error('[EditorComponent] Error generating mind map:', error);
          let errorMessage = 'Error al generar el mapa mental';

          if (error.status === 201 && error.error.text) {
            // Si recibimos un 201 con texto, podría ser una respuesta válida
            console.log('[EditorComponent] Received text response:', error.error.text);
            this.showMindMapDialog(error.error.text);
            return;
          }

          this.messageService.add({
            severity: 'error',
            detail: errorMessage
          });
        },
        complete: () => {
          this.isProcessingMindMap = false;
          console.log('[EditorComponent] Mind map generation process completed');
        }
      });

    } catch (error) {
      console.error('[EditorComponent] Unexpected error in generateMindMap:', error);
      this.isProcessingMindMap = false;
      this.messageService.add({
        severity: 'error',
        detail: 'Error inesperado al procesar el contenido'
      });
    }
  }

  private showMindMapDialog(mermaidCode: string) {
    console.log('[EditorComponent] Opening mindmap dialog');

    const ref = this.dialogService.open(MindMapComponent, {
      header: 'Mapa Mental',
      width: '90%',
      height: '90%',
      maximizable: true,
      data: {
        mermaidCode
      }
    });

    ref.onClose.subscribe(() => {
      console.log('[EditorComponent] Mindmap dialog closed');
    });
  }

  ngOnDestroy (): void {
    console.log('[EditorComponent] Destroying component');
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
