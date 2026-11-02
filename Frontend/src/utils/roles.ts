import type { Rol } from '../types/auth';

export const ETIQUETA_ROL: Record<Rol, string> = {
  ADMIN: 'Administrador',
  VENDEDOR: 'Vendedor',
  CLIENTE: 'Cliente',
  PROVEEDOR: 'Proveedor',
  REPARTIDOR: 'Repartidor',
};

export const DESCRIPCION_ROL: Record<Rol, string> = {
  ADMIN: 'Control total del sistema, usuarios y reportes.',
  VENDEDOR: 'Atención en tienda y apoyo en las ventas del día a día.',
  CLIENTE: 'Compra en el catálogo y consulta tus pedidos.',
  PROVEEDOR: 'Surtido de libros, pedidos de compra y devoluciones.',
  REPARTIDOR: 'Seguimiento de envíos, guías y entregas a domicilio.',
};

export const CAPACIDADES_ROL: Record<Rol, string[]> = {
  ADMIN: [
    'Administrar usuarios y roles del sistema',
    'Gestionar catálogo, pedidos y reportes',
    'Acceder al panel de administración',
  ],
  VENDEDOR: [
    'Consultar catálogo, precios y existencias',
    'Apoyar a los clientes en sus compras',
    'Revisar el resumen de ventas',
  ],
  CLIENTE: [
    'Comprar en el catálogo',
    'Consultar el historial de compras',
    'Administrar los datos de tu cuenta',
  ],
  PROVEEDOR: [
    'Consultar pedidos de compra',
    'Registrar devoluciones de mercancía',
    'Revisar el estado de abastecimiento',
  ],
  REPARTIDOR: [
    'Actualizar el estado de los envíos',
    'Asignar números de guía',
    'Validar la entrega de pedidos',
  ],
};

export function esRol(valor: unknown): valor is Rol {
  return (
    valor === 'ADMIN' ||
    valor === 'VENDEDOR' ||
    valor === 'CLIENTE' ||
    valor === 'PROVEEDOR' ||
    valor === 'REPARTIDOR'
  );
}

export function rutaInicioPorRol(rol: Rol): string {
  if (rol === 'ADMIN') return '/admin';
  if (rol === 'REPARTIDOR') return '/admin/logistica';
  return '/';
}

export function nombreParaMostrar(usuario: {
  nombreCompleto: string | null;
  nombreUsuario: string;
}): string {
  return usuario.nombreCompleto?.trim() || usuario.nombreUsuario;
}

export function inicialesDe(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? '')
    .join('');
}
