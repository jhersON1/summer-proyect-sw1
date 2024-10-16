import { Tema } from './tema.interface';

export interface SubtemasResponse {
  id:        number;
  nombre:    string;
  subTemas:  Tema[];
  //temaPadre: null;
  // materia:   Materia;
}
