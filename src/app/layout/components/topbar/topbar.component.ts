import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent implements OnInit {
  items: MenuItem[] | undefined;

  constructor(
    private router: Router,
    private authService: AuthService,
  ){}

    ngOnInit() {
        this.items = [
            {
                label: 'Options',
                items: [
                    {
                        label: 'Cerrar Sesion',
                        icon: 'pi pi-logout',
                        command: () => {
                          this.authService.logout()
                          this.router.navigate(['/auth/login']);
                        },
                    },
                ]
            }
        ];
    }
}
