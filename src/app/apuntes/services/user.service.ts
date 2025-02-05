import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';

interface UserCheckResponse {
  exists: boolean;
  email: string;
  nombre: string;
  apellido: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly apiUrl: string = environment.apiUrl;
  private http = inject(HttpClient);

  checkUserEmail(email: string): Observable<UserCheckResponse> {
    console.log('[UserService] Checking email:', email);

    const token = localStorage.getItem('token');
    if (!token) {
      return throwError(() => 'No hay token de autenticación');
    }

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);

    return this.http.get<UserCheckResponse>(`${this.apiUrl}/usuarios/check-email`, {
      headers,
      params: { email }
    }).pipe(
      catchError(error => {
        console.error('[UserService] Error checking email:', error);
        if (error.status === 404) {
          return throwError(() => 'El usuario no está registrado en el sistema');
        }
        if (error.status === 401) {
          return throwError(() => 'No autorizado');
        }
        return throwError(() => 'Error al verificar el usuario');
      })
    );
  }

  getUserIdByEmail(email: string): Observable<number> {
    console.log('[UserService] Getting user ID for email:', email);
    
    const token = localStorage.getItem('token');
    if (!token) {
      return throwError(() => 'No hay token de autenticación');
    }

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);

    return this.http.get<{id: number}>(`${this.apiUrl}/usuarios/id/${email}`, { headers })
      .pipe(
        map(response => response.id),
        catchError(error => {
          console.error('[UserService] Error getting user ID:', error);
          if (error.status === 404) {
            return throwError(() => 'Usuario no encontrado');
          }
          return throwError(() => 'Error al obtener el ID del usuario');
        })
      );
  }
}
