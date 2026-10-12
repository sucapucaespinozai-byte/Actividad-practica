export interface DetalleVentaRequest {
  productoId: number;
  cantidad: number;
}

export interface VentaRequest {
  clienteId: number;
  detalles: DetalleVentaRequest[];
}

export interface DetalleVentaResponse {
  id: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

export interface VentaResponse {
  id: number;
  fechaRegistro: string;
  total: number;
  estado: string;
  clienteId: number;
  clienteNombre: string;
  detalles: DetalleVentaResponse[];
}
