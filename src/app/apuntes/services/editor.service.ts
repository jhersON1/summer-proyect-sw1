import { Injectable, inject } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { WebsocketService } from './websocket.service';
import { interval, map, Observable, Subject, Subscription, tap } from 'rxjs';

import { EditorChange, QuillDelta } from '../components/interfaces/editor.interface';
import { CollaborationUpdate, UserPermissions } from '../components/interfaces/collaboration.interfaces';
import { ApunteService } from '../../contenido/services/apunte.service';
import { Apunte } from '../../contenido/interfaces/apunte.interface';

@Injectable({
  providedIn: 'root'
})
export class EditorService {
  private authService = inject(AuthService);
  private websocketService = inject(WebsocketService);
  private apunteService = inject(ApunteService);

  private creatorEmail: string | null = null;
  private sessionId: string | null = null;
  private isProcessingChanges = false;
  private currentContent: any = null;
  private _contentSubject = new Subject<EditorChange>();
  private _initialContentSubject = new Subject<any>();

  private apunteActual: Apunte | null = null;
  private autoSaveInterval = 6000; // 6 segundos
  private autoSaveSubscription?: Subscription;

  // Método para obtener el contenido inicial
  getInitialContent (): Observable<any> {
    return this._initialContentSubject.asObservable();
  }


  // Método para obtener el contenido actual
  async getCurrentContent (): Promise<any> {
    console.log('[EditorService] Getting current content:', this.currentContent);
    return this.currentContent;
  }

  // Método para actualizar el contenido actual
  setCurrentContent (content: any): void {
    console.log('[EditorService] Setting current content:', content);
    this.currentContent = content;
  }

  async initializeCollaborativeSession (invitedUsers: string[], initialContent: any): Promise<string> {
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
      this.creatorEmail = currentUser.email;
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

  async joinSession (sessionId: string): Promise<void> {
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

      // Si el usuario actual es el creador, almacenamos su email
      if (response.isCreator) {
        this.creatorEmail = currentUser.email;
      }

      console.log('[EditorService] Join successful');
    } catch (error) {
      console.error('[EditorService] Join error:', error);
      throw error;
    }
  }

  getChanges (): Observable<EditorChange> {
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

  sendChanges (changes: { delta: any, contents: any }): void {
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

  getUserUpdates (): Observable<CollaborationUpdate> {
    console.log('[EditorService] Setting up user updates stream');

    return this.websocketService.onCollaborationUpdates().pipe(
      tap(update => console.log('[EditorService] Received collaboration update:', update)),
      map(update => {
        if (!update.timestamp) {
          update.timestamp = Date.now();
        }
        return update;
      })
    );
  }

  // Nuevo método para actualizar permisos de usuario
  async updateUserPermissions(targetUserEmail: string, newPermissions: any): Promise<void> {
    console.log('[EditorService] Starting permission update for:', targetUserEmail);
    console.log('[EditorService] New permissions:', newPermissions);

    if (!this.sessionId) {
      console.error('[EditorService] No active session found');
      throw new Error('No hay una sesión activa');
    }

    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      console.error('[EditorService] No authenticated user found');
      throw new Error('No hay un usuario autenticado');
    }

    console.log('[EditorService] Current user:', currentUser.email);
    console.log('[EditorService] Session ID:', this.sessionId);
    console.log('[EditorService] Creator email:', this.creatorEmail);

    try {
      await this.websocketService.updatePermissions({
        sessionId: this.sessionId,
        targetUserEmail,
        newPermissions,
        requestedByEmail: currentUser.email
      });

      console.log('[EditorService] Permission update successful');
    } catch (error) {
      console.error('[EditorService] Error updating permissions:', error);
      throw new Error('Error al actualizar los permisos');
    }
  }

  setApunte(apunte: Apunte): void {
    console.log('[EditorService] Setting current apunte:', apunte);
    this.apunteActual = apunte;
  }

  // Método para iniciar el auto-save
  startAutoSave(apunte : Apunte): void {

    // Cancelar cualquier suscripción existente
    this.stopAutoSave();

    console.log('[EditorService] Starting auto-save');
    this.autoSaveSubscription = interval(this.autoSaveInterval).subscribe(() => {
      this.saveContent();
    });
  }

  // Método para detener el auto-save
  stopAutoSave(): void {
    console.log('[EditorService] Stopping auto-save');
    if (this.autoSaveSubscription) {
      this.autoSaveSubscription.unsubscribe();
      this.autoSaveSubscription = undefined;
    }
  }

  saveContent(): void {
    if (!this.apunteActual) {
      console.error('[EditorService] Cannot save - no hay apunte');
      return;
    }

    const updatedApunte = {
      ...this.apunteActual,
      contenido: this.currentContent
    };

    console.log('[EditorService] Saving updated apunte:', updatedApunte);

    this.apunteService.updateApunte(updatedApunte).subscribe({
      next: () => {
        console.log('[EditorService] Apunte saved successfully');
      },
      error: (error) => {
        console.error('[EditorService] Error saving apunte:', error);
      }
    });
  }

  // Modificar el método disconnect existente
  disconnect(): void {
    console.log('[EditorService] Disconnecting from session');
    this.stopAutoSave(); // Detener el auto-save antes de desconectar
    this.websocketService.disconnect();
    this.sessionId = null;
    this.currentContent = null;
  }

  // Método para obtener el email del creador
  getCreatorEmail(): string | null {
    return this.creatorEmail;
  }
}
