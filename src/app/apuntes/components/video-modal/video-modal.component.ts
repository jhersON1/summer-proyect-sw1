import { Component, Input, OnInit } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-video-modal',
  templateUrl: './video-modal.component.html',
  styleUrls: ['./video-modal.component.scss'],
})
export class VideoModalComponent implements OnInit {
  videoUrl!: string; // URL del video

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {}

  ngOnInit() {
    // Asignar la URL del video desde los datos pasados al modal
    this.videoUrl = this.config.data.videoUrl;
  }

  closeModal() {
    this.ref.close({ stopProcessing: true }); // Indica al componente padre que debe detener la generación
  }

  downloadVideo() {
    if (this.videoUrl) {
      const link = document.createElement('a');
      link.href = this.videoUrl;
      link.download = 'video-generado.mp4'; // Nombre predeterminado para el archivo
      link.click();
    }
  }

  openInNewTab() {
    if (this.videoUrl) {
      window.open(this.videoUrl, '_blank');
    }
  }
}
