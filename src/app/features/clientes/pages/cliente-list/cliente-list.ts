import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClienteService } from '../../services/cliente-service';
import { Cliente } from '../../models/cliente.model';

@Component({
  selector: 'app-cliente-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cliente-list.html',
  styleUrl: './cliente-list.css'
})
export class ClienteList implements OnInit {
  private readonly clienteService = inject(ClienteService);

  clientes = signal<Cliente[]>([]);
  cargando = signal<boolean>(false);
  paginaActual = signal<number>(0);
  tamanio = signal<number>(10);
  totalPaginas = signal<number>(0);
  totalElementos = signal<number>(0);
  ultima = signal<boolean>(false);

  // Parámetros de ordenamiento y filtros
  ordenarPor = signal<string>('apellidos');
  direccion = signal<'asc' | 'desc'>('asc');
  filtro = signal<string>('');

  // Computed para filtrar la página actual por DNI, nombres o apellidos
  clientesFiltrados = computed(() => {
    const texto = this.filtro().toLowerCase().trim();
    const lista = this.clientes();
    if (!texto) return lista;

    return lista.filter(c =>
      c.dni.toLowerCase().includes(texto) ||
      c.nombres.toLowerCase().includes(texto) ||
      c.apellidos.toLowerCase().includes(texto)
    );
  });

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.cargando.set(true);
    this.clienteService.listar(
      this.paginaActual(),
      this.tamanio(),
      this.ordenarPor(),
      this.direccion()
    ).subscribe({
      next: (response) => {
        this.clientes.set(response.contenido);
        this.totalPaginas.set(response.totalPaginas);
        this.totalElementos.set(response.totalElementos);
        this.ultima.set(response.ultima);
        this.cargando.set(false);
      },
      error: (err: any) => {
        console.error('Error al cargar clientes', err);
        this.cargando.set(false);
      }
    });
  }

  ordenar(campo: string): void {
    if (this.ordenarPor() === campo) {
      this.direccion.update(dir => dir === 'asc' ? 'desc' : 'asc');
    } else {
      this.ordenarPor.set(campo);
      this.direccion.set('asc');
    }
    this.cargarClientes();
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 0 && nuevaPagina < this.totalPaginas()) {
      this.paginaActual.set(nuevaPagina);
      this.cargarClientes();
    }
  }

  cambiarTamanio(nuevoTamanio: string | number): void {
    this.tamanio.set(Number(nuevoTamanio));
    this.paginaActual.set(0); // Vuelve a la página 0 al cambiar tamaño
    this.cargarClientes();
  }

  eliminar(id: number): void {
    if (confirm('¿Estás seguro de dar de baja este cliente?')) {
      this.clienteService.eliminar(id).subscribe({
        next: () => {
          this.cargarClientes();
        },
        error: (err: any) => {
          const mensaje = err.error?.message || 'Error al dar de baja el cliente';
          alert(mensaje);
        }
      });
    }
  }
}
