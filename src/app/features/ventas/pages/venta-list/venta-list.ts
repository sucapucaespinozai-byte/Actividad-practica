import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { VentaService } from '../../services/venta.service';
import { VentaResponse } from '../../models/venta.model';

@Component({
  selector: 'app-venta-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './venta-list.html',
  styleUrl: './venta-list.css',
})
export class VentaList implements OnInit {
  private readonly ventaService = inject(VentaService);
  private readonly fb = inject(FormBuilder);

  protected readonly ventas = signal<VentaResponse[]>([]);
  protected readonly cargando = signal(false);

  protected readonly filtros = this.fb.group({
    clienteId: [null as number | null],
    estado: [''],
    desde: [''],
    hasta: [''],
  });

  ngOnInit(): void {
    this.buscar();
  }

  buscar(): void {
    this.cargando.set(true);
    const val = this.filtros.getRawValue();
    this.ventaService.buscarVentas(val.clienteId, val.estado, val.desde, val.hasta).subscribe({
      next: (res) => {
        this.ventas.set(res.content || res);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  imprimirConsulta(): void {
    window.print();
  }
}
