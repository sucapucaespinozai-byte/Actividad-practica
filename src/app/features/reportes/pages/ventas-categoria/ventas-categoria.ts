import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { mensajeError } from '../../../../core/utils/http-error';
import { VentaPorCategoria } from '../../models/reporte.model';
import { ReporteService } from '../../services/reporte-service';

@Component({
  selector: 'app-ventas-categoria',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, CurrencyPipe, DatePipe],
  templateUrl: './ventas-categoria.html',
  styleUrl: './ventas-categoria.css',
})
export class VentasCategoria implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly reporteService = inject(ReporteService);

  protected readonly reportes = signal<VentaPorCategoria[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly filtros = this.fb.group({
    desde: this.fb.control<string | null>(null),
    hasta: this.fb.control<string | null>(null),
  });

  ngOnInit(): void {
    this.generarReporte();
  }

  generarReporte(): void {
    const { desde, hasta } = this.filtros.getRawValue();
    if (desde && hasta && desde > hasta) {
      this.error.set('La fecha «desde» no puede ser posterior a la fecha «hasta».');
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    this.reporteService.ventasPorCategoria(desde, hasta).subscribe({
      next: (data) => {
        this.reportes.set(data);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeError(err));
        this.cargando.set(false);
      },
    });
  }

  protected readonly montoMayor = computed(() => {
    const lista = this.reportes();
    if (!lista.length) return 1;
    return Math.max(...lista.map((r) => r.montoTotal));
  });

  protected readonly totalUnidades = computed(() =>
    this.reportes().reduce((suma, r) => suma + r.cantidadVendida, 0),
  );

  protected readonly totalMonto = computed(() =>
    this.reportes().reduce((suma, r) => suma + r.montoTotal, 0),
  );

  calcularPorcentaje(monto: number): number {
    const mayor = this.montoMayor();
    if (mayor === 0) return 0;
    return (monto / mayor) * 100;
  }
}
