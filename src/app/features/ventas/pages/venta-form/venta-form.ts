import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormArray, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { VentaService } from '../../services/venta.service';
import { ClienteService } from '../../../clientes/services/cliente-service';
import { ProductoService } from '../../../productos/services/producto-service';

@Component({
  selector: 'app-venta-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './venta-form.html',
  styleUrl: './venta-form.css',
})
export class VentaForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly ventaService = inject(VentaService);
  private readonly clienteService = inject(ClienteService);
  private readonly productoService = inject(ProductoService);
  private readonly router = inject(Router);

  protected readonly clientes = signal<any[]>([]);
  protected readonly productos = signal<any[]>([]);
  protected readonly resumenVisible = signal(false);
  protected readonly procesando = signal(false);
  protected readonly errorMensaje = signal<string | null>(null);

  protected readonly form = this.fb.group({
    clienteId: [0, [Validators.required, Validators.min(1)]],
    imprimirAlRegistrar: [true],
    detalles: this.fb.array([]),
  });

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales(): void {
    this.clienteService.listar().subscribe({
      next: (res: any) => {
        // Maneja tanto si es un arreglo directo como si viene paginado (.content)
        const listaClientes = Array.isArray(res) ? res : res?.content || [];
        this.clientes.set(listaClientes);
      },
      error: () => this.clientes.set([]),
    });

    this.productoService.listar().subscribe({
      next: (res: any) => {
        const listaProductos = Array.isArray(res) ? res : res?.content || [];
        // Filtrar solo productos con stock mayor a 0
        const conStock = listaProductos.filter((p: any) => (p.stock ?? 0) > 0);
        this.productos.set(conStock);
      },
      error: () => this.productos.set([]),
    });
  }

  get detalles(): FormArray {
    return this.form.get('detalles') as FormArray;
  }

  agregarProducto(prod: any): void {
    const stockDisponible = prod.stock ?? 10;
    const existenteIndex = this.detalles.controls.findIndex(
      (c) => c.value.productoId === prod.id
    );

    if (existenteIndex >= 0) {
      const control = this.detalles.at(existenteIndex);
      const nuevaCant = control.value.cantidad + 1;
      if (nuevaCant <= stockDisponible) {
        control.patchValue({ cantidad: nuevaCant, subtotal: nuevaCant * prod.precio });
      }
    } else {
      const item = this.fb.group({
        productoId: [prod.id],
        nombre: [prod.nombre || prod.name],
        precio: [prod.precio],
        stock: [stockDisponible],
        cantidad: [1, [Validators.required, Validators.min(1), Validators.max(stockDisponible)]],
        subtotal: [prod.precio],
      });
      this.detalles.push(item);
    }
  }

  quitarDetalle(index: number): void {
    this.detalles.removeAt(index);
  }

  calcularTotalEstimado(): number {
    return this.detalles.controls.reduce((acc, curr) => acc + (curr.value.subtotal || 0), 0);
  }

  revisarVenta(): void {
    if (this.form.invalid || this.detalles.length === 0) {
      this.form.markAllAsTouched();
      this.errorMensaje.set('Debe seleccionar un cliente y al menos un producto con stock válido.');
      return;
    }
    this.errorMensaje.set(null);
    this.resumenVisible.set(true);
  }

  confirmarVenta(): void {
    if (this.procesando()) return;
    this.procesando.set(true);

    const val = this.form.getRawValue();
    const request = {
      clienteId: Number(val.clienteId),
      detalles: val.detalles.map((d: any) => ({
        productoId: d.productoId,
        cantidad: d.cantidad,
      })),
    };

    this.ventaService.registrarVenta(request).subscribe({
      next: (res) => {
        this.procesando.set(false);
        if (val.imprimirAlRegistrar) {
          setTimeout(() => window.print(), 300);
        }
        this.router.navigate(['/ventas/detalle', res.id]);
      },
      error: (err) => {
        this.procesando.set(false);
        this.errorMensaje.set(err.error?.mensaje || 'Error al registrar la venta. Verifique el stock.');
        this.resumenVisible.set(false);
      },
    });
  }

  volver(): void {
    this.resumenVisible.set(false);
  }
}
