import { apiGet, apiPatch, apiPost } from './api';
import type {
  Compra,
  EnvioAdmin,
  Garantia,
  PedidoAdmin,
  PerfilCuenta,
  RespuestaLista,
  RolAdmin,
  UsuarioAdmin,
} from '../types/tienda';

// ---------------------------------------------------------------------------
// Cliente: historial de compras, entregas y garantías
// ---------------------------------------------------------------------------

export async function obtenerMisCompras(token: string): Promise<Compra[]> {
  const respuesta = await apiGet<RespuestaLista<Compra>>('/mis-compras', undefined, token);
  return respuesta.data;
}

export async function confirmarEntrega(idEnvio: number, token: string): Promise<void> {
  await apiPost(`/envios/${idEnvio}/confirmar-entrega`, undefined, token);
}

export async function solicitarGarantia(
  datos: { id_venta: number; id_libro: string; motivo: string },
  token: string,
): Promise<void> {
  await apiPost('/garantias', datos, token);
}

export async function obtenerGarantias(token: string): Promise<Garantia[]> {
  const respuesta = await apiGet<RespuestaLista<Garantia>>('/garantias', undefined, token);
  return respuesta.data;
}

// ---------------------------------------------------------------------------
// Configuración de la cuenta
// ---------------------------------------------------------------------------

export function obtenerPerfil(token: string): Promise<PerfilCuenta> {
  return apiGet<PerfilCuenta>('/cuenta/perfil', undefined, token);
}

export async function actualizarPerfil(
  datos: { nombre: string; correo: string; telefono: string },
  token: string,
): Promise<void> {
  await apiPatch('/cuenta/perfil', datos, token);
}

export async function cambiarContrasena(
  datos: { actual: string; nueva: string },
  token: string,
): Promise<void> {
  await apiPost('/cuenta/contrasena', datos, token);
}

// ---------------------------------------------------------------------------
// Administración: usuarios y roles
// ---------------------------------------------------------------------------

export async function listarRoles(token: string): Promise<RolAdmin[]> {
  const respuesta = await apiGet<RespuestaLista<RolAdmin>>('/admin/roles', undefined, token);
  return respuesta.data;
}

export async function listarUsuarios(token: string): Promise<UsuarioAdmin[]> {
  const respuesta = await apiGet<RespuestaLista<UsuarioAdmin>>('/admin/usuarios', undefined, token);
  return respuesta.data;
}

export async function crearUsuario(
  datos: {
    nombre: string;
    nombre_usuario: string;
    correo: string;
    telefono: string;
    contrasena: string;
    rol: string;
    activo: boolean;
  },
  token: string,
): Promise<{ id_usuario: number }> {
  return apiPost<{ id_usuario: number }>('/admin/usuarios', datos, token);
}

export async function actualizarUsuario(
  id: number,
  datos: {
    nombre: string;
    nombre_usuario: string;
    correo: string;
    telefono: string;
    rol: string;
    activo: boolean;
  },
  token: string,
): Promise<void> {
  await apiPatch(`/admin/usuarios/${id}`, datos, token);
}

export async function restablecerContrasenaUsuario(
  id: number,
  contrasena: string,
  token: string,
): Promise<void> {
  await apiPost(`/admin/usuarios/${id}/contrasena`, { contrasena }, token);
}

// ---------------------------------------------------------------------------
// Administración: logística y entregas
// ---------------------------------------------------------------------------

export async function listarEnviosAdmin(token: string): Promise<EnvioAdmin[]> {
  const respuesta = await apiGet<RespuestaLista<EnvioAdmin>>(
    '/admin/logistica/envios',
    undefined,
    token,
  );
  return respuesta.data;
}

export async function actualizarEnvio(
  idEnvio: number,
  datos: { estado: string; numero_guia?: string | null },
  token: string,
): Promise<void> {
  await apiPatch(`/envios/${idEnvio}`, datos, token);
}

export async function validarEntregaAdmin(idEnvio: number, token: string): Promise<void> {
  await apiPost(`/admin/envios/${idEnvio}/validar-entrega`, undefined, token);
}

// ---------------------------------------------------------------------------
// Administración: pedidos y ventas
// ---------------------------------------------------------------------------

export async function listarPedidosAdmin(token: string): Promise<PedidoAdmin[]> {
  const respuesta = await apiGet<RespuestaLista<PedidoAdmin>>('/admin/pedidos', undefined, token);
  return respuesta.data;
}
