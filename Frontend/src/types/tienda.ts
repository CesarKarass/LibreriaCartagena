/** Tipos del historial de compras, logística, garantías y usuarios/roles. */

export interface CompraItem {
  id_venta: number;
  id_libro: string;
  titulo: string;
  autor: string | null;
  imagen_portada: string | null;
  cantidad: number;
  precio_unitario: string | number;
}

export interface Garantia {
  id_solicitud: number;
  id_venta: number;
  id_libro: string;
  titulo: string;
  motivo: string;
  estado: string;
  fecha: string;
}

export interface Compra {
  id_venta: number;
  fecha: string;
  total: string | number;
  estado: string;
  estado_pago: string;
  referencia_pago: string | null;
  metodo_pago: string;
  id_envio: number | null;
  estado_envio: string | null;
  numero_guia: string | null;
  fecha_entrega: string | null;
  confirmado_cliente: boolean;
  direccion: string | null;
  ciudad: string | null;
  domicilio_estado: string | null;
  codigo_postal: string | null;
  direccion_completa: string | null;
  items: CompraItem[];
  garantias: Garantia[];
}

export interface EnvioAdmin {
  id_envio: number;
  id_venta: number;
  estado: string;
  numero_guia: string | null;
  fecha_entrega: string | null;
  confirmado_cliente: boolean;
  fecha_venta: string;
  total: string | number;
  estado_venta: string;
  id_usuario: number;
  cliente: string;
  correo: string | null;
  telefono: string | null;
  direccion: string | null;
  ciudad: string | null;
  domicilio_estado: string | null;
  codigo_postal: string | null;
  libros: string | null;
}

export interface RolAdmin {
  id_rol: number;
  nombre: string;
}

export interface UsuarioAdmin {
  id_usuario: number;
  nombre: string;
  nombre_usuario: string;
  correo: string;
  telefono: string | null;
  activo: boolean;
  correo_verificado: boolean;
  fecha_registro: string | null;
  ultimo_acceso: string | null;
  rol: string;
}

export interface PerfilCuenta {
  id_usuario: number;
  nombre: string;
  nombre_usuario: string;
  correo: string;
  telefono: string | null;
  correo_verificado: boolean;
  activo: boolean;
  fecha_registro: string | null;
  ultimo_acceso: string | null;
  rol: string;
}

export interface PedidoAdmin {
  id_pedido: number;
  id_usuario: number;
  nombre: string;
  fecha: string;
  total: string | number;
  estado: string;
  estado_pago: string;
  estado_envio: string | null;
}

export interface RespuestaLista<T> {
  data: T[];
}
