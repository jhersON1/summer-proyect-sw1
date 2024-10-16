export interface Tema {
  id: number;
  nombre: string;
  subTemas?: Tema[];
}
