export interface Invitation {
  email: string;
  permissions: CollaborationPermissions;
}

export interface CollaborationPermissions {
  canEdit: boolean;
  canInvite: boolean;
  canDelete: boolean;
}

export interface CollaborationSession {
  sessionId: string;
  creatorEmail: string;
  invitedUsers: Invitation[];
  activeUsers: Set<string>;
}

// Para las respuestas del servidor
export interface CollaborationResponse {
  success: boolean;
  message: string;
  sessionId?: string;
  collaborationUrl?: string;
}

// Para el estado de la colaboración
export enum CollaborationStatus {
  INACTIVE = 'inactive',
  CONNECTING = 'connecting',
  ACTIVE = 'active',
  ERROR = 'error'
}
