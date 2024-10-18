import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { TemaService } from '../services/tema.service';
import { catchError, map, of } from 'rxjs';

export const temaExistsGuard: CanActivateFn = (route, state) => {
  const temaService = inject(TemaService);
  const router = inject(Router);
  const location = window.history;
  const materiaId = +(route.paramMap.get('materiaId') ?? '');
  //const materiaRoute = `/app/materia/${ materiaId }`; //O redirigir a una pagina de 404 not found

  const temaId = +(route.paramMap.get('temaId') ?? '');
  if (!temaId || typeof temaId !== 'number' || isNaN(temaId)) {
    location.back();
    //router.navigateByUrl(materiaRoute);
    return false;
  };

  return temaService.getTemaContentById(temaId).pipe(
    map(subtemasResponse => {
      const materia = subtemasResponse.materia;
      if (!subtemasResponse || materiaId !== materia.id) {
        location.back();
        //router.navigateByUrl(materiaRoute);
        return false;
      }

      return true;
    }),
    catchError((err) => {
      location.back();
      //router.navigateByUrl('app/materia');
      return of(false);
    })
  );

  return true;
};
