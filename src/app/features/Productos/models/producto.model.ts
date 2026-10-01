export type Direccion = 'asc' | 'desc';
export type OrdenProducto = 'id' | 'nombre' | 'precio' | 'stock';

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  estado: boolean;
  categoriald: number;
  categoriaNombre?: string;
}

export interface ProductoRequest {
  nombre: string;
  precio: number;
  stock: number;
  estado: boolean;
  categoriald: number;
}