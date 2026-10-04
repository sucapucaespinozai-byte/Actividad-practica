import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { Inicio } from './features/inicio/inicio';
import { ClienteList } from './features/clientes/pages/cliente-list/cliente-list';
import { ClienteForm } from './features/clientes/pages/cliente-form/cliente-form';
import { ProductoList } from './features/Productos/pages/producto-list/producto-list';
import { ProductoForm } from './features/Productos/pages/producto-form/producto-form';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full',
      },
      {
        path: 'inicio',
        component: Inicio,
      },
      {
        path: 'categorias',
        loadChildren: () =>
          import('./features/Categorias/categorias.routes').then((m) => m.CATEGORIAS_ROUTES),
      },
      {
        path: 'clientes',
        children: [
          { path: '', component: ClienteList },
          { path: 'nuevo', component: ClienteForm },
          { path: ':id/editar', component: ClienteForm },
        ],
      },
      {
        path: 'productos',
        children: [
          { path: '', component: ProductoList },
          { path: 'nuevo', component: ProductoForm },
          { path: ':id/editar', component: ProductoForm },
        ],
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'inicio',
  },
];
