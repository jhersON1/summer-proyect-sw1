import { Component, computed, effect, inject } from '@angular/core';
import { AuthService } from './auth/services/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { AuthStatus } from './auth/interfaces';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontend-apuntable';

  private authService = inject(AuthService);
  private router = inject(Router);

  private lastValidUrl: string | null = null;

  constructor() {
    // Guardar la última URL válida
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.lastValidUrl = event.url;
      }
    });
  }
  
  public finishedAuthCheck = computed<boolean>(() => this.authService.authStatus() !== 'checking');

  public authStatusChangedEffect = effect(() => {
    const attemptedUrl = this.router.url;
    if (attemptedUrl === '/') return;

    switch (this.authService.authStatus()) {

      case AuthStatus.checking:
        return;

      case AuthStatus.authenticated:
        const currentUrl = this.router.url;
        if (currentUrl.startsWith('')) {
          this.router.navigateByUrl('/app').then(() => true);
        }
        return;
        //this.router.navigateByUrl('/app'); //O redireccionar a la ruta que el usuario intentaba acceder que guardamos en localStorage con item url
        return;

      case AuthStatus.notAuthenticated:
        this.router.navigateByUrl('/auth/login');
        return;
    }
  });
}
