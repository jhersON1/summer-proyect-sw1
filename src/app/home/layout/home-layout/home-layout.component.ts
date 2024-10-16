import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-home-layout',
  templateUrl: './home-layout.component.html',
  styleUrl: './home-layout.component.scss'
})
export class HomeLayoutComponent implements OnInit{
  activeItem: MenuItem | undefined;
  tabItems: MenuItem[] = [];

  constructor(private router: Router){}

  ngOnInit(): void {
    this.tabItems = [
      {
        label: 'Materias',
        icon: 'pi pi-home',
        command: () =>{
          this.router.navigate(['/app/materias'])
        }
      },
      {
        label: 'Compartido',
        icon: 'pi pi-palette',
        command: () => {
          this.router.navigate(['/app/compartido']);
        },
      },
    ];

    this.activeItem = this.tabItems[0];
  }
}
