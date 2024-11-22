import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { Observable, Subject, firstValueFrom, fromEvent, timeout } from 'rxjs';
import { CollaborationUpdate, UserPermissions } from '../components/interfaces/collaboration.interfaces';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: Socket;
  private readonly url = environment.wsUrl;
  private collaborationUpdates = new Subject<CollaborationUpdate>();

  constructor () {
    console.log('[WebsocketService] Initializing');
    this.socket = io(this.url, {
      autoConnect: false,
      transports: ['websocket']
    });

    this.setupSocketListeners();
  }

  private setupSocketListeners () {
    this.socket.on('connect', () => {
      console.log('[WebsocketService] Connected to server with ID:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log('[WebsocketService] Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('[WebsocketService] Connection error:', error);
    });

    // Nuevo listener para actualizaciones de colaboración
    this.socket.on('collaborationUpdate', (update: CollaborationUpdate) => {
      console.log('[WebsocketService] Received collaboration update:', update);
      this.collaborationUpdates.next(update);
    });
  }

  onCollaborationUpdates(): Observable<CollaborationUpdate> {
    return this.collaborationUpdates.asObservable();
  }

  async updatePermissions(data: {
    sessionId: string;
    targetUserEmail: string;
    newPermissions: any;
    requestedByEmail: string;
  }): Promise<void> {
    console.log('[WebsocketService] Updating permissions:', {
      sessionId: data.sessionId,
      targetUser: data.targetUserEmail,
      requestedBy: data.requestedByEmail,
      newPermissions: data.newPermissions
    });

    await this.ensureConnection();

    return new Promise((resolve, reject) => {
      this.socket.emit('updatePermissions', {
        sessionId: data.sessionId,
        targetUserEmail: data.targetUserEmail,
        newPermissions: data.newPermissions,
        requestedByEmail: data.requestedByEmail
      }, (response: any) => {
        console.log('[WebsocketService] Update permissions response:', response);
        if (response.status === 'success') {
          resolve();
        } else {
          console.error('[WebsocketService] Permission update failed:', response.message);
          reject(new Error(response.message));
        }
      });
    });
  }
  private async ensureConnection (): Promise<void> {
    if (this.socket.connected) {
      console.log('[WebsocketService] Socket already connected');
      return;
    }

    console.log('[WebsocketService] Connecting socket...');
    this.socket.connect();

    try {
      await firstValueFrom(
        fromEvent(this.socket, 'connect').pipe(timeout(5000))
      );
      console.log('[WebsocketService] Socket connected successfully');
    } catch (error) {
      console.error('[WebsocketService] Connection timeout:', error);
      throw new Error('No se pudo conectar al servidor');
    }
  }

  async createSession (creatorEmail: string, initialContent?: any): Promise<any> {
    console.log('[WebsocketService] Creating session for:', creatorEmail);
    console.log('[WebsocketService] Initial content:', initialContent);

    await this.ensureConnection();

    return new Promise((resolve, reject) => {
      this.socket.emit('createSession',
        {creatorEmail, initialContent},
        (response: any) => {
          console.log('[WebsocketService] Create session response:', response);
          if (response.status === 'success') {
            resolve(response);
          } else {
            reject(new Error(response.message));
          }
        }
      );
    });
  }

  async joinSession (sessionId: string, userEmail: string): Promise<any> {
    console.log('[WebsocketService] Joining session:', sessionId);

    await this.ensureConnection();

    return new Promise((resolve, reject) => {
      this.socket.emit('joinSession', {sessionId, userEmail}, (response: any) => {
        console.log('[WebsocketService] Join session response:', response);
        if (response.status === 'success') {
          resolve(response);
        } else {
          reject(new Error(response.message));
        }
      });
    });
  }

  async addAllowedUsers (
    sessionId: string,
    creatorEmail: string,
    usersToAdd: string[]
  ): Promise<any> {
    console.log('[WebsocketService] Adding allowed users:', usersToAdd);

    await this.ensureConnection();

    return new Promise((resolve, reject) => {
      this.socket.emit('addAllowedUsers',
        {sessionId, creatorEmail, usersToAdd},
        (response: any) => {
          console.log('[WebsocketService] Add allowed users response:', response);
          if (response.status === 'success') {
            resolve(response);
          } else {
            reject(new Error(response.message));
          }
        }
      );
    });
  }

  sendChanges (
    sessionId: string,
    userEmail: string,
    delta: any,
    content?: any
  ): void {
    console.log('[WebsocketService] Sending changes:', {
      sessionId,
      userEmail,
      delta,
      content
    });

    this.socket.emit('editorChanges', {
      sessionId,
      userEmail,
      delta,
      content
    });
  }

  onEditorChanges (): Observable<any> {
    console.log('[WebsocketService] Setting up editor changes listener');
    const changes$ = new Subject<any>();

    this.socket.on('editorChanges', (data) => {
      console.log('[WebsocketService] Received changes:', data);
      changes$.next(data);
    });

    return changes$.asObservable();
  }

  onUserJoined (): Observable<any> {
    console.log('[WebsocketService] Setting up user joined listener');
    const userJoined$ = new Subject<any>();

    this.socket.on('userJoined', (data) => {
      console.log('[WebsocketService] User joined:', data);
      userJoined$.next(data);
    });

    return userJoined$.asObservable();
  }

  disconnect () {
    console.log('[WebsocketService] Disconnecting');
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }

  isConnected (): boolean {
    return this.socket.connected;
  }
}
