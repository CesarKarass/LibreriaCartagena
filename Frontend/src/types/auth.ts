export type Rol = 'ADMIN' | 'VENDEDOR' | 'CLIENTE';

export interface DatosSesion {
  autenticado: boolean;
  idUsuario: number;
  nombreUsuario: string;
  email: string | null;
  nombreCompleto: string | null;
  rol: Rol;
  ultimoAcceso: string | null;
  token: string;
  tipoToken: string;
  expiraEn: number;
  expiraEnTexto: string;
}

/** Sesión tal como se guarda en el navegador, con vencimiento absoluto. */
export interface Sesion extends DatosSesion {
  expiraEnMs: number;
}

export interface UsuarioSesion {
  idUsuario: number;
  nombreUsuario: string;
  email: string | null;
  nombreCompleto: string | null;
  rol: Rol;
  ultimoAcceso: string | null;
}

export interface VerificacionSesion {
  autenticado: boolean;
  idUsuario: number;
  nombreUsuario: string;
  rol: Rol;
  email: string | null;
}

export interface RegistroPendienteVerificacion {
  idUsuario: number;
  verificacionPendiente: true;
  mensaje?: string;
}

export interface CredencialesLogin {
  nombreUsuario: string;
  contrasena: string;
}

export interface DatosRegistro {
  nombreUsuario: string;
  contrasena: string;
  email: string;
  nombreCompleto: string;
  telefono: string;
  captchaToken?: string;
}

export interface DetalleError {
  campo: string;
  problema: string;
}

export type ResultadoRegistro =
  | { tipo: 'sesion'; sesion: Sesion }
  | { tipo: 'verificacion'; mensaje: string };

export interface RespuestaApi<T> {
  exito: boolean;
  operacion?: string;
  mensaje: string;
  datos?: T;
  codigo?: string;
  detalles?: DetalleError[];
  marcaTiempo?: string;
}
