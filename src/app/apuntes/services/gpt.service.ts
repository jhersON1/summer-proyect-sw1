import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
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

    return this.http.post(`${this.apiUrl}/gpt/mind-map`,
      { prompt },
      {
        headers,
        responseType: 'text' // Especificar que esperamos texto plano
      }
    );
  }
}
