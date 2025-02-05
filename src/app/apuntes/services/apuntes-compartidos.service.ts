import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

interface ApunteCompartido {
    id: number;
    nombreApunte: string;
    url: string;
    usuario: {
        id: number;
        nombre: string;
        email: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class ApuntesCompartidosService {
    private readonly apiUrl: string = `${environment.apiUrl}/apuntescompartido`;

    constructor(private http: HttpClient) { }

    createApunteCompartido(data: {
        nombre_apunte: string;
        url: string;
        usuarioId: number;
    }) {
        return this.http.post(this.apiUrl, data);
    }

    getApuntesCompartidosByEmail(email: string): Observable<ApunteCompartido[]> {
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        return this.http.get<ApunteCompartido[]>(`${this.apiUrl}/user/email/${email}`);
    }
}
