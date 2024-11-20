import { Injectable, inject } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { WebsocketService } from './websocket.service';
import { Observable, tap } from 'rxjs';
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

  async initializeCollaborativeSession(invitedUsers: string[]): Promise<string> {
    console.log('[EditorService] Initializing collaborative session');
    const currentUser = this.authService.currentUser();

    if (!currentUser) {
      throw new Error('No user authenticated');
    }

    try {
      // Crear sesión
      const createResponse = await this.websocketService.createSession(currentUser.email);
      this.sessionId = createResponse.sessionId;
      console.log('[EditorService] Session created:', this.sessionId);

      // Añadir usuarios permitidos
      await this.websocketService.addAllowedUsers(
        this.sessionId as string,
        currentUser.email,
        invitedUsers
      );
      console.log('[EditorService] Users added to session');

      // Limpiar buffer al iniciar nueva sesión
      this.bufferService.clearBuffer();

      return this.sessionId as string;

    } catch (error) {
      console.error('[EditorService] Error initializing session:', error);
      throw error;
    }
  }

  async joinSession(sessionId: string): Promise<void> {
    console.log('[EditorService] Joining session:', sessionId);
    const currentUser = this.authService.currentUser();

    if (!currentUser) {
      throw new Error('No user authenticated');
    }

    try {
      await this.websocketService.joinSession(sessionId, currentUser.email);
      this.sessionId = sessionId;
      this.bufferService.clearBuffer(); // Limpiar buffer al unirse
      console.log('[EditorService] Joined session successfully');
    } catch (error) {
      console.error('[EditorService] Error joining session:', error);
      throw error;
    }
  }

  sendChanges(delta: QuillDelta): void {
    console.log('[EditorService] Processing changes:', delta);

    if (!this.sessionId || this.isProcessingChanges) {
      console.warn('[EditorService] Cannot send changes - no active session or already processing');
      return;
    }

    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      console.error('[EditorService] No user authenticated');
      return;
    }

    try {
      this.isProcessingChanges = true;

      // Crear objeto de cambio
      const change: EditorChange = {
        delta,
        userId: currentUser.email,
        timestamp: Date.now(),
        version: this.bufferService.getCurrentVersion()
      };

      // Añadir al buffer local
      this.bufferService.addChange(change);

      // Enviar a través de WebSocket
      this.websocketService.sendChanges(this.sessionId, currentUser.email, change);

      console.log('[EditorService] Changes sent successfully');
    } catch (error) {
      console.error('[EditorService] Error sending changes:', error);
    } finally {
      this.isProcessingChanges = false;
    }
  }

  getChanges(): Observable<EditorChange> {
    console.log('[EditorService] Setting up changes listener');
    return this.websocketService.onEditorChanges().pipe(
      tap(change => {
        console.log('[EditorService] Received change:', change);
        // Añadir cambio recibido al buffer
        this.bufferService.addChange(change);
      })
    );
  }

  getUserUpdates(): Observable<any> {
    console.log('[EditorService] Setting up user updates listener');
    return this.websocketService.onUserJoined().pipe(
      tap(update => console.log('[EditorService] User update received:', update))
    );
  }

  getBufferStatus() {
    return this.bufferService.getBufferStatus();
  }

  disconnect(): void {
    console.log('[EditorService] Disconnecting');
    if (this.bufferService.hasPendingChanges()) {
      console.warn('[EditorService] There are pending changes in buffer');
      // Aquí podríamos implementar lógica para guardar cambios pendientes
    }
    this.websocketService.disconnect();
    this.bufferService.clearBuffer();
    this.sessionId = null;
  }
}
