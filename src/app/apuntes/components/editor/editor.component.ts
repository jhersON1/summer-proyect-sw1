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
  private subscriptions: Subscription[] = [];

  private quillInstance!: Quill;
  isCollaborativeMode = false;
  isProcessingRemoteChange = false;
  initialized = false;
  private pendingInitialContent: any = null;

  ngOnInit(): void {
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

  created(quill: Quill) {
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

  private applyInitialContent(content: any) {
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

  changedContent(event: any) {
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

  async showInviteDialog() {
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
      contentStyle: { overflow: 'auto' },
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

  toggleUsersPanel(): void {
    console.log('[EditorComponent] Toggling users panel');
    if (this.usersPanel) {
      this.usersPanel.toggle();
    }
  }

  ngOnDestroy(): void {
    console.log('[EditorComponent] Destroying component');
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
