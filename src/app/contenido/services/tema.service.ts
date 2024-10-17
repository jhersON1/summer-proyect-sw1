import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { Tema } from '../interfaces/tema.interface';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SubtemasResponse } from '../interfaces/subtemas-response.interface';

@Injectable({providedIn: 'root'})
export class TemaService {
  private readonly apiUrl: string = `${environment.apiUrl}/tema`;
  private http = inject(HttpClient);

  constructor() { }

  getMateriaContentById(id: number): Observable<Tema[]> {
    const url = `${this.apiUrl}/temas-raices/${id}`;

    const token = localStorage.getItem('token');
    if (!token) return of([]);

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);

    return this.http.get<Tema[]>(url, { headers });
  }

  getTemaContentById(id: number): Observable<SubtemasResponse> {
    const url = `${this.apiUrl}/subtemas/${id}`;

    const token = localStorage.getItem('token');
    //if (!token) return of(null);

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);

    return this.http.get<SubtemasResponse>(url, { headers });
  }

  addTema(tema: Tema): Observable<Tema> {
    const url =`${ this.apiUrl }`;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);

    return this.http.post<Tema>(url, tema, { headers });
  }

  updateTema(tema: Tema): Observable<Tema> {
    const url =`${ this.apiUrl }/${ tema.id }`;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);

    if ( !tema.id ) throw Error('Tema id is required');

    return this.http.patch<Tema>(url, tema, { headers });
  }

  deleteTemaById( id: number ): Observable<boolean> {
    const url = `${ this.apiUrl }/${ id }`;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);

    return this.http.delete(url, { headers })
      .pipe(
        map( resp => true ),
        catchError( err => of(false) ),
      );
  }
}
