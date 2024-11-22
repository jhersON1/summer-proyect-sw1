export interface CollaborationUser {
  email: string;
  isActive: boolean;
  displayName?: string;
  permissions: UserPermissions;
  lastActivity?: number;
}

export interface UserPermissions {
  canEdit: boolean;
  canInvite: boolean;
  canChangePermissions: boolean;
  canRemoveUsers: boolean;
}

export type PermissionKey = keyof UserPermissions;

export interface CollaborationSession {
  sessionId: string;
  creatorEmail: string;
  users: Map<string, CollaborationUser>;
  documentId: string;
  lastUpdate: number;
}

export interface CollaborationUpdate {
  type: CollaborationUpdateType;
  sessionId: string;
  data: any;
  timestamp: number;
}

export type CollaborationUpdateType = 
  | 'USER_JOINED' 
  | 'USER_LEFT' 
  | 'PERMISSIONS_CHANGED' 
  | 'SESSION_UPDATE';

export interface PermissionChangeRequest {
  sessionId: string;
  targetUserEmail: string;
  newPermissions: UserPermissions;
  requestedBy: string;
}
