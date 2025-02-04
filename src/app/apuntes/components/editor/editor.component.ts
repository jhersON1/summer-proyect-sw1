import {
  Component,
  Input,
  OnInit,
  ViewChild,
  inject,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuillEditorComponent } from 'ngx-quill';
import { EditorService } from '../../services/editor.service';
import { DialogService } from 'primeng/dynamicdialog';
import { InviteDialogComponent } from '../invite-dialog/invite-dialog.component';
import Quill from 'quill';
import { BehaviorSubject, Subscription } from 'rxjs';
import { EditorChange } from '../interfaces/editor.interface';
import Delta from 'quill-delta';
import { UsersPanelComponent } from '../users-panel/users-panel.component';
import { GptService } from '../../services/gpt.service';
import { MenuItem, MessageService } from 'primeng/api';
import { MindMapComponent } from '../mind-map/mind-map.component';
import { ApunteService } from '../../../contenido/services/apunte.service';
import { Apunte } from '../../../contenido/interfaces/apunte.interface';
import { AttachImagesComponent } from '../attach-images/attach-images.component';
import { VideoModalComponent } from '../video-modal/video-modal.component';
import { FileUploadEvent } from 'primeng/fileupload';
import { TextFromImageService } from '../../services/text-from-image.service';
import { HttpEvent, HttpResponse, HttpResponseBase } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AudioService } from '../../services/audio.service';
import { AudioTranscriptionResponse } from '../interfaces/audio-transcription.interfaces';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  providers: [DialogService],
})
export class EditorComponent implements OnInit, OnDestroy {
  @ViewChild(QuillEditorComponent) quillEditor!: QuillEditorComponent;
  @ViewChild('usersPanel') usersPanel!: UsersPanelComponent;

  private route = inject(ActivatedRoute);
  private editorService = inject(EditorService);
  private dialogService = inject(DialogService);
  private gptService: GptService = inject(GptService);
  private messageService = inject(MessageService);
  private apunteService = inject(ApunteService);
  private audioService = inject(AudioService);

  isProcessingAudio = false;
  public readonly AUDIO_UPLOAD_ENDPOINT = `${environment.apiUrl}/gpt/audio-to-text`;

  tamanoPapel: string = 'letter';
  tamanoItems: MenuItem[] | undefined;

  private apunteId: string | null = null;
  apunteActual: Apunte | undefined;

  // Agrega la propiedad isProcessingVideo
  isProcessingVideo: boolean = false;
  isProcessingMindMap = false;
  private subscriptions: Subscription[] = [];
  protected quillInstance!: Quill;
  isCollaborativeMode = false;
  isProcessingRemoteChange = false;
  initialized = false;
  private pendingInitialContent: any = null;

  private apunteReady$ = new BehaviorSubject<boolean>(false);

