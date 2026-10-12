import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Producto } from '../../models/producto.model';
import { ProductoService } from '../../services/producto-service';
import { mensajeError } from '../../../../core/utils/http-error';

@Component({
  selector: 'app-producto-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './producto-list.html',
  styleUrl: './producto-list.css',
})
export class ProductoList implements OnInit {
  private readonly productoService = inject(ProductoService);

  protected readonly productos = signal<Producto[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly pagina = signal(0);
  protected readonly tamanio = signal(5);
  protected readonly totalPaginas = signal(0);
  protected readonly totalElementos = signal(0);
  protected readonly ordenarPor = signal<string>('id');
  protected readonly direccion = signal<string>('asc');

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.cargando.set(true);
    const sortParam = `${this.ordenarPor()},${this.direccion()}`;

    this.productoService.listar(this.pagina(), this.tamanio(), sortParam).subscribe({
      next: (data) => {
        this.productos.set(data);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al cargar productos', err);
        this.error.set(mensajeError(err));
        this.cargando.set(false);
      },
    });
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 0 && nuevaPagina < this.totalPaginas()) {
      this.pagina.set(nuevaPagina);
      this.cargarProductos();
    }
  }

  ordenar(campo: string): void {
    if (this.ordenarPor() === campo) {
      this.direccion.set(this.direccion() === 'asc' ? 'desc' : 'asc');
    } else {
      this.ordenarPor.set(campo);
      this.direccion.set('asc');
    }
    this.cargarProductos();
  }

  eliminar(producto: Producto): void {
    if (!producto.id) return;

    if (!confirm(`¿Eliminar el producto "${producto.nombre}"?`)) {
      return;
    }

    this.productoService.darDeBaja(producto.id).subscribe({
      next: () => this.cargarProductos(),
      error: (err: HttpErrorResponse) => this.error.set(mensajeError(err)),
    });
  }
}
