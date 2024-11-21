import { Component, Input, OnInit, ViewChild, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuillEditorComponent } from 'ngx-quill';
import { EditorService } from '../../services/editor.service';
import { DialogService } from 'primeng/dynamicdialog';
import { InviteDialogComponent } from '../invite-dialog/invite-dialog.component';
import Quill from 'quill';
import { Subscription } from 'rxjs';
import { EditorChange, QuillDelta } from '../interfaces/editor.interface';
import Delta from 'quill';

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
  initialized = false;

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

    // Verificar sessionId en URL
    this.route.queryParams.subscribe(params => {
      if (params['sessionId']) {
        console.log('[EditorComponent] Session ID in URL - activating collaborative mode');
        this.isCollaborativeMode = true;
      }
    });
  }

  created(event: Quill) {
    console.log('[EditorComponent] Quill Editor Created:', event);
    this.quillInstance = event;
    this.initialized = true;
  }

  changedContent(event: any) {
    if (!event?.delta || this.isProcessingRemoteChange) {
      console.log('[EditorComponent] Ignoring change event - processing remote change or no delta');
      return;
    }

    console.log('[EditorComponent] Content changed event:', event);

    if (this.isCollaborativeMode && this.quillInstance) {
      console.log('[EditorComponent] Sending collaborative change');
      this.editorService.sendChanges(event.delta);
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

  ngOnDestroy(): void {
    console.log('[EditorComponent] Destroying component');
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