  ngOnInit(): void {
    this.apunteId = this.route.snapshot.paramMap.get('apunteId');
    if (this.apunteId) {
      this.subscriptions.push(
        this.apunteService.getApunteById(Number(this.apunteId)).subscribe({
          next: (apunte: Apunte) => {
            console.log('[EditorComponent] Received apunte:', apunte);
            this.apunteActual = apunte;

            // Sincronizar el apunte con el servicio para que esté disponible en saveContent
            this.editorService.setApunte(apunte);

            // Marcar como listo para aplicar en Quill
            this.apunteReady$.next(true);
          },
          error: (error) => {
            console.error('[EditorComponent] Error fetching apunte:', error);
          },
        })
      );
    }

    console.log(
      '[EditorComponent] Initializing... with apunteId:',
      this.apunteId
    );

    // Suscribirse a cambios del editor
    this.subscriptions.push(
      this.editorService.getChanges().subscribe({
        next: (change: EditorChange) => {
          console.log('[EditorComponent] Received change:', change);
          if (this.quillInstance && !this.isProcessingRemoteChange) {
            console.log('[EditorComponent] Applying remote change');
            this.isProcessingRemoteChange = true;
            this.quillInstance.updateContents(change.delta as any);
            this.isProcessingRemoteChange = false;
          }
        },
        error: (error) => {
          console.error('[EditorComponent] Error receiving changes:', error);
        },
      })
    );

    // Suscribirse a contenido inicial
    this.subscriptions.push(
      this.editorService.getInitialContent().subscribe((content) => {
        console.log(
          '[EditorComponent] Received initial content from service:',
          content
        );
        if (this.quillInstance) {
          console.log('[EditorComponent] Applying initial content immediately');
          this.applyInitialContent(content);
        } else {
          console.log('[EditorComponent] Storing initial content for later');
          this.pendingInitialContent = content;
        }
      })
    );

    // Verificar sessionId en URL
    this.route.queryParams.subscribe((params) => {
      if (params['sessionId']) {
        console.log(
          '[EditorComponent] Session ID in URL - activating collaborative mode'
        );
        this.isCollaborativeMode = true;
      }
    });

    this.tamanoItems = [
      {
        label: 'Carta',
        command: () => this.cambiarTamanoPapel('letter')
      },
      {
        label: 'Oficio',
        command: () => this.cambiarTamanoPapel('oficio')
      },
      {
        label: 'Tabloide',
        command: () => this.cambiarTamanoPapel('tabloid')
      },
      {
        label: 'A4',
        command: () => this.cambiarTamanoPapel('a4')
      },
      {
        label: 'A5',
        command: () => this.cambiarTamanoPapel('a5')
      },
      {
        label: 'Infinito',
        command: () => this.cambiarTamanoPapel('infinito')
      }
    ]
  }

  cambiarTamanoPapel(tamano: string) {
    this.tamanoPapel = tamano;
  }


  async created(quill: Quill) {
    console.log('[EditorComponent] Quill Editor Created');
    this.quillInstance = quill;

    // Esperar hasta que el apunte esté listo antes de aplicar contenido
    this.subscriptions.push(
      this.apunteReady$.subscribe((isReady) => {
        if (isReady && this.apunteActual) {
          console.log('[EditorComponent] Applying apunte content to Quill');
          this.quillInstance.setContents(this.apunteActual.contenido || {});
          this.editorService.setCurrentContent(
            this.quillInstance.getContents()
          );
          this.apunteReady$.next(false); // Resetear para evitar re-aplicar contenido
        }
      })
    );

    if (this.pendingInitialContent) {
      console.log('[EditorComponent] Applying pending initial content');
      this.applyInitialContent(this.pendingInitialContent);
      this.pendingInitialContent = null;
    }

    this.editorService.startAutoSave(this.apunteActual!);
    this.initialized = true;
  }

  private applyInitialContent(content: any) {
    if (!this.quillInstance) {
      console.error(
        '[EditorComponent] Cannot apply content - editor not initialized'
      );
      return;
    }

    console.log('[EditorComponent] Applying initial content:', content);
    this.isProcessingRemoteChange = true;
    try {
      // Asegurarse de que el contenido sea un Delta válido
      const delta = new Delta(content.ops);
      this.quillInstance.setContents(delta, 'silent');
      this.editorService.setCurrentContent(delta);
      console.log('[EditorComponent] Initial content applied successfully');
    } catch (error) {
      console.error('[EditorComponent] Error applying initial content:', error);
    }
    this.isProcessingRemoteChange = false;
  }

  changedContent(event: any) {
    if (!event?.delta || this.isProcessingRemoteChange) {
      console.log(
        '[EditorComponent] Ignoring change event - processing remote change or no delta'
      );
      return;
    }

    console.log('[EditorComponent] Content changed event:', event);

    if (this.quillInstance) {
      // Obtener el contenido completo actualizado
      const currentContents = this.quillInstance.getContents();
      console.log(
        '[EditorComponent] Current editor contents:',
        currentContents
      );

      // Actualizar contenido en el servicio
      this.editorService.setCurrentContent(currentContents);

      if (this.isCollaborativeMode) {
        console.log('[EditorComponent] Sending collaborative change');
        // Enviar tanto el delta como el contenido completo
        this.editorService.sendChanges({
          delta: event.delta,
          contents: currentContents,
        });
      }
    }
  }

