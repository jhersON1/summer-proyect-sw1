import { Component, computed, effect, inject } from '@angular/core';
import { AuthService } from './auth/services/auth.service';
import { Router } from '@angular/router';
import { AuthStatus } from './auth/interfaces';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontend-apuntable';

  private authService = inject(AuthService);
  private router = inject(Router);

  public finishedAuthCheck = computed<boolean>(() => this.authService.authStatus() !== 'checking');

  public authStatusChangedEffect = effect(() => {
    switch (this.authService.authStatus()) {

      case AuthStatus.checking:
        return;

      case AuthStatus.authenticated:
        this.router.navigateByUrl('/app'); //O redireccionar a la ruta que el usuario intentaba acceder que guardamos en localStorage con item url
        return;

      // case AuthStatus.notAuthenticated:
      //   this.router.navigateByUrl('/auth/login');
      //   return;
    }
  });
}
