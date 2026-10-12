import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { mensajeError } from '../../../../core/utils/http-error';
import { Cliente } from '../../../clientes/models/cliente.model';
import { ClienteService } from '../../../clientes/services/cliente-service';
import { Venta } from '../../models/venta.model';
import { VentaService } from '../../services/venta-service';

@Component({
  selector: 'app-venta-detalle',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, CommonModule],
  templateUrl: './venta-detalle.html',
  styleUrl: './venta-detalle.css',
})
export class VentaDetalle implements OnInit {
  private readonly ventaService = inject(VentaService);
  private readonly clienteService = inject(ClienteService);
  private readonly route = inject(ActivatedRoute);

  protected readonly id = signal<string | null>(null);
  protected readonly nueva = signal<string | null>(null);
  protected readonly imprimir = signal<string | null>(null);

  protected readonly venta = signal<Venta | null>(null);
  protected readonly cliente = signal<Cliente | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly fechaImpresion = new Date();

  protected readonly numero = computed(() =>
    String(this.venta()?.id ?? '').padStart(6, '0')
  );

  protected readonly unidades = computed(() =>
    (this.venta()?.detalles ?? []).reduce((suma, d) => suma + d.cantidad, 0)
  );

  ngOnInit(): void {
    // Capturamos los parámetros de la ruta y los queryParams de forma segura
    this.route.paramMap.subscribe(params => {
      const ventaId = params.get('id');
      this.id.set(ventaId);

      this.route.queryParamMap.subscribe(queryParams => {
        this.nueva.set(queryParams.get('nueva'));
        this.imprimir.set(queryParams.get('imprimir'));

        if (ventaId) {
          this.cargarVenta(Number(ventaId));
        }
      });
    });
  }

  private cargarVenta(idVenta: number): void {
    this.ventaService
      .obtener(idVenta)
      .pipe(
        switchMap((venta) =>
          this.clienteService.obtener(venta.clienteId).pipe(
            catchError(() => of(null)),
            map((cliente) => ({ venta, cliente }))
          )
        )
      )
      .subscribe({
        next: ({ venta, cliente }) => {
          this.venta.set(venta);
          this.cliente.set(cliente);
          if (this.imprimir()) {
            setTimeout(() => window.print(), 300);
          }
        },
        error: (err: HttpErrorResponse) => this.error.set(mensajeError(err)),
      });
  }

  imprimirComprobante(): void {
    window.print();
  }
}
