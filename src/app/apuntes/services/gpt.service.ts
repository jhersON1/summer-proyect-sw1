import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GptService {
  private readonly apiUrl: string = environment.apiUrl;
  private http = inject(HttpClient);

  constructor() {
    console.log('[GptService] Initializing');
  }

  generateMindMap(prompt: string): Observable<any> {
    console.log('[GptService] Generating mind map for prompt:', prompt);

    // Configurar headers para esperar respuesta en texto plano
    const headers = new HttpHeaders().set('Accept', 'text/plain');

    return this.http.post(
      `${this.apiUrl}/gpt/mind-map`,
      { prompt },
      {
        headers,
        responseType: 'text', // Especificar que esperamos texto plano
      }
    );
  }

  generateVideo(content: string): Observable<any> {
    console.log('[GptService] Generating video for content:', content);

    // Configurar headers (opcional si no es necesario aceptar algo específico)
    const headers = new HttpHeaders().set('Accept', 'application/json');

    // Hacer la solicitud POST al endpoint de generación de video
    return this.http.post(`${this.apiUrl}/gpt/video`, { content }, { headers });
  }

  getVideoUrl(videoId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/shotstack/${videoId}`);
  }

  sendToTextToJson(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/gpt/text-to-json`, payload);
  }

  sendToShotstack(json: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/shotstack`, json);
  }

  uploadImagesToCloudinary(images: File[]): Observable<any> {
    console.log('[GptService] Uploading images to Cloudinary:', images);

    // Crear el objeto FormData
    const formData = new FormData();

    // Agregar las imágenes bajo la clave 'files'
    images.forEach((image) => {
      formData.append('files', image); // Usa 'files' como clave para el backend
    });

    // Hacer la solicitud POST
    return this.http.post(
      `${this.apiUrl}/cloudinary/upload-multiple`,
      formData
    );
  }
}
