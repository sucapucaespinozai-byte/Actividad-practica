import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ClienteService } from '../../services/cliente-service';
import { ClienteRequest } from '../../models/cliente.model';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './cliente-form.html',
  styleUrl: './cliente-form.css',
})
export class ClienteForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly clienteService = inject(ClienteService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  form: FormGroup = this.fb.group({
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    nombres: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    apellidos: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    telefono: ['', [Validators.pattern(/^\d{9}$/)]],
    direccion: ['', [Validators.maxLength(250)]],
    estado: [true],
  });

  idCliente: number | null = null;
  isEdit = signal<boolean>(false);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.idCliente = Number(idParam);
      this.isEdit.set(true);
      this.clienteService.obtener(this.idCliente).subscribe({
        next: (cliente) => {
          this.form.patchValue({
            dni: cliente.dni,
            nombres: cliente.nombres,
            apellidos: cliente.apellidos,
            email: cliente.email,
            telefono: cliente.telefono || '',
            direccion: cliente.direccion || '',
            estado: cliente.estado,
          });
        },
        error: (err) => console.error('Error al cargar cliente para editar', err),
      });
    }
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;

    // Conversión clave: campos opcionales vacíos se envían como null (evita error 400)
    const requestDto: ClienteRequest = {
      dni: val.dni,
      nombres: val.nombres,
      apellidos: val.apellidos,
      email: val.email,
      telefono: val.telefono?.trim() || null,
      direccion: val.direccion?.trim() || null,
      estado: val.estado,
    };

    if (this.isEdit() && this.idCliente !== null) {
      this.clienteService.actualizar(this.idCliente, requestDto).subscribe({
        next: () => {
          this.router.navigate(['/clientes']);
        },
        error: (err) => {
          const mensaje = err.error?.message || 'Error al actualizar el cliente';
          alert(mensaje);
        },
      });
    } else {
      this.clienteService.crear(requestDto).subscribe({
        next: () => {
          this.router.navigate(['/clientes']);
        },
        error: (err) => {
          const mensaje = err.error?.message || 'Error al registrar el cliente';
          alert(mensaje);
        },
      });
    }
  }
}
