import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {
  loginItems: MenuItem[];
  constructor(public router: Router) {
    this.loginItems = [
      {
        label: 'Register',
        icon: 'pi pi-user-plus',
        command: () => {
          this.navigateToRegister();
        },
      }
    ]
  }

  navigateToLogin(){
      this.router.navigate(['auth/login'])
  }

  navigateToRegister(){
      this.router.navigate(['auth/register'])
  }
}
