import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ImageToTextResponse } from '../components/interfaces/image-to-text-response.interface';

@Injectable({providedIn: 'root'})
export class TextFromImageService {

  private readonly apiUrl: string = environment.apiUrl;
  public readonly FILE_UPLOAD_ENDPOINT = `${this.apiUrl}/cloudinary/upload`;

  private http = inject(HttpClient);

  constructor() { }

  getTextFromImage(imageUrl: string): Observable<ImageToTextResponse> {
    const url = `${this.apiUrl}/gpt/image-to-text`;

    const token = localStorage.getItem('token');
    //if (!token) return of(null);

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);

    return this.http.post<ImageToTextResponse>(url, { image_url: imageUrl }, { headers });
  }

}
