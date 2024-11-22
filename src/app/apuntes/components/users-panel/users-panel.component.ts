import { Component, OnDestroy, OnInit, inject, signal, ViewChild } from '@angular/core';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { EditorService } from '../../services/editor.service';
import {
  CollaborationUser,
  UserPermissions,
  PermissionKey,
  CollaborationUpdate
} from '../interfaces/collaboration.interfaces';
import { AuthService } from '../../../auth/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-users-panel',
  template: `
    <p-sidebar
      [(visible)]="visible"
      position="right"
      [style]="{width:'30rem'}"
      styleClass="p-sidebar-md"
    >
      <ng-template pTemplate="header">
        <h3>Usuarios Conectados</h3>
      </ng-template>

      <div class="user-list">
        @for (user of users(); track user.email) {
          <div class="user-item flex align-items-center justify-content-between p-3 border-bottom-1 surface-border">
            <div class="flex align-items-center gap-2">
              <span class="user-status" [class.online]="user.isActive"></span>
              <span class="user-name">{{ user.displayName || user.email }}</span>
            </div>
            @if (canManagePermissions() && user.email !== currentUserEmail()) {
              <p-button
                icon="pi pi-cog"
                styleClass="p-button-rounded p-button-text"
                (click)="showPermissionsMenu($event, user)"
              />
            }
          </div>
        }
      </div>
    </p-sidebar>

    <p-menu #menu [popup]="true" [model]="permissionsMenu"></p-menu>
  `,
  styles: [`
    .user-status {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--red-500);
      &.online {
        background-color: var(--green-500);
      }
    }
    .user-item {
      transition: background-color 0.2s;
      &:hover {
        background-color: var(--surface-100);
      }
    }
  `]
})
export class UsersPanelComponent implements OnInit, OnDestroy {
  @ViewChild('menu') menu!: Menu;

  private editorService = inject(EditorService);
  private authService = inject(AuthService);

  visible = false;
  users = signal<CollaborationUser[]>([]);
  currentUserEmail = signal<string>('');
  canManagePermissions = signal<boolean>(false);
  permissionsMenu: MenuItem[] = [];
  private subscriptions: Subscription[] = [];
  private selectedUser: CollaborationUser | null = null;

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

    this.initializePermissionsMenu();
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

  canManageUsers(): boolean {
    const currentUsers = this.users();
    const currentUserEmail = this.currentUserEmail();
    const currentUser = currentUsers.find(u => u.email === currentUserEmail);
    return currentUser?.permissions?.canChangePermissions || false;
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
            // Determinar si el usuario actual es el creador de la sesión
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
        } else {
          const existingUserIndex = currentUsers.findIndex(u => u.email === userEmail);
          const isUserCreator = update.data.isCreator;

          const userPermissions = isUserCreator ? {
            canEdit: true,
            canInvite: true,
            canChangePermissions: true,
            canRemoveUsers: true
          } : permissions;

          if (existingUserIndex >= 0) {
            const updatedUsers = [...currentUsers];
            updatedUsers[existingUserIndex] = {
              ...updatedUsers[existingUserIndex],
              isActive: true,
              permissions: userPermissions,
              lastActivity: Date.now(),
              isCreator: isUserCreator
            };
            this.users.set(updatedUsers);
          } else {
            this.users.set([...currentUsers, {
              email: userEmail,
              isActive: true,
              permissions: userPermissions,
              lastActivity: Date.now(),
              isCreator: isUserCreator
            }]);
          }
        }

        // Si el usuario actual es el creador, actualizar sus permisos
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

        // Actualizar permisos del usuario actual si es el afectado
        if (userEmail === this.currentUserEmail()) {
          this.checkCurrentUserPermissions();
        }
        break;
      }
    }

    console.log('[UsersPanelComponent] Updated users list:', this.users());
  }

  private initializePermissionsMenu(): void {
    const permissionLabels: Record<PermissionKey, string> = {
      canEdit: 'Permitir edición',
      canInvite: 'Permitir invitar',
      canChangePermissions: 'Permitir gestionar permisos',
      canRemoveUsers: 'Permitir eliminar usuarios'
    };

    this.permissionsMenu = [{
      label: 'Permisos',
      items: Object.entries(permissionLabels).map(([key, label]) => ({
        label,
        icon: 'pi pi-check',
        command: () => this.togglePermission(key as PermissionKey)
      }))
    }];
  }

  showPermissionsMenu(event: Event, user: CollaborationUser): void {
    console.log('[UsersPanelComponent] Showing permissions menu for user:', user.email);
    event.preventDefault();
    event.stopPropagation();

    this.selectedUser = user;
    this.updateMenuItemStates(user);

    if (this.menu) {
      this.menu.toggle(event);
    }
  }

  private updateMenuItemStates(user: CollaborationUser): void {
    if (!this.permissionsMenu[0].items) return;

    this.permissionsMenu[0].items = this.permissionsMenu[0].items.map(item => ({
      ...item,
      icon: this.getPermissionIcon(user, item.command?.toString() || '')
    }));
  }

  private getPermissionIcon(user: CollaborationUser, commandString: string): string {
    const permissionKey = this.extractPermissionKey(commandString);
    if (!permissionKey || !user.permissions) return 'pi pi-question';

    return user.permissions[permissionKey] ? 'pi pi-check' : 'pi pi-times';
  }

  private extractPermissionKey(commandString: string): PermissionKey | null {
    const match = commandString.match(/togglePermission\('(\w+)'\)/);
    return match ? match[1] as PermissionKey : null;
  }

  private async togglePermission(permission: PermissionKey): Promise<void> {
    if (!this.selectedUser) {
      console.error('[UsersPanelComponent] No user selected for permission update');
      return;
    }

    console.log('[UsersPanelComponent] Starting permission toggle:', {
      user: this.selectedUser.email,
      permission: permission,
      currentValue: this.selectedUser.permissions[permission]
    });

    // Crear una copia de los permisos actuales
    const newPermissions = {
      ...this.selectedUser.permissions,
      [permission]: !this.selectedUser.permissions[permission]
    };

    console.log('[UsersPanelComponent] New permissions to be set:', newPermissions);

    try {
      await this.editorService.updateUserPermissions(
        this.selectedUser.email,
        newPermissions
      );

      console.log('[UsersPanelComponent] Permission update successful');

      // Actualizar la UI solo después de que la actualización sea exitosa
      this.selectedUser.permissions = newPermissions;
      this.updateMenuItemStates(this.selectedUser);
    } catch (error) {
      console.error('[UsersPanelComponent] Error updating permissions:', error);
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
