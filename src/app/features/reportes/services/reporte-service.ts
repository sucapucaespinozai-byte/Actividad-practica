import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VentaPorCategoria } from '../models/reporte.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reportes/ventas-por-categoria`;

  ventasPorCategoria(
    desde?: string | null,
    hasta?: string | null,
  ): Observable<VentaPorCategoria[]> {
    let params = new HttpParams();
    if (desde) {
      params = params.set('desde', desde);
    }
    if (hasta) {
      params = params.set('hasta', hasta);
    }
    return this.http.get<VentaPorCategoria[]>(this.baseUrl, { params });
  }
}
