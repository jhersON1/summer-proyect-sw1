import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { TemaService } from '../services/tema.service';

export const temaExistsGuard: CanActivateFn = (route, state) => {
  const temaService = inject(TemaService);
  const router = inject(Router);

  // if (authService.authStatus() === AuthStatus.authenticated) {
  //   router.navigateByUrl('/app');
  //   return false;
  // }

  return true;
};
