import { Component, Input } from '@angular/core';
import { EditorChangeContent, EditorChangeSelection } from 'ngx-quill';
import { MenuItem } from 'primeng/api';
import Quill from 'quill';
import Block from 'quill/blots/block';

Block.tagName = "DIV";
Quill.register(Block, true);

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
})

export class EditorComponent {
  blurred = false
  focused = false

  @Input() tamanoPapel!: string;


  created(event: Quill | any) {
    // tslint:disable-next-line:no-console
    console.log('editor-created', event)
  }

  changedEditor(event: EditorChangeContent | EditorChangeSelection | any) {
    // tslint:disable-next-line:no-console
    console.log('editor-change', event)
  }

  focus($event: any) {
    // tslint:disable-next-line:no-console
    console.log('focus', $event)
    this.focused = true
    this.blurred = false
  }

  nativeFocus($event: any) {
    // tslint:disable-next-line:no-console
    console.log('native-focus', $event)
  }

  blur($event: any) {
    // tslint:disable-next-line:no-console
    console.log('blur', $event)
    this.focused = false
    this.blurred = true
  }
  nativeBlur($event: any) {
    // tslint:disable-next-line:no-console
    console.log('native-blur', $event)
  }

}
