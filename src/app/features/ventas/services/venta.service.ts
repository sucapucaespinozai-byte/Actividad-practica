import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VentaRequest, VentaResponse } from '../models/venta.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VentaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/ventas`;

  registrarVenta(request: VentaRequest): Observable<VentaResponse> {
    return this.http.post<VentaResponse>(this.baseUrl, request);
  }

  obtenerPorId(id: number): Observable<VentaResponse> {
    return this.http.get<VentaResponse>(`${this.baseUrl}/${id}`);
  }

  buscarVentas(
    clienteId?: number | null,
    estado?: string | null,
    desde?: string | null,
    hasta?: string | null,
    pagina: number = 0,
    tamanio: number = 10,
  ): Observable<any> {
    let params = new HttpParams().set('pagina', pagina).set('tamanio', tamanio);

    if (clienteId) params = params.set('clienteId', clienteId);
    if (estado) params = params.set('estado', estado);
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);

    return this.http.get<any>(`${this.baseUrl}/buscar`, { params });
  }
}
