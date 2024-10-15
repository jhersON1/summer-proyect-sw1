export interface CreateMateriaResponse {
  nombre:      string;
  descripcion: string;
  usuario:     Usuario;
  id:          number;
}

export interface Usuario {
  id:       number;
  nombre:   string;
  apellido: string;
  email:    string;
  password: string;
  telefono: string;
}
