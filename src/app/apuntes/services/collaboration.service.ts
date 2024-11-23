

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CollaborationSession, InviteUser } from '../components/interfaces/invite.interfaces';

@Injectable({
  providedIn: 'root'
})
export class CollaborationService {
  private readonly apiUrl: string = environment.apiUrl;
  private http = inject(HttpClient);

  constructor() {
    console.log('CollaborationService initialized');
  }

  async createCollaborativeSession(inviteData: InviteUser): Promise<CollaborationSession> {
    console.log('Creating collaborative session with data:', inviteData);

    try {
      const response = await this.http.post<CollaborationSession>(
        `${this.apiUrl}/collaboration/create-session`,
        inviteData
      ).toPromise();

      console.log('Collaborative session created successfully:', response);
      return response!;
    } catch (error) {
      console.error('Error creating collaborative session:', error);
      throw error;
    }
  }

  async verifyCollaborativeAccess(sessionId: string): Promise<boolean> {
    console.log('Verifying collaborative access for session:', sessionId);

    try {
      const response = await this.http.get<{hasAccess: boolean}>(
        `${this.apiUrl}/collaboration/verify-access/${sessionId}`
      ).toPromise();

      console.log('Access verification response:', response);
      return response!.hasAccess;
    } catch (error) {
      console.error('Error verifying access:', error);
      return false;
    }
  }
}
