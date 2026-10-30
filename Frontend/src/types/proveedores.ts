/**
 * Tipos del módulo de Proveedores y Compras.
 *
 * Los proveedores los sirve el microservicio Flask (`/api/proveedores`) y el
 * resto lo sirve la API C# (`AbastecimientoController`). Ambos responden en
 * snake_case y devuelven los importes como número o como cadena decimal.
 */

/** Proveedor tal como lo devuelve GET /api/proveedores. */
export interface Proveedor {
  id: number;
  nombre: string;
  contacto: string | null;
  razon_social: string | null;
  rfc: string | null;
  direccion: string | null;
  correo: string | null;
  telefono: string | null;
}

/**
 * Cuerpo que acepta el microservicio. En el alta exige que existan las siete
 * llaves (aunque su valor sea nulo), por eso ninguna es opcional.
 */
export interface ProveedorPayload {
  nombre: string;
  contacto: string | null;
  razon_social: string | null;
  rfc: string | null;
  direccion: string | null;
  correo: string | null;
  telefono: string | null;
}

/** Renglón de la orden: GET /api/compras-proveedor/{id}. */
export interface ItemOrdenCompra {
  id_detalle_compra: number;
  id_pedido: number;
  id_libro: string;
  cantidad: number;
  costo_unitario: number | string;
}

/** Cabecera de la orden: GET /api/compras-proveedor. */
export interface OrdenCompra {
  id_pedido: number;
  id_proveedor: number;
  /** Nombre del proveedor resuelto con JOIN. */
  nombre: string;
  fecha: string;
  costo_total: number | string;
  estado: string;
  fecha_recepcion: string | null;
}

/** Detalle completo: GET /api/compras-proveedor/{id}. */
export interface OrdenCompraDetalle {
  pedido: {
    id_pedido: number;
    id_proveedor: number;
    fecha: string;
    costo_total: number | string;
    estado: string;
    fecha_recepcion: string | null;
  };
  items: ItemOrdenCompra[];
}

/** Renglón que envía el formulario de nueva orden. */
export interface LineaNuevaOrden {
  /** Clave temporal para React (no se envía al backend). */
  clave: string;
  id_libro: string;
  cantidad: number;
  costo_unitario: number;
}

/** Renglón del reporte mensual. */
export interface CompraReporteLinea {
  id_pedido: number;
  fecha: string;
  estado: string;
  nombre: string;
  costo_total: number | string;
}

/** Respuesta de GET /api/compras-proveedor/reporte?mes=AAAA-MM. */
export interface ReporteCompras {
  mes: string;
  total: number | string;
  compras: CompraReporteLinea[];
}

/** Respuesta de POST /api/compras-proveedor. */
export interface OrdenCreada {
  id_pedido: number;
  total: string;
}
