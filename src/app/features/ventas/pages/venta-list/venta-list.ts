import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PaginaResponse } from '../../../../core/models/pagina-response';
import { mensajeError } from '../../../../core/utils/http-error';
import { Cliente } from '../../../clientes/models/cliente.model';
import { ClienteService } from '../../../clientes/services/cliente-service';
import { EstadoVenta, FiltroVentas, Venta } from '../../models/venta.model';
import { VentaService } from '../../services/venta-service';

@Component({
  selector: 'app-venta-list',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe, CommonModule],
  templateUrl: './venta-list.html',
  styleUrl: './venta-list.css',
})
export class VentaList implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly ventaService = inject(VentaService);
  private readonly clienteService = inject(ClienteService);

  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly resultado = signal<PaginaResponse<Venta> | null>(null);
  protected readonly pagina = signal(0);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly filtros = this.fb.group({
    clienteId: this.fb.control<number | null>(null),
    estado: this.fb.control<EstadoVenta | null>(null),
    desde: this.fb.control<string | null>(null),
    hasta: this.fb.control<string | null>(null),
  });

  protected readonly ahora = signal(new Date());

  /** Suma de los totales de la página mostrada (solo ventas REGISTRADAS). */
  protected readonly totalPagina = computed(() =>
    (this.resultado()?.contenido ?? [])
      .filter((v) => v.estado === 'REGISTRADA')
      .reduce((suma, v) => suma + v.total, 0),
  );

  /** Texto con los filtros aplicados, para el encabezado impreso. */
  protected resumenFiltros(): string {
    const f = this.filtros.getRawValue();
    const clientesArr = Array.isArray(this.clientes()) ? this.clientes() : [];
    const cliente = clientesArr.find((c) => c.id === f.clienteId);
    const partes = [
      cliente ? `cliente: ${cliente.apellidos}, ${cliente.nombres}` : '',
      f.estado ? `estado: ${f.estado}` : '',
      f.desde ? `desde: ${f.desde}` : '',
      f.hasta ? `hasta: ${f.hasta}` : '',
    ].filter(Boolean);
    return partes.length ? partes.join(', ') : 'ninguno (todas las ventas)';
  }

  imprimirConsulta(): void {
    this.ahora.set(new Date());
    setTimeout(() => window.print());
  }

  ngOnInit(): void {
    this.clienteService.listar(0, 100).subscribe({
      next: (p: any) => {
        const raw = p?.contenido ?? p?.content ?? p ?? [];
        const listaClientes = Array.isArray(raw) ? raw : (raw.contenido ?? raw.content ?? []);
        this.clientes.set(Array.isArray(listaClientes) ? listaClientes : []);
      },
      error: (err: HttpErrorResponse) => this.error.set(mensajeError(err)),
    });
    this.cargar();
  }

  buscar(): void {
    const { desde, hasta } = this.filtros.getRawValue();
    if (desde && hasta && desde > hasta) {
      this.error.set('La fecha «desde» no puede ser posterior a la fecha «hasta».');
      return;
    }
    this.pagina.set(0);
    this.cargar();
  }

  limpiar(): void {
    this.filtros.reset();
    this.buscar();
  }

  irA(pagina: number): void {
    this.pagina.set(pagina);
    this.cargar();
  }

  private cargar(): void {
    const filtro: FiltroVentas = this.filtros.getRawValue();
    this.cargando.set(true);
    this.error.set(null);

    this.ventaService.buscar(filtro, this.pagina(), 10).subscribe({
      next: (r: any) => {
        const paginaActual = r.pagina ?? r.page ?? r.number ?? 0;
        const totalPaginasVal = r.totalPaginas ?? r.totalPages ?? 1;
        const totalElementosVal =
          r.totalElementos ?? r.totalElements ?? (r.contenido ?? r.content ?? []).length;
        const contenidoVal = r.contenido ?? r.content ?? (Array.isArray(r) ? r : []);
        const ultimaVal = r.ultima ?? r.last ?? paginaActual >= totalPaginasVal - 1;

        const respuestaNormalizada: PaginaResponse<Venta> = {
          contenido: contenidoVal,
          pagina: paginaActual,
          tamanio: r.tamanio ?? r.size ?? 10,
          totalElementos: totalElementosVal,
          totalPaginas: totalPaginasVal,
          ultima: ultimaVal,
        };

        this.resultado.set(respuestaNormalizada);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeError(err));
        this.cargando.set(false);
      },
    });
  }
}
