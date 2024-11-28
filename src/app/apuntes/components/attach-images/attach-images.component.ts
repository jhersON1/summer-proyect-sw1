import { Component } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-attach-images',
  templateUrl: './attach-images.component.html',
  styleUrls: ['./attach-images.component.scss'],
})
export class AttachImagesComponent {
  uploadedImages: any[] = []; // Array para almacenar las imágenes seleccionadas
  errorMessage: string = ''; // Mensaje de error

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {}

  onSelect(event: any) {
    for (let file of event.files) {
      this.uploadedImages.push(file);
    }
    this.errorMessage = ''; // Limpia el mensaje de error al añadir imágenes
  }

  onClear() {
    this.ref.close({
      stopProcessing: true, // Indica que se debe detener el proceso
    });
  }

  confirmSelection() {
    if (this.uploadedImages.length === 0) {
      this.errorMessage =
        'Por favor, adjunta al menos una imagen antes de confirmar.';
      return;
    }

    this.ref.close({
      images: this.uploadedImages,
    });
  }
}
