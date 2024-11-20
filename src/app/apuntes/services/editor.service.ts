import { Injectable, inject } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { WebsocketService } from './websocket.service';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EditorService {
  private authService = inject(AuthService);
  private websocketService = inject(WebsocketService);

  private sessionId: string | null = null;

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
      console.log('[EditorService] Joined session successfully');
    } catch (error) {
      console.error('[EditorService] Error joining session:', error);
      throw error;
    }
  }

  sendChanges(delta: any): void {
    console.log('[EditorService] Sending changes:', delta);
    const currentUser = this.authService.currentUser();

    if (!this.sessionId || !currentUser) {
      console.warn('[EditorService] Cannot send changes - no active session or user');
      return;
    }

    this.websocketService.sendChanges(this.sessionId, currentUser.email, delta);
  }

  getChanges(): Observable<any> {
    console.log('[EditorService] Setting up changes listener');
    return this.websocketService.onEditorChanges().pipe(
      tap(changes => console.log('[EditorService] Received changes:', changes))
    );
  }

  getUserUpdates(): Observable<any> {
    console.log('[EditorService] Setting up user updates listener');
    return this.websocketService.onUserJoined().pipe(
      tap(update => console.log('[EditorService] User update received:', update))
    );
  }

  disconnect(): void {
    console.log('[EditorService] Disconnecting');
    this.websocketService.disconnect();
    this.sessionId = null;
  }
}
