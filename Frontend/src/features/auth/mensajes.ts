import { AuthApiError } from '../../services/authService';
import type { Rol } from '../../types/auth';
import { rutaInicioPorRol } from '../../utils/roles';

const RUTAS_AUTENTICACION = /^\/(login|registro|recuperar-password|restablecer-password)(\/|$)/;

/** Destino posterior al login: respeta la ruta protegida de origen y el rol. */
export function destinoTrasAutenticar(estado: unknown, rol: Rol): string {
  const from =
    typeof estado === 'object' && estado !== null && 'from' in estado
      ? (estado as { from?: unknown }).from
      : undefined;

  if (
    typeof from === 'string' &&
    from.startsWith('/') &&
    !from.startsWith('//') &&
    !RUTAS_AUTENTICACION.test(from)
  ) {
    return from;
  }

  return rutaInicioPorRol(rol);
}

export function erroresPorCampo(error: unknown): Record<string, string> {
  if (!(error instanceof AuthApiError)) return {};
  return Object.fromEntries(error.detalles.map((detalle) => [detalle.campo, detalle.problema]));
}

export function mensajeErrorAuth(error: unknown): string {
  if (!(error instanceof AuthApiError)) {
    return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
  }

  switch (error.codigo) {
    case 'CREDENCIALES_INVALIDAS':
      return 'Usuario o contraseña incorrectos. Revisa tus datos e inténtalo de nuevo.';
    case 'USUARIO_INACTIVO':
      return 'Tu cuenta está desactivada. Contacta al administrador.';
    case 'USUARIO_BLOQUEADO':
      return error.message || 'La cuenta está bloqueada temporalmente por intentos fallidos.';
    case 'LIMITE_INTENTOS':
      return 'Demasiados intentos. Espera unos minutos antes de volver a intentarlo.';
    case 'USUARIO_YA_EXISTE':
      return 'Ya existe una cuenta con ese nombre de usuario o correo electrónico.';
    case 'DATOS_INVALIDOS':
      return error.detalles.length
        ? 'Revisa los campos marcados e inténtalo de nuevo.'
        : error.message;
    case 'SIN_CONEXION':
      return 'No se pudo conectar con el servicio de autenticación. Verifica que esté en marcha.';
    case 'TIEMPO_AGOTADO':
      return 'El servicio tardó demasiado en responder. Inténtalo de nuevo.';
    case 'BASE_DATOS_NO_DISPONIBLE':
      return 'El servicio de autenticación no está disponible en este momento. Inténtalo más tarde.';
    case 'NO_ENCONTRADO':
      return 'La operación no está disponible en el servidor. Contacta al administrador.';
    case 'TOKEN_INVALIDO':
      return 'Tu sesión expiró. Inicia sesión de nuevo.';
    default:
      return error.message || 'No se pudo completar la operación.';
  }
}