  async showInviteDialog() {
    console.log('[EditorComponent] Opening invite dialog');
    if (!this.quillInstance) {
      console.error('[EditorComponent] Quill instance not initialized');
      return;
    }

    // Obtener el contenido actual antes de abrir el diálogo
    const currentContents = this.quillInstance.getContents();
    console.log(
      '[EditorComponent] Current contents before opening dialog:',
      currentContents
    );
    this.editorService.setCurrentContent(currentContents);

    const ref = this.dialogService.open(InviteDialogComponent, {
      header: 'Invitar Colaboradores',
      width: '50%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
    });

    ref.onClose.subscribe((result) => {
      console.log('[EditorComponent] Dialog closed with result:', result);
      if (result) {
        this.isCollaborativeMode = true;
      }
    });
  }

  toggleUsersPanel(): void {
    console.log('[EditorComponent] Toggling users panel');
    if (this.usersPanel) {
      this.usersPanel.toggle();
    }
  }

  /*
   * Método para generar un mapa mental a partir del contenido del editor
   */

  async generateMindMap() {
    console.log('[EditorComponent] Starting mind map generation');

    if (!this.quillInstance) {
      console.error('[EditorComponent] Quill instance not initialized');
      return;
    }

    try {
      this.isProcessingMindMap = true;
      const content = this.quillInstance.getText();
      console.log('[EditorComponent] Current editor content:', content);

      if (!content.trim()) {
        console.warn('[EditorComponent] No content to analyze');
        this.messageService.add({
          severity: 'warn',
          detail: 'No hay contenido para analizar',
        });
        return;
      }

      this.gptService.generateMindMap(content).subscribe({
        next: (response: string) => {
          console.log('[EditorComponent] Mind map generated successfully');
          console.log('[EditorComponent] Mermaid code:', response);

          // Aquí podrías mostrar el mapa mental en un diálogo o en otra parte de la UI
          this.messageService.add({
            severity: 'success',
            detail: 'Mapa mental generado correctamente',
          });

          // Si quieres mostrar el mapa mental en un diálogo, podrías usar:
          this.showMindMapDialog(response);
        },
        error: (error) => {
          console.error('[EditorComponent] Error generating mind map:', error);
          let errorMessage = 'Error al generar el mapa mental';

          if (error.status === 201 && error.error.text) {
            // Si recibimos un 201 con texto, podría ser una respuesta válida
            console.log(
              '[EditorComponent] Received text response:',
              error.error.text
            );
            this.showMindMapDialog(error.error.text);
            return;
          }

          this.messageService.add({
            severity: 'error',
            detail: errorMessage,
          });
        },
        complete: () => {
          this.isProcessingMindMap = false;
          console.log(
            '[EditorComponent] Mind map generation process completed'
          );
        },
      });
    } catch (error) {
      console.error(
        '[EditorComponent] Unexpected error in generateMindMap:',
        error
      );
      this.isProcessingMindMap = false;
      this.messageService.add({
        severity: 'error',
        detail: 'Error inesperado al procesar el contenido',
      });
    }
  }

  private showMindMapDialog(mermaidCode: string) {
    console.log('[EditorComponent] Opening mindmap dialog');

    const ref = this.dialogService.open(MindMapComponent, {
      header: 'Mapa Mental',
      width: '90%',
      height: '90%',
      maximizable: true,
      contentStyle: { overflow: 'hidden' }, // Importante para el renderizado
      baseZIndex: 10000,
      data: {
        mermaidCode,
      },
    });

    ref.onClose.subscribe(() => {
      console.log('[EditorComponent] Mindmap dialog closed');
    });
  }

