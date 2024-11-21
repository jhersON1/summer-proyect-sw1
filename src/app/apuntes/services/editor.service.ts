import { Injectable, inject } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { WebsocketService } from './websocket.service';
import { map, merge, Observable, Subject, tap } from 'rxjs';
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
  private _contentSubject = new Subject<EditorChange>();

  async initializeCollaborativeSession(invitedUsers: string[]): Promise<string> {
    console.log('[EditorService] Initializing collaborative session');
    const currentUser = this.authService.currentUser();

    if (!currentUser) {
      console.error('[EditorService] No authenticated user found');
      throw new Error('No user authenticated');
    }

    try {
      // Crear sesión
      const createResponse = await this.websocketService.createSession(currentUser.email);
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
      await this.websocketService.joinSession(sessionId, currentUser.email);
      this.sessionId = sessionId;
      console.log('[EditorService] Join successful');
    } catch (error) {
      console.error('[EditorService] Join error:', error);
      throw error;
    }
  }

  getChanges(): Observable<EditorChange> {
    console.log('[EditorService] Setting up changes observer');
    return this.websocketService.onEditorChanges().pipe(
      map(change => ({
        delta: change.delta,
        userId: change.userEmail,
        timestamp: change.timestamp,
        version: 0
      }))
    );
  }

  sendChanges(delta: any): void {
    console.log('[EditorService] Processing changes:', delta);

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

      // Enviar a través de WebSocket
      this.websocketService.sendChanges(
        this.sessionId,
        currentUser.email,
        delta
      );
      console.log('[EditorService] Change sent to WebSocket');

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
  }
}
