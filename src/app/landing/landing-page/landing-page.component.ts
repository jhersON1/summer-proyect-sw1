import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {

  constructor(public router: Router) { }

  navigateToLogin(){
      this.router.navigate(['auth/login'])
  }

  navigateToRegister(){
      this.router.navigate(['auth/register'])
  }
}
