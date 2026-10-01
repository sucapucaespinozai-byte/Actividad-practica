import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ProductoService } from '../../services/producto-service';
import { CategoriaService } from '../../../Categorias/services/categoria-service';
import { Categoria } from '../../../Categorias/models/categoria.model';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './producto-form.html',
  styleUrls: ['./producto-form.css'],
})
export class ProductoForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productoService = inject(ProductoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  form!: FormGroup;
  categorias: Categoria[] = [];
  idEdicion: number | null = null;
  esEdicion = false;

  ngOnInit(): void {
    this.initForm();
    this.idEdicion = Number(this.route.snapshot.paramMap.get('id'));

    if (this.idEdicion) {
      this.esEdicion = true;
      forkJoin({
        categorias: this.categoriaService.listar(),
        producto: this.productoService.obtener(this.idEdicion)
      }).subscribe({
        next: ({ categorias, producto }) => {
          this.categorias = categorias;
          this.form.patchValue({
            nombre: producto.nombre,
            precio: producto.precio,
            stock: producto.stock,
            estado: producto.estado,
            categoriald: producto.categoriald
          });
        },
        error: (err) => console.error('Error al cargar datos de edición:', err)
      });
    } else {
      this.categoriaService.listar().subscribe({
        next: (data) => this.categorias = data,
        error: (err) => console.error('Error al cargar categorías:', err)
      });
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      estado: [true, Validators.required],
      categoriald: ['', Validators.required]
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto = this.form.value;

    if (this.esEdicion && this.idEdicion) {
      this.productoService.actualizar(this.idEdicion, dto).subscribe({
        next: () => this.router.navigate(['/productos']),
        error: (err) => console.error('Error al actualizar:', err)
      });
    } else {
      this.productoService.crear(dto).subscribe({
        next: () => this.router.navigate(['/productos']),
        error: (err) => console.error('Error al crear:', err)
      });
    }
  }
}