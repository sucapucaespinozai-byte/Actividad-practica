import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PaginaResponse } from '../../../../core/models/pagina-response';
import { Producto } from '../../models/producto.model';
import { ProductoService } from '../../services/producto-service';

@Component({
  selector: 'app-producto-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './producto-list.html',
})
export class ProductoList implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly router = inject(Router);

  paginaData: PaginaResponse<Producto> | null = null;
  paginaActual = 0;
  cargando = false;

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.cargando = true;

    this.productoService.listar(this.paginaActual, 10, 'id', 'asc').subscribe({
      next: (response) => {
        this.paginaData = response;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar productos', err);
        this.cargando = false;
      },
    });
  }

  cambiarPagina(nuevaPagina: number): void {
    if (!this.paginaData || nuevaPagina < 0 || nuevaPagina >= this.paginaData.totalPaginas) {
      return;
    }

    this.paginaActual = nuevaPagina;
    this.cargarProductos();
  }

  editar(id: number): void {
    this.router.navigate(['/productos', id, 'editar']);
  }

  eliminar(id: number): void {
    if (!confirm('¿Estás seguro de eliminar este producto?')) {
      return;
    }

    this.productoService.darDeBaja(id).subscribe({
      next: () => {
        this.cargarProductos();
      },
      error: (err) => {
        console.error('Error al eliminar el producto', err);
        alert('No se pudo eliminar el producto.');
      },
    });
  }
}