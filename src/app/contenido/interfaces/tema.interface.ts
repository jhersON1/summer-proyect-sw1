export interface Tema {
  id: number;
  nombre: string;
  materiaId?: number;
  temaPadreId?: number;
  subTemas?: Tema[];
}
