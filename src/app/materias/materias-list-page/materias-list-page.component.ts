import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-materias-list-page',
  templateUrl: './materias-list-page.component.html',
  styleUrl: './materias-list-page.component.scss'
})
export class MateriasListPageComponent implements OnInit{
  tabItems: MenuItem[] | undefined;
  activeItem : MenuItem | undefined;

  constructor(private router: Router) {}

  ngOnInit() {
      this.tabItems = [
          { label: 'Materias', icon: 'pi pi-home' },
          {
              label: 'Compartido Conmigo',
              icon: 'pi pi-palette',
              command: () => {
                  this.router.navigate(['/shared']);
              }
          },
      ];

      this.activeItem = this.tabItems[0];
  }
}
