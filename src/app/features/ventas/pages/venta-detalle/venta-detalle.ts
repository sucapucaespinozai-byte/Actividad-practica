import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { VentaService } from '../../services/venta.service';
import { VentaResponse } from '../../models/venta.model';

@Component({
  selector: 'app-venta-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './venta-detalle.html',
  styleUrl: './venta-detalle.css',
})
export class VentaDetalle implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly ventaService = inject(VentaService);

  protected readonly venta = signal<VentaResponse | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.ventaService.obtenerPorId(id).subscribe({
        next: (res) => this.venta.set(res),
        error: () => {},
      });
    }
  }

  imprimir(): void {
    window.print();
  }
}
