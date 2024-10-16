import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Tema } from '../../interfaces/tema.interface';
import { TemaService } from '../../services/tema.service';
import { switchMap } from 'rxjs';

@Component({
  templateUrl: './contenido-page.component.html',
  styleUrl: './contenido-page.component.scss'
})
export class ContenidoPageComponent implements OnInit{

  public temas: Tema[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private temaService: TemaService
  ) { }

  ngOnInit(): void {

    if ( !this.router.url.includes('tema') ) {
      this.activatedRoute.params
        .pipe(
          switchMap( ({ materiaId }) => this.temaService.getMateriaContentById( materiaId ) )
        ).subscribe( temas => {
          this.temas = temas;
          return;
        });
    } else {
      this.activatedRoute.params
        .pipe(
          switchMap( ({ temaId }) => {
            console.log(temaId);
            return this.temaService.getTemaContentById( temaId )
          } )
        ).subscribe( ({ subTemas }) => {
          console.log(subTemas);
          this.temas = subTemas;
          return;
        });
    }
  }
}
