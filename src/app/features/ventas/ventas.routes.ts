import { Routes } from '@angular/router';

export const VENTAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/venta-list/venta-list').then((m) => m.VentaList),
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./pages/venta-form/venta-form').then((m) => m.VentaForm),
  },
  {
    path: 'detalle/:id',
    loadComponent: () => import('./pages/venta-detalle/venta-detalle').then((m) => m.VentaDetalle),
  },
];
