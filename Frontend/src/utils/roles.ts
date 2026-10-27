import type { Rol } from '../types/auth';

export const ETIQUETA_ROL: Record<Rol, string> = {
  ADMIN: 'Administrador',
  VENDEDOR: 'Vendedor',
  CLIENTE: 'Cliente',
};

export const DESCRIPCION_ROL: Record<Rol, string> = {
  ADMIN: 'Control total del sistema, usuarios y reportes.',
  VENDEDOR: 'Gestión de productos, inventario y pedidos.',
  CLIENTE: 'Compra en el catálogo y consulta tus pedidos.',
};

export const CAPACIDADES_ROL: Record<Rol, string[]> = {
  ADMIN: [
    'Administrar usuarios y roles del sistema',
    'Gestionar catálogo, pedidos y reportes',
    'Acceder al panel de administración',
  ],
  VENDEDOR: [
    'Gestionar productos e inventario',
    'Atender pedidos y ventas',
    'Consultar reportes operativos',
  ],
  CLIENTE: [
    'Comprar en el catálogo',
    'Consultar el historial de compras',
    'Administrar los datos de tu cuenta',
  ],
};

export function esRol(valor: unknown): valor is Rol {
  return valor === 'ADMIN' || valor === 'VENDEDOR' || valor === 'CLIENTE';
}

export function rutaInicioPorRol(rol: Rol): string {
  return rol === 'ADMIN' ? '/admin' : '/';
}

export function nombreParaMostrar(usuario: {
  nombreCompleto: string | null;
  nombreUsuario: string;
}): string {
  return usuario.nombreCompleto?.trim() || usuario.nombreUsuario;
}
