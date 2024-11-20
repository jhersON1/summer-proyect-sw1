export interface InviteUser {
  email: string;
  permissions: 'read' | 'write';
}

export interface CollaborationSession {
  sessionId: string;
  creatorEmail: string;
  invitedUsers: InviteUser[];
  documentId: string;
}
