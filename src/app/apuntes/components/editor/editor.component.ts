import { Component, Input, OnInit, ViewChild, inject } from '@angular/core';
// @ts-ignore
import { QuillEditorComponent } from 'ngx-quill';
import Quill from 'quill';
import { EditorService } from '../../services/editor.service';
import { DialogService } from 'primeng/dynamicdialog';
import { InviteDialogComponent } from '../invite-dialog/invite-dialog.component';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
  providers: [DialogService]
})
export class EditorComponent implements OnInit {
  @Input() tamanoPapel!: string;
  @ViewChild('editor', { static: true }) quillEditor!: QuillEditorComponent;

  private quillInstance!: Quill;
  private dialogService = inject(DialogService);

  isCollaborativeMode = false;

  // constructor(private socket: EditorService) {
  //   console.log('[EditorComponent] Constructor initialized');
  // }

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
      //this.socket.sendChanges(delta);
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
        // Aquí implementaremos la lógica de invitación
      }
    });
  }

  ngOnInit(): void {
    console.log('[EditorComponent] Initializing component');
    // this.socket.getChanges().subscribe({
    //   next: (delta: any) => {
    //     console.log('[EditorComponent] Received changes:', delta);
    //     if (this.quillInstance) {
    //       this.quillInstance.updateContents(delta, 'api');
    //     } else {
    //       console.error('[EditorComponent] Quill instance not initialized.');
    //     }
    //   },
    //   error: (error) => {
    //     console.error('[EditorComponent] Error receiving changes:', error);
    //   }
    // });
  }
}