  async generateVideo() {
    console.log('[EditorComponent] Starting video generation');

    if (!this.quillInstance) {
      console.error('[EditorComponent] Quill instance not initialized');
      this.messageService.add({
        severity: 'error',
        detail: 'El editor no está listo para generar el video',
      });
      return;
    }

    const content = this.quillInstance.getText();
    if (!content.trim()) {
      this.messageService.add({
        severity: 'warn',
        detail: 'No hay contenido para generar el video',
      });
      return;
    }

    this.isProcessingVideo = true; // Activa el estado de carga

    const ref = this.dialogService.open(AttachImagesComponent, {
      header: 'Adjuntar Imágenes',
      width: '50%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      data: { content },
    });

    // Escuchar cuando el modal se cierra, ya sea por Confirmar o por el botón "X"
    ref.onClose.subscribe((result) => {
      if (!result || result?.stopProcessing) {
        console.log(
          '[EditorComponent] Video generation stopped by modal close.'
        );
        this.isProcessingVideo = false; // Detén cualquier estado de carga
        return;
      }

      if (result?.images?.length > 0) {
        this.gptService.uploadImagesToCloudinary(result.images).subscribe({
          next: (uploadResponse: any) => {
            const payload = {
              prompt: content,
              images: uploadResponse.images,
            };

            this.sendToTextToJson(payload);
          },
          error: (error) => {
            this.isProcessingVideo = false; // Detén el estado de carga
            this.messageService.add({
              severity: 'error',
              detail: 'Error al subir imágenes. Intenta de nuevo.',
            });
          },
        });
      } else {
        const payload = { prompt: content };
        this.sendToTextToJson(payload);
      }
    });
  }

  sendToTextToJson(payload: any) {
    console.log(
      '[EditorComponent] Sending to /gpt/text-to-json with payload:',
      payload
    );

    this.gptService.sendToTextToJson(payload).subscribe({
      next: (jsonResponse: any) => {
        console.log(
          '[EditorComponent] JSON received from /gpt/text-to-json:',
          jsonResponse
        );

        // Enviar a /shotstack con el JSON recibido
        this.sendToShotstack(jsonResponse);
      },
      error: (error) => {
        console.error('[EditorComponent] Error in /gpt/text-to-json:', error);
        this.messageService.add({
          severity: 'error',
          detail: 'Error al procesar el contenido para el video.',
        });
      },
    });
  }

  sendToShotstack(json: any) {
    console.log('[EditorComponent] Sending to /shotstack with JSON:', json);

    this.gptService.sendToShotstack(json).subscribe({
      next: async (response: any) => {
        const videoId = await response.response;

        console.log(
          '[EditorComponent] Video ID received from /shotstack:',
          videoId.id
        );

        // Consultar el estado del video con el ID recibido
        this.checkShotstackVideoStatus(videoId.id);
      },
      error: (error) => {
        this.isProcessingVideo = false;
        console.error('[EditorComponent] Error in /shotstack:', error);
        this.messageService.add({
          severity: 'error',
          detail: 'Error al generar el video.',
        });
      },
    });
  }

  checkShotstackVideoStatus(videoId: string) {
    console.log('[EditorComponent] Checking video status for ID:', videoId);

    this.gptService.getVideoUrl(videoId).subscribe({
      next: (response: any) => {
        this.isProcessingVideo = false;
        if (response?.response?.url) {
          console.log(
            '[EditorComponent] Video URL received:',
            response.response.url
          ); // Aquí se imprime la URL del video

          // Mostrar el video generado
          this.showGeneratedVideo(response.response.url);
          this.messageService.add({
            severity: 'success',
            detail: 'El video se generó correctamente.',
          });
        } else {
          console.warn('[EditorComponent] No URL found in the response.');
          this.messageService.add({
            severity: 'warn',
            detail: 'No se encontró una URL en la respuesta del servidor.',
          });
        }
      },
      error: (error) => {
        this.isProcessingVideo = false;
        console.error('[EditorComponent] Error fetching video URL:', error);
        this.messageService.add({
          severity: 'error',
          detail:
            'Error al obtener la URL del video. Por favor, intenta nuevamente.',
        });
      },
    });
  }

