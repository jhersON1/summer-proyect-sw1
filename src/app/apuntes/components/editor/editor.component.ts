// editor.component.ts
import { Component, Input, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuillEditorComponent } from 'ngx-quill';
import { EditorService } from '../../services/editor.service';
import { DialogService } from 'primeng/dynamicdialog';
import { InviteDialogComponent } from '../invite-dialog/invite-dialog.component';
import Quill from 'quill';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  providers: [DialogService]
})
export class EditorComponent implements OnInit {
  @Input() tamanoPapel!: string;
  @ViewChild('editor', { static: true }) quillEditor!: QuillEditorComponent;

  private route = inject(ActivatedRoute);
  private editorService = inject(EditorService);
  private dialogService = inject(DialogService);

  private quillInstance!: Quill;
  isCollaborativeMode = false;

  ngOnInit(): void {
    console.log('[EditorComponent] Initializing...');

    // Escuchar cambios del websocket
    this.editorService.getChanges().subscribe({
      next: (delta: any) => {
        console.log('[EditorComponent] Received changes:', delta);
        if (this.quillInstance) {
          this.quillInstance.updateContents(delta, 'api');
        } else {
          console.error('[EditorComponent] Quill instance not initialized');
        }
      },
      error: (error) => {
        console.error('[EditorComponent] Error receiving changes:', error);
      }
    });

    // Escuchar actualizaciones de usuarios
    this.editorService.getUserUpdates().subscribe({
      next: (update) => {
        console.log('[EditorComponent] User update received:', update);
        this.isCollaborativeMode = true;
      }
    });

    // Verificar si hay sessionId en la URL
    this.route.queryParams.subscribe(params => {
      if (params['sessionId']) {
        console.log('[EditorComponent] Session ID in URL - collaborative mode active');
        this.isCollaborativeMode = true;
      }
    });
  }

  created(event: Quill) {
    console.log('[EditorComponent] Quill Editor Created:', event);
    this.quillInstance = event;
  }

  changedContent(event: any) {
    console.log('[EditorComponent] Content Changed:', event);
    const source: string = event.source;
    const delta: any = event.delta;

    if (source !== 'user') return;

    if (this.isCollaborativeMode) {
      console.log('[EditorComponent] Sending changes in collaborative mode');
      this.editorService.sendChanges(delta);
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
