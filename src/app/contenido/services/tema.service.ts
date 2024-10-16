import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Tema } from '../interfaces/tema.interface';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SubtemasResponse } from '../interfaces/subtemas-response.interface';

@Injectable({providedIn: 'root'})
export class TemaService {
  private readonly apiUrl: string = environment.apiUrl;
  private http = inject(HttpClient);

  constructor() { }

  getMateriaContentById(id: number): Observable<Tema[]> {
    const url = `${this.apiUrl}/tema/temas-raices/${id}`;

    const token = localStorage.getItem('token');
    if (!token) return of([]);

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);

    return this.http.get<Tema[]>(url, { headers });
  }

  getTemaContentById(id: number): Observable<SubtemasResponse> {
    const url = `${this.apiUrl}/tema/subtemas/${id}`;

    const token = localStorage.getItem('token');
    //if (!token) return of(null);

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);

    return this.http.get<SubtemasResponse>(url, { headers });
  }
}