  showGeneratedVideo(videoUrl: string) {
    console.log('[EditorComponent] Displaying generated video:', videoUrl);

    // Mostrar el video en un modal
    const ref = this.dialogService.open(VideoModalComponent, {
      header: 'Video Generado',
      width: '70%',
      contentStyle: { overflow: 'hidden' },
      baseZIndex: 10000,
      data: {
        videoUrl: videoUrl, // Pasar la URL del video
      },
    });

    ref.onClose.subscribe((result) => {
      console.log('[EditorComponent] Video modal closed with result:', result);

      if (result?.stopProcessing) {
        console.log('[EditorComponent] Stopping video generation process.');
        this.isProcessingVideo = false; // Detén cualquier estado de carga
      }
    });
  }

  ngOnDestroy(): void {
    console.log('[EditorComponent] Destroying component');
    this.editorService.stopAutoSave(); // Detener auto-save al destruir
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private textFromImageService = inject(TextFromImageService);
  public readonly FILE_UPLOAD_ENDPOINT = this.textFromImageService.FILE_UPLOAD_ENDPOINT;

  getTextfromImage(e: FileUploadEvent) {
    const originalEvent = e.originalEvent;
    if (originalEvent instanceof HttpResponse) {
      const imageUrl = originalEvent.body.imageUrl;
      const imageId = this.getImageNameFromUrl(imageUrl);
      this.textFromImageService.getTextFromImage(imageUrl).subscribe(
        ({ content }) => {
          this.pasteTextOnEditor(content);
          //una vez obtenido el texto, eliminar la imagen de cloudinary mediante this.textFromImageService.removeImageFromCloudinary(imageId)
          this.messageService.add({ severity: 'info', summary: 'Texto obtenido desde imagen', detail: 'El texto fue copiado al final del documento' });
          return;
        });

    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo obtener el texto desde la imagen' });
    }
  }

  private pasteTextOnEditor(text: string) {
    if (!this.quillInstance) {
      console.error('[EditorComponent] Quill instance not initialized');
      return;
    }

    // Obtener la longitud actual del contenido del editor
    const editorLength = this.quillInstance.getLength();
    // Insertar un salto de línea al final del contenido
    this.quillInstance.insertText(editorLength - 1, '\n', 'user');
    // Pegar el texto después del salto de línea
    this.quillInstance.insertText(editorLength, text, 'user');
    console.log('[EditorComponent] Text pasted at the end of the document:', text);
  }

  private getImageNameFromUrl(url: string): string {
    // Extraer la parte después del último "/"
    const fileNameWithExtension = url.split('/').pop();
    if (!fileNameWithExtension) {
      throw new Error('URL no contiene un archivo válido');
    }
    // Remover la extensión del archivo
    const fileName = fileNameWithExtension.split('.').slice(0, -1).join('.'); // En caso de nombres con puntos adicionales
    return fileName;
  }


  getTextFromAudio(e: FileUploadEvent) {
    if (!this.quillInstance) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Editor no inicializado'
      });
      return;
    }
  
    this.isProcessingAudio = true;
    const audioFile = e.files[0];
    
    this.messageService.add({
      severity: 'info',
      summary: 'Transcribiendo audio',
      detail: 'Por favor espere mientras procesamos su audio...',
      sticky: true,
      life: 0
    });
    
    this.audioService.processAudio(audioFile).subscribe({
      next: (response: AudioTranscriptionResponse) => {
        const transcribedText = response.text;
        const timestamp = new Date().toLocaleString();
        const formattedText = `\n\n[Transcripción de audio - ${timestamp}]\n${transcribedText}\n`;
        
        this.pasteTextOnEditor(formattedText);
        
        // Reemplazar el mensaje de progreso con éxito
        this.messageService.clear();
        this.messageService.add({
          severity: 'success',
          summary: 'Transcripción completada',
          detail: `Se transcribieron ${response.segments.length} segmentos de audio`,
          life: 3000
        });
      },
      error: (error) => {
        this.messageService.clear();
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Error al procesar el audio',
          life: 3000
        });
      },
      complete: () => {
        this.isProcessingAudio = false;
      }
    });
  }

}
