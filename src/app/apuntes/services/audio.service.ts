import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { AudioTranscriptionResponse } from '../components/interfaces/audio-transcription.interfaces';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
    private readonly apiUrl: string = `${environment.apiUrl}/gpt`;
    private http = inject(HttpClient);
  
    processAudio(audioFile: File, prompt?: string): Observable<AudioTranscriptionResponse> {
      if (!this.isValidAudioFile(audioFile)) {
        return throwError(() => new Error('Formato de audio no válido'));
      }
  
      const formData = new FormData();
      formData.append('file', audioFile);
      if (prompt) formData.append('prompt', prompt);
      
      return this.http.post<AudioTranscriptionResponse>(
        `${this.apiUrl}/audio-to-text`, 
        formData
      ).pipe(
        catchError(this.handleError)
      );
    }
  
    private isValidAudioFile(file: File): boolean {
      const validTypes = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/ogg'];
      return validTypes.includes(file.type);
    }
  
    private handleError(error: HttpErrorResponse) {
      let errorMessage = 'Error en la transcripción';
      
      if (error.error instanceof ErrorEvent) {
        errorMessage = `Error del cliente: ${error.error.message}`;
      } else {
        if (error.status === 413) {
          errorMessage = 'El archivo de audio es demasiado grande';
        } else if (error.status === 415) {
          errorMessage = 'Formato de audio no soportado';
        }
      }
  
      return throwError(() => new Error(errorMessage));
    }
}