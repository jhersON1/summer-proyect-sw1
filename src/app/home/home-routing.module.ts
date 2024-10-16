import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeLayoutComponent } from './layout/home-layout/home-layout.component';
import { MateriasPageComponent } from './pages/materias-page/materias-page.component';
import { CompartidosPageComponent } from './pages/compartidos-page/compartidos-page.component';

const routes: Routes = [
  { path: '',
    redirectTo: 'materias', pathMatch: 'full'
  }, // Redirect to /app/materia
  {
    path:'',
    component: HomeLayoutComponent,
    children:[
      {
        path: 'materias',
        component: MateriasPageComponent,
        // children:[
        //   {
        //     path: ':id',
        //     loadChildren: () => import('./temas/temas.module.ts').then(m => m.TemasModule),
        //   }
        // ]
      },
      {
        path: 'compartido',
        component: CompartidosPageComponent
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
