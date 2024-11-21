import { Injectable, inject } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { WebsocketService } from './websocket.service';
import { map, Observable, Subject } from 'rxjs';
import { BufferService } from './buffer.service';
import { EditorChange, QuillDelta } from '../components/interfaces/editor.interface';

@Injectable({
  providedIn: 'root'
})
export class EditorService {
  private authService = inject(AuthService);
  private websocketService = inject(WebsocketService);
  private bufferService = inject(BufferService);

  private sessionId: string | null = null;
  private isProcessingChanges = false;
  private currentContent: any = null;
  private _contentSubject = new Subject<EditorChange>();
  private _initialContentSubject = new Subject<any>();

  // Método para obtener el contenido inicial
  getInitialContent(): Observable<any> {
    return this._initialContentSubject.asObservable();
  }


  // Método para obtener el contenido actual
  async getCurrentContent(): Promise<any> {
    console.log('[EditorService] Getting current content:', this.currentContent);
    return this.currentContent;
  }

  // Método para actualizar el contenido actual
  setCurrentContent(content: any): void {
    console.log('[EditorService] Setting current content:', content);
    this.currentContent = content;
  }

  async initializeCollaborativeSession(invitedUsers: string[], initialContent: any): Promise<string> {
    console.log('[EditorService] Initializing collaborative session');
    console.log('[EditorService] Initial content:', initialContent);

    const currentUser = this.authService.currentUser();

    if (!currentUser) {
      console.error('[EditorService] No authenticated user found');
      throw new Error('No user authenticated');
    }

    try {
      // Guardar el contenido actual
      this.setCurrentContent(initialContent);

      // Crear sesión con contenido inicial
      const createResponse = await this.websocketService.createSession(
        currentUser.email,
        initialContent
      );
      this.sessionId = createResponse.sessionId;
      console.log('[EditorService] Session created:', this.sessionId);

      // Añadir usuarios permitidos
      await this.websocketService.addAllowedUsers(
        this.sessionId!,
        currentUser.email,
        invitedUsers
      );
      console.log('[EditorService] Users added to session:', invitedUsers);

      return this.sessionId!;
    } catch (error) {
      console.error('[EditorService] Error initializing session:', error);
      throw error;
    }
  }

  async joinSession(sessionId: string): Promise<void> {
    console.log('[EditorService] Joining session:', sessionId);
    const currentUser = this.authService.currentUser();

    if (!currentUser) {
      console.error('[EditorService] No user authenticated');
      throw new Error('No user authenticated');
    }

    try {
      const response = await this.websocketService.joinSession(sessionId, currentUser.email);
      this.sessionId = sessionId;

      // Actualizar el contenido actual con el recibido del servidor
      if (response.currentContent?.content) {
        console.log('[EditorService] Received initial content:', response.currentContent.content);
        this.setCurrentContent(response.currentContent.content);
        // Emitir el contenido inicial al componente
        this._initialContentSubject.next(response.currentContent.content);
      }

      console.log('[EditorService] Join successful');
    } catch (error) {
      console.error('[EditorService] Join error:', error);
      throw error;
    }
  }

  getChanges(): Observable<EditorChange> {
    console.log('[EditorService] Setting up changes observer');
    return this.websocketService.onEditorChanges().pipe(
      map(change => {
        // Actualizar el contenido actual con los cambios recibidos
        if (change.content) {
          this.setCurrentContent(change.content);
        }
        return {
          delta: change.delta,
          userId: change.userEmail,
          timestamp: change.timestamp,
          version: 0
        };
      })
    );
  }

  sendChanges(changes: { delta: any, contents: any }): void {
    console.log('[EditorService] Processing changes:', changes);

    if (!this.sessionId || this.isProcessingChanges) {
      console.warn('[EditorService] Cannot send changes - no session or processing');
      return;
    }

    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      console.error('[EditorService] No user authenticated');
      return;
    }

    try {
      this.isProcessingChanges = true;

      // Actualizar el contenido local con el contenido completo actualizado
      this.setCurrentContent(changes.contents);

      // Enviar a través de WebSocket
      this.websocketService.sendChanges(
        this.sessionId,
        currentUser.email,
        changes.delta,
        changes.contents  // Enviamos el contenido completo actualizado
      );
      console.log('[EditorService] Change sent to WebSocket with full contents');

    } catch (error) {
      console.error('[EditorService] Error sending changes:', error);
    } finally {
      this.isProcessingChanges = false;
    }
  }

  getUserUpdates(): Observable<any> {
    console.log('[EditorService] Setting up user updates listener');
    return this.websocketService.onUserJoined();
  }

  disconnect(): void {
    console.log('[EditorService] Disconnecting from session');
    this.websocketService.disconnect();
    this.sessionId = null;
    this.currentContent = null;
  }
}
