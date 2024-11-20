import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { QuillEditorComponent } from 'ngx-quill';
import Quill from 'quill';
import { EditorService } from '../../services/editor.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
})
export class EditorComponent implements OnInit {
  @Input() tamanoPapel!: string;
  @ViewChild('editor', { static: true }) quillEditor!: QuillEditorComponent;

  private quillInstance!: Quill;

  constructor(private socket: EditorService) {}

  created(event: Quill) {
    this.quillInstance = event;
    console.log('editor-created', event);
  }

  changedContent(event: any) {
    console.log('content-change', event);
    const source: string = event.source;
    const delta: any = event.delta;
    if (source !== 'user') return;

    this.socket.sendChanges(delta);
  }

  testUpdateContents(delta: any) {
    if (this.quillInstance) {
      this.quillInstance.updateContents(delta, 'api');
      console.log('Delta applied:', delta);
    } else {
      console.error('Quill instance not initialized.');
    }
  }

  ngOnInit(): void {
    this.socket.getChanges().subscribe((delta: any) => {
      if (this.quillInstance) {
        this.quillInstance.updateContents(delta, 'api');
        console.log('Changes applied:', delta);
      } else {
        console.error('Quill instance not initialized.');
      }
    });
  }
}
