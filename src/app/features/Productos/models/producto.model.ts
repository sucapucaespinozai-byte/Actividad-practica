export interface Producto {
  id?: number;
  nombre: string;
  precio: number;
  stock: number;
  estado: boolean;
  categoriaId: number;
  categoriaNombre?: string;
}

export interface ProductoRequest {
  nombre: string;
  precio: number;
  stock: number;
  estado: boolean;
  categoriaId: number;
}
