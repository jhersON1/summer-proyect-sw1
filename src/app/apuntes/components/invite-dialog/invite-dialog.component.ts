import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { ValidationsService } from '../../../auth/services/validations.service';
import { UserService } from '../../services/user.service';
import { EditorService } from '../../services/editor.service';
import { debounceTime, distinctUntilChanged, filter, firstValueFrom, switchMap } from 'rxjs';
import { ApuntesCompartidosService } from '../../services/apuntes-compartidos.service';
import { NotificationService } from '../../services/notification.service';
import { InitEditableRow } from 'primeng/table';

@Component({
  selector: 'app-invite-dialog',
  templateUrl: './invite-dialog.component.html',
  providers: [MessageService]
})
export class InviteDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private validationsService = inject(ValidationsService);
  private userService = inject(UserService);
  private editorService = inject(EditorService);
  private ref = inject(DynamicDialogRef);
  private messageService = inject(MessageService);
  private apuntesCompartidosService: ApuntesCompartidosService = inject(ApuntesCompartidosService);
  private notificationService: NotificationService = inject(NotificationService);

  invitationForm!: FormGroup;
  showUrlSection = false;
  collaborationUrl = '';
  verifiedEmails: Set<string> = new Set();
  isProcessing = false;

  constructor() {
    console.log('[InviteDialog] Constructor initialized');
  }

  ngOnInit() {
    console.log('[InviteDialog] Initializing component');
    this.setupForm();
    this.setupEmailValidation();
  }

  private setupForm() {
    console.log('[InviteDialog] Setting up form');
    this.invitationForm = this.fb.group({
      invitations: this.fb.array([]),
      allowEditing: [{ value: true, disabled: false }],
      allowInviting: [{ value: false, disabled: false }],
      allowDeleting: [{ value: false, disabled: false }]
    });
    this.addInvitation();
  }

  private createEmailGroup() {
    return this.fb.group({
      email: ['', [
        Validators.required,
        Validators.pattern(this.validationsService.emailPattern)
      ]]
    });
  }

  private setupEmailValidation() {
    const invitations = this.invitations;
    invitations.controls.forEach((group) => {
      const emailControl = group.get('email');
      emailControl?.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        filter(email => {
          if (!email) return false;
          const emailRegex = new RegExp(this.validationsService.emailPattern);
          return emailRegex.test(email);
        }),
        switchMap(email => this.userService.checkUserEmail(email))
      ).subscribe({
        next: (response) => {
          console.log('[InviteDialog] Email verified:', response.email);
          this.verifiedEmails.add(response.email);
          this.messageService.add({
            severity: 'success',
            summary: 'Usuario encontrado',
            detail: `${response.nombre} ${response.apellido}`
          });
        },
        error: (error) => {
          console.error('[InviteDialog] Email verification error:', error);
          emailControl?.setErrors({ notRegistered: true });
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error
          });
        }
      });
    });
  }

  get invitations() {
    return this.invitationForm.get('invitations') as FormArray;
  }

  addInvitation() {
    console.log('[InviteDialog] Adding new invitation field');
    const emailGroup = this.createEmailGroup();
    this.invitations.push(emailGroup);
    this.setupEmailValidation();
  }

  removeInvitation(index: number) {
    console.log('[InviteDialog] Removing invitation at index:', index);
    const emailToRemove = this.invitations.at(index).get('email')?.value;
    this.verifiedEmails.delete(emailToRemove);
    this.invitations.removeAt(index);
  }

  async onSubmit() {
    console.log('[InviteDialog] Form submitted');
    if (this.invitationForm.invalid) {
      console.log('[InviteDialog] Form is invalid');
      this.invitationForm.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor, revisa los campos del formulario'
      });
      return;
    }

    const allEmailsVerified = this.invitations.controls.every(control =>
      this.verifiedEmails.has(control.get('email')?.value)
    );

    if (!allEmailsVerified) {
      console.log('[InviteDialog] Not all emails are verified');
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Todos los emails deben ser verificados'
      });
      return;
    }

    this.isProcessing = true;
    this.disableForm();

    try {
      // Obtener lista de emails invitados
      const invitedEmails = this.invitations.controls.map(control =>
        control.get('email')?.value
      );

      console.log('[InviteDialog] Getting current editor content');
      const currentContent = await this.editorService.getCurrentContent();
      console.log('[InviteDialog] Current content:', currentContent);

      // Iniciar sesión colaborativa con el contenido actual
      const sessionId = await this.editorService.initializeCollaborativeSession(
        invitedEmails,
        currentContent
      );
      console.log('[InviteDialog] Collaborative session initialized:', sessionId);

      // Construir URL colaborativa con el ID de sesión
      const baseUrl = window.location.href.split('?')[0];
      this.collaborationUrl = `${baseUrl}?sessionId=${sessionId}`;

      // Guardar los apuntes compartidos
      for (const email of invitedEmails) {
        try {
          // Obtener el ID del usuario antes de crear el apunte compartido
          const userId = await firstValueFrom(this.userService.getUserIdByEmail(email));
          
          // Primero guardamos el apunte compartido
          await this.apuntesCompartidosService.createApunteCompartido({
            //todo: hacer método para capturar el nombre del apunte
            nombre_apunte:  'Apunte Compartido',
            url: this.collaborationUrl,
            usuarioId: userId
          }).toPromise();

          // Luego intentamos enviar la notificación (no esperamos la respuesta)
          this.notificationService.sendNotification(email, this.collaborationUrl)
            .subscribe({
              error: (err) => console.warn(`No se pudo enviar notificación a ${email}:`, err)
            });

        } catch (error) {
          console.warn(`Error al guardar apunte compartido para ${email}:`, error);
          // Continuamos con el siguiente email
        }
      }

      this.showUrlSection = true;

    } catch (error) {
      console.error('[InviteDialog] Error initializing collaborative session:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo iniciar la sesión colaborativa'
      });
      this.enableForm();
    } finally {
      this.isProcessing = false;
    }
  }

  private disableForm() {
    this.invitationForm.disable();
    this.invitations.controls.forEach(control => {
      control.disable();
    });
  }

  private enableForm() {
    this.invitationForm.enable();
    this.invitations.controls.forEach(control => {
      control.enable();
    });
  }

  copyUrl() {
    console.log('[InviteDialog] Copying URL to clipboard');
    navigator.clipboard.writeText(this.collaborationUrl)
      .then(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'URL Copiada',
          detail: 'La URL ha sido copiada al portapapeles'
        });
      })
      .catch(err => {
        console.error('[InviteDialog] Error copying to clipboard:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo copiar la URL'
        });
      });
  }

  close() {
    console.log('[InviteDialog] Closing dialog');
    this.ref.close(this.showUrlSection);

    if (this.showUrlSection) {
      // Actualizar la URL sin recargar la página
      window.history.pushState({}, '', this.collaborationUrl);

      // Opcional: Recargar la página si se necesita reinicializar componentes
      // window.location.href = this.collaborationUrl;
    }
  }

  getFieldError(groupIndex: number): string | null {
    const group = this.invitations.at(groupIndex) as FormGroup;
    const emailControl = group.get('email');

    if (emailControl?.errors?.['notRegistered']) {
      return 'El usuario no está registrado en el sistema';
    }

    return this.validationsService.getFieldError(group, 'email');
  }

  fieldHasErrors(groupIndex: number): boolean {
    return this.validationsService.fieldHasErros(
      this.invitations.at(groupIndex) as FormGroup,
      'email'
    );
  }
}
