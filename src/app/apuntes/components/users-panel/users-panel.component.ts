import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { EditorService } from '../../services/editor.service';
import {
  CollaborationUser,
  UserPermissions,
  PermissionKey,
  CollaborationUpdate
} from '../interfaces/collaboration.interfaces';
import { AuthService } from '../../../auth/services/auth.service';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-users-panel',
  templateUrl: './users-panel.component.html',
  providers: [MessageService],
  styleUrls: ['./users-panel.component.scss']
})
export class UsersPanelComponent implements OnInit, OnDestroy {
  private editorService = inject(EditorService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);

  visible = false;
  users = signal<CollaborationUser[]>([]);
  currentUserEmail = signal<string>('');
  canManagePermissions = signal<boolean>(false);
  selectedUser: CollaborationUser | null = null;
  permissions: { key: PermissionKey; label: string }[] = [
    { key: 'canEdit', label: 'Permitir edición' },
    { key: 'canInvite', label: 'Permitir invitar' },
    { key: 'canChangePermissions', label: 'Permitir gestionar permisos' },
    { key: 'canRemoveUsers', label: 'Permitir eliminar usuarios' }
  ];

  private subscriptions: Subscription[] = [];

  ngOnInit() {
    console.log('[UsersPanelComponent] Initializing...');

    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.currentUserEmail.set(currentUser.email);
      console.log('[UsersPanelComponent] Current user:', currentUser.email);
    }

    this.subscriptions.push(
      this.editorService.getUserUpdates().subscribe(update => {
        console.log('[UsersPanelComponent] Received user update:', update);
        this.handleUserUpdate(update);
      })
    );

    this.checkCurrentUserPermissions();
  }

  private checkCurrentUserPermissions(): void {
    const currentUsers = this.users();
    const currentUserEmail = this.currentUserEmail();
    const currentUser = currentUsers.find(u => u.email === currentUserEmail);

    console.log('[UsersPanelComponent] Checking permissions for current user:', currentUser);

    if (currentUser?.permissions) {
      this.canManagePermissions.set(currentUser.permissions.canChangePermissions);
      console.log('[UsersPanelComponent] Can manage permissions:', currentUser.permissions.canChangePermissions);
    }
  }

  private handleUserUpdate(update: CollaborationUpdate): void {
    console.log('[UsersPanelComponent] Handling user update:', update);
    const currentUsers = this.users();

    switch (update.type) {
      case 'USER_JOINED': {
        const { userEmail, permissions, activeUsers, isCreator } = update.data;

        if (Array.isArray(activeUsers)) {
          console.log('[UsersPanelComponent] Updating full users list:', activeUsers);
          const updatedUsers = activeUsers.map(email => {
            const isUserCreator = email === this.editorService.getCreatorEmail();
            const userPermissions = isUserCreator ? {
              canEdit: true,
              canInvite: true,
              canChangePermissions: true,
              canRemoveUsers: true
            } : (email === userEmail ? permissions : this.getDefaultPermissions());

            return {
              email,
              isActive: true,
              permissions: userPermissions,
              lastActivity: Date.now(),
              isCreator: isUserCreator
            };
          });
          this.users.set(updatedUsers);
        }

        if (userEmail === this.currentUserEmail() && isCreator) {
          this.canManagePermissions.set(true);
        }
        this.checkCurrentUserPermissions();
        break;
      }

      case 'USER_LEFT': {
        const { userEmail } = update.data;
        const updatedUsers = currentUsers.map(user =>
          user.email === userEmail ? { ...user, isActive: false } : user
        );
        this.users.set(updatedUsers);
        break;
      }

      case 'PERMISSIONS_CHANGED': {
        const { userEmail, permissions } = update.data;
        const updatedUsers = currentUsers.map(user =>
          user.email === userEmail ? { ...user, permissions } : user
        );
        this.users.set(updatedUsers);

        if (userEmail === this.currentUserEmail()) {
          this.checkCurrentUserPermissions();
        }
        break;
      }
    }

    console.log('[UsersPanelComponent] Updated users list:', this.users());
  }

  async onPermissionChange(permission: PermissionKey, user: CollaborationUser): Promise<void> {
    console.log('[UsersPanelComponent] Permission change requested:', {
      user: user.email,
      permission,
      currentValue: user.permissions[permission]
    });

    const newPermissions = {
      ...user.permissions,
      [permission]: !user.permissions[permission]
    };

    console.log('[UsersPanelComponent] New permissions to be set:', newPermissions);

    try {
      await this.editorService.updateUserPermissions(
        user.email,
        newPermissions
      );

      console.log('[UsersPanelComponent] Permission update successful');
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Permisos actualizados correctamente'
      });
    } catch (error) {
      console.error('[UsersPanelComponent] Error updating permissions:', error);
      user.permissions[permission] = !user.permissions[permission]; // Revert the change
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron actualizar los permisos'
      });
    }
  }

  private getDefaultPermissions(): UserPermissions {
    return {
      canEdit: true,
      canInvite: false,
      canChangePermissions: false,
      canRemoveUsers: false
    };
  }

  toggle(): void {
    this.visible = !this.visible;
  }

  ngOnDestroy(): void {
    console.log('[UsersPanelComponent] Destroying component');
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
