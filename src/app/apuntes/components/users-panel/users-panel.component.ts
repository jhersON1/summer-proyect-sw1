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
  }

  private handleUserUpdate(update: CollaborationUpdate): void {
    console.log('[UsersPanelComponent] Received user update:', update);
    const currentUsers = this.users();

    switch (update.type) {
      case 'USER_JOINED': {
        const { userEmail, permissions, activeUsers } = update.data;

        // Si hay una lista de usuarios activos, actualizamos toda la lista
        if (Array.isArray(activeUsers)) {
          console.log('[UsersPanelComponent] Updating full users list:', activeUsers);
          const updatedUsers = activeUsers.map(email => ({
            email,
            isActive: true,
            permissions: email === userEmail ? permissions : this.getDefaultPermissions(),
            lastActivity: Date.now()
          }));
          this.users.set(updatedUsers);
        } else {
          // Si solo hay un nuevo usuario, lo añadimos o actualizamos
          const existingUserIndex = currentUsers.findIndex(u => u.email === userEmail);

          if (existingUserIndex >= 0) {
            const updatedUsers = [...currentUsers];
            updatedUsers[existingUserIndex] = {
              ...updatedUsers[existingUserIndex],
              isActive: true,
              permissions: permissions || updatedUsers[existingUserIndex].permissions,
              lastActivity: Date.now()
            };
            this.users.set(updatedUsers);
          } else {
            this.users.set([...currentUsers, {
              email: userEmail,
              isActive: true,
              permissions: permissions || this.getDefaultPermissions(),
              lastActivity: Date.now()
            }]);
          }
        }
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

  private togglePermission(permission: PermissionKey): void {
    if (!this.selectedUser) return;

    console.log('[UsersPanelComponent] Toggling permission:', permission, 'for user:', this.selectedUser.email);

    const newPermissions: UserPermissions = {
      ...this.selectedUser.permissions,
      [permission]: !this.selectedUser.permissions[permission]
    };

    this.editorService.updateUserPermissions(
      this.selectedUser.email,
      newPermissions
    ).catch((error: any) => {
      console.error('[UsersPanelComponent] Error updating permissions:', error);
    });
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
