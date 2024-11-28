export interface Materia {
  id:          number;
  nombre:      string;
  descripcion: string;
  usuario:     Usuario;
}

export interface Usuario {
  id: number;
}
