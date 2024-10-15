import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { CreateMateria } from '../interfaces/create-materia.interface';
import { Observable } from 'rxjs';
import { Materia } from '../interfaces/materia.interface';
import { UpdateMateria } from '../interfaces/update-materia.interface';
import { CreateMateriaResponse } from '../interfaces/create-materia-response.interface';

@Injectable({
  providedIn: 'root'
})
export class MateriaService {
  private readonly apiUrl: string = environment.apiUrl;

  constructor(
    private http: HttpClient,
  ) { }

  addMateria(nuevaMateria: CreateMateria): Observable<CreateMateriaResponse> {
    const url = `${this.apiUrl}/materia`;
    const body = nuevaMateria;
    return this.http.post<CreateMateriaResponse>(url,body);
  }

  getMaterias(): Observable<Materia[]> {
    const url = `${this.apiUrl}/materia`;
    return this.http.get<Materia[]>(url);
  }

  getMateriaById(id: number): Observable<Materia> {
    const url = `${this.apiUrl}/materia/${id}`;
    return this.http.get<Materia>(url);
  }

  updateMateria(id: number, updatedMateria: UpdateMateria): Observable<void> {
    const url = `${this.apiUrl}/materia/${id}`;
    const body = updatedMateria;
    return this.http.put<void>(url, body);
  }

  deleteMateria(id: number): Observable<void> {
    const url = `${this.apiUrl}/materia/${id}`;
    return this.http.delete<void>(url);
  }
}
