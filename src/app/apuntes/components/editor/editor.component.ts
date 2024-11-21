// editor.component.ts
import { Component, Input, OnInit, ViewChild, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuillEditorComponent } from 'ngx-quill';
import { EditorService } from '../../services/editor.service';
import { DialogService } from 'primeng/dynamicdialog';
import { InviteDialogComponent } from '../invite-dialog/invite-dialog.component';
import Quill from 'quill';
import { Subscription } from 'rxjs';
import { EditorChange, QuillDelta } from '../interfaces/editor.interface';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  providers: [DialogService]
})
export class EditorComponent implements OnInit, OnDestroy {
  @Input() tamanoPapel!: string;
  @ViewChild('editor', { static: true }) quillEditor!: QuillEditorComponent;

  private route = inject(ActivatedRoute);
  private editorService = inject(EditorService);
  private dialogService = inject(DialogService);
  private subscriptions: Subscription[] = [];

  private quillInstance!: Quill;
  isCollaborativeMode = false;
  isProcessingRemoteChange = false;
  private pendingChanges: EditorChange[] = [];

  ngOnInit(): void {
    console.log('[EditorComponent] Initializing...');

    // Suscribirse a cambios del editor
    this.subscriptions.push(
      this.editorService.getChanges().subscribe({
        next: (change: EditorChange) => {
          console.log('[EditorComponent] Received change:', change);
          this.applyRemoteChange(change);
        },
        error: (error) => {
          console.error('[EditorComponent] Error receiving changes:', error);
        }
      })
    );

    // Suscribirse a actualizaciones de usuarios
    this.subscriptions.push(
      this.editorService.getUserUpdates().subscribe({
        next: (update) => {
          console.log('[EditorComponent] User update received:', update);
          this.isCollaborativeMode = true;
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

  ngOnDestroy(): void {
    console.log('[EditorComponent] Destroying component');
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  created(event: Quill) {
    console.log('[EditorComponent] Quill Editor Created:', event);
    this.quillInstance = event;

    // Escuchar cambios del editor
    this.quillInstance.on('text-change', (delta, oldDelta, source) => {
      console.log('[EditorComponent] Text changed:', { delta, source });
      if (source === 'user') {
        this.changedContent({ delta, source });
      }
    });
  }

  changedContent(event: any) {
    console.log('[EditorComponent] Content Changed:', event);
    if (!event || !event.delta || event.source !== 'user') {
      return;
    }

    if (this.isProcessingRemoteChange) {
      console.log('[EditorComponent] Ignoring change - processing remote update');
      return;
    }

    if (this.isCollaborativeMode) {
      console.log('[EditorComponent] Sending collaborative change');
      const delta: QuillDelta = event.delta;
      this.editorService.sendChanges(delta);
    }
  }

  //todo cambiar any por EditorState
  // private applyRemoteChange(change: any): void {
  //   if (!this.quillInstance) {
  //     console.log('[EditorComponent] Queuing change - Quill not initialized');
  //     this.pendingChanges.push(change);
  //     return;
  //   }
  //
  //   try {
  //     this.isProcessingRemoteChange = true;
  //     console.log('[EditorComponent] Applying remote change:', change);
  //     this.quillInstance.updateContents(change.delta, 'api');
  //   } catch (error) {
  //     console.error('[EditorComponent] Error applying change:', error);
  //   } finally {
  //     this.isProcessingRemoteChange = false;
  //   }
  // }

  private applyRemoteChange(change: any): void {
    console.log('[EditorComponent] Applying remote change:', change);

    if (!this.quillInstance) {
      console.error('[EditorComponent] Quill not initialized');
      return;
    }

    try {
      this.isProcessingRemoteChange = true;
      // Usar setContents para contenido inicial, updateContents para cambios
      if (change.userId === 'system') {
        console.log('[EditorComponent] Setting initial content');
        this.quillInstance.setContents(change.delta);
      } else {
        console.log('[EditorComponent] Updating content with delta');
        this.quillInstance.updateContents(change.delta);
      }
    } catch (error) {
      console.error('[EditorComponent] Error applying change:', error);
    } finally {
      this.isProcessingRemoteChange = false;
    }
  }

  showInviteDialog() {
    console.log('[EditorComponent] Opening invite dialog');
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
}
