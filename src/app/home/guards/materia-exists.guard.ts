import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { MateriaService } from '../services/materia.service';
import { catchError, map, of } from 'rxjs';

export const materiaExistsGuard: CanActivateFn = (route, state) => {
  const materiaService = inject(MateriaService);
  const router = inject(Router);
  const materiaId = +(route.paramMap.get('materiaId') ?? '');
  const location = window.history;
  if (!materiaId || typeof materiaId !== 'number' || isNaN(materiaId)) {
    //router.navigateByUrl('/app/materia');
    location.back();
    return false;
  };

  return materiaService.getMateriaById(materiaId).pipe(
    // Si el servicio devuelve un resultado, retorna true (permite la activación)
    map(materia => {
      if (!materia) {
        location.back();
        //router.navigateByUrl('/app/materia');
        return false;
      }

      return true;
    }),
    // En caso de error (como que el ID no exista), redirige y retorna false
    catchError(() => {
      location.back();
      //router.navigateByUrl('/app/materia');
      return of(false);
    })
  );
};
