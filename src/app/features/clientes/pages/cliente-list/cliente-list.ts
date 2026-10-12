import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Cliente } from '../../models/cliente.model';
import { ClienteService } from '../../services/cliente-service';
import { mensajeError } from '../../../../core/utils/http-error';

@Component({
  selector: 'app-cliente-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cliente-list.html',
  styleUrl: './cliente-list.css',
})
export class ClienteList implements OnInit {
  private readonly clienteService = inject(ClienteService);

  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);

  // Estado de paginación y orden
  protected readonly pagina = signal(0);
  protected readonly tamanio = signal(10);
  protected readonly ordenarPor = signal('apellidos');
  protected readonly direccion = signal<'asc' | 'desc'>('asc');

  // Datos que devuelve el backend sobre la paginación
  protected readonly totalPaginas = signal(0);
  protected readonly totalElementos = signal(0);
  protected readonly ultima = signal(true);

  protected readonly tamanios = [5, 10, 20];
  protected readonly filtro = signal('');

  /** Filtra solo la página actual, por DNI o por nombres y apellidos (sin distinguir mayúsculas). */
  protected readonly filtrados = computed(() => {
    const texto = this.filtro().trim().toLowerCase();
    if (!texto) {
      return this.clientes();
    }
    return this.clientes().filter(
      (c) =>
        c.dni.includes(texto) ||
        `${c.nombres} ${c.apellidos}`.toLowerCase().includes(texto) ||
        `${c.apellidos} ${c.nombres}`.toLowerCase().includes(texto),
    );
  });

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.clienteService
      .listar(this.pagina(), this.tamanio(), this.ordenarPor(), this.direccion())
      .subscribe({
        next: (respuesta: any) => {
          if (Array.isArray(respuesta)) {
            this.clientes.set(respuesta);
            this.totalElementos.set(respuesta.length);
            this.totalPaginas.set(1);
          } else {
            this.clientes.set(respuesta.contenido || respuesta.content || []);
            this.totalPaginas.set(respuesta.totalPaginas || respuesta.totalPages || 0);
            this.totalElementos.set(respuesta.totalElementos || respuesta.totalElements || 0);
            this.ultima.set(respuesta.ultima ?? respuesta.last ?? true);
          }
          this.cargando.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.error.set(mensajeError(err));
          this.cargando.set(false);
        },
      });
  }

  protected cambiarPagina(salto: number): void {
    this.pagina.update((p) => p + salto);
    this.cargar();
  }

  protected cambiarTamanio(valor: string): void {
    this.tamanio.set(Number(valor));
    this.pagina.set(0);
    this.cargar();
  }

  /** Primer clic: orden ascendente por el campo. Segundo clic: invierte la dirección. */
  protected ordenar(campo: string): void {
    if (this.ordenarPor() === campo) {
      this.direccion.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.ordenarPor.set(campo);
      this.direccion.set('asc');
    }
    this.cargar();
  }

  protected flecha(campo: string): string {
    if (this.ordenarPor() !== campo) {
      return '';
    }
    return this.direccion() === 'asc' ? ' ▲' : ' ▼';
  }

  /** La baja es lógica: tras el DELETE se recarga la página y la fila pasa a «Inactivo». */
  protected darDeBaja(cliente: Cliente): void {
    if (!cliente.id) return;

    if (!confirm(`¿Dar de baja al cliente "${cliente.nombres} ${cliente.apellidos}"?`)) {
      return;
    }
    this.clienteService.eliminar(cliente.id).subscribe({
      next: () => this.cargar(),
      error: (err: HttpErrorResponse) => this.error.set(mensajeError(err)),
    });
  }
}
