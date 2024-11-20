import { Injectable } from '@angular/core';
import { SocketApunteService } from './socket-apunte.service';

@Injectable({
  providedIn: 'root'
})
export class EditorService {

  constructor( private editorSocket: SocketApunteService ) { }

  sendChanges(delta: any){
    this.editorSocket.emit('send-changes', delta);
  }

  getChanges(){
    return this.editorSocket.fromEvent('recieve-changes');
  }
}
