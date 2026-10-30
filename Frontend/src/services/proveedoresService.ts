import { apiDelete, apiGet, apiPost, apiPut } from './api';
import type {
  OrdenCompra,
  OrdenCompraDetalle,
  OrdenCreada,
  Proveedor,
  ProveedorPayload,
  ReporteCompras,
} from '../types/proveedores';

/** Respuesta estándar del microservicio Flask de proveedores. */
interface RespuestaProveedores<T> {
  success: boolean;
  message?: string;
  data: T;
}

// ---------------------------------------------------------------------------
// Proveedores (microservicio Flask -> /api/proveedores)
// ---------------------------------------------------------------------------

export async function listarProveedores(token: string | null): Promise<Proveedor[]> {
  const res = await apiGet<RespuestaProveedores<Proveedor[]>>('/proveedores', undefined, token);
  return res.data ?? [];
}

export async function crearProveedor(
  datos: ProveedorPayload,
  token: string | null,
): Promise<Proveedor> {
  const res = await apiPost<RespuestaProveedores<Proveedor>>('/proveedores', datos, token);
  return res.data;
}

export async function actualizarProveedor(
  id: number,
  datos: ProveedorPayload,
  token: string | null,
): Promise<Proveedor> {
  const res = await apiPut<RespuestaProveedores<Proveedor>>(
    `/proveedores/${id}`,
    datos,
    token,
  );
  return res.data;
}

export async function eliminarProveedor(id: number, token: string | null): Promise<void> {
  await apiDelete<{ success: boolean; message?: string }>(`/proveedores/${id}`, token);
}

// ---------------------------------------------------------------------------
// Órdenes de compra (API C# -> /api/compras-proveedor)
// ---------------------------------------------------------------------------

export async function listarOrdenesCompra(token: string | null): Promise<OrdenCompra[]> {
  const res = await apiGet<{ data: OrdenCompra[] }>('/compras-proveedor', undefined, token);
  return res.data ?? [];
}

export async function obtenerOrdenCompra(
  id: number,
  token: string | null,
): Promise<OrdenCompraDetalle> {
  return apiGet<OrdenCompraDetalle>(`/compras-proveedor/${id}`, undefined, token);
}

export async function crearOrdenCompra(
  idProveedor: number,
  items: Array<{ id_libro: string; cantidad: number; costo_unitario: number }>,
  token: string | null,
): Promise<OrdenCreada> {
  return apiPost<OrdenCreada>(
    '/compras-proveedor',
    { id_proveedor: idProveedor, items },
    token,
  );
}

export async function recibirOrdenCompra(id: number, token: string | null): Promise<void> {
  await apiPost<{ ok: boolean }>(`/compras-proveedor/${id}/recibir`, undefined, token);
}

// ---------------------------------------------------------------------------
// Mermas y devoluciones a proveedor
// ---------------------------------------------------------------------------

export async function registrarMerma(
  datos: { id_libro: string; cantidad: number; referencia: string },
  token: string | null,
): Promise<void> {
  await apiPost<{ ok: boolean }>('/inventario/merma', datos, token);
}

export async function registrarDevolucionProveedor(
  datos: {
    id_proveedor: number;
    id_libro: string;
    cantidad: number;
    motivo: string;
    referencia: string;
  },
  token: string | null,
): Promise<{ id_devolucion: number }> {
  return apiPost<{ id_devolucion: number }>('/devoluciones-proveedor', datos, token);
}

// ---------------------------------------------------------------------------
// Reporte de compras
// ---------------------------------------------------------------------------

export async function obtenerReporteCompras(
  mes: string,
  token: string | null,
): Promise<ReporteCompras> {
  return apiGet<ReporteCompras>('/compras-proveedor/reporte', { mes }, token);
}
