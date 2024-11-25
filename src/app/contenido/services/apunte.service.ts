import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { Apunte } from '../interfaces/apunte.interface';

@Injectable({providedIn: 'root'})
export class ApunteService {
  private readonly apiUrl: string = `${environment.apiUrl}/apunte`;
  private http = inject(HttpClient);

  constructor() { }


  addApunte(apunte: Apunte): Observable<Apunte> {
    apunte.materiaId = undefined;
    const url =`${ this.apiUrl }`;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);

    return this.http.post<Apunte>(url, apunte, { headers });
  }

  updateApunte(apunte: Apunte): Observable<Apunte> {
    const url =`${ this.apiUrl }/${ apunte.id }`;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);

    if ( !apunte.id ) throw Error('Apunte id is required');

    return this.http.patch<Apunte>(url, apunte, { headers });
  }

  deleteApunteById( id: number ): Observable<boolean> {
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

  getApunteById( id: number): Observable<Apunte> {
    const url = `${ this.apiUrl }/${ id }`;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);

    return this.http.get<Apunte>(url, { headers });
  }
}
