import type {
  CredencialesLogin,
  DatosRegistro,
  DatosSesion,
  DetalleError,
  RegistroPendienteVerificacion,
  RespuestaApi,
  ResultadoRegistro,
  Sesion,
  VerificacionSesion,
} from '../types/auth';

const AUTH_API_URL = (import.meta.env.VITE_AUTH_API_URL ?? '/api/v1').replace(/\/+$/, '');
const ACCOUNT_API_URL = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/+$/, '');

const TIEMPO_LIMITE_MS = 15_000;

type CuerpoDesconocido = Record<string, unknown>;

function esObjeto(valor: unknown): valor is CuerpoDesconocido {
  return typeof valor === 'object' && valor !== null;
}

function codigoPorEstado(estado: number): string {
  switch (estado) {
    case 400:
      return 'PETICION_INVALIDA';
    case 401:
      return 'TOKEN_INVALIDO';
    case 403:
      return 'ACCESO_DENEGADO';
    case 404:
      return 'NO_ENCONTRADO';
    case 409:
      return 'CONFLICTO';
    case 422:
      return 'DATOS_INVALIDOS';
    case 423:
      return 'USUARIO_BLOQUEADO';
    case 429:
      return 'LIMITE_INTENTOS';
    case 503:
      return 'BASE_DATOS_NO_DISPONIBLE';
    default:
      return estado >= 500 ? 'ERROR_SERVIDOR' : 'ERROR_DESCONOCIDO';
  }
}

function extraerDetalles(valor: unknown): DetalleError[] {
  if (!Array.isArray(valor)) return [];
  return valor.flatMap((detalle) => {
    if (!esObjeto(detalle) || typeof detalle.campo !== 'string' || typeof detalle.problema !== 'string') {
      return [];
    }
    return [{ campo: detalle.campo, problema: detalle.problema }];
  });
}

export class AuthApiError extends Error {
  readonly codigo: string;
  readonly estadoHttp: number;
  readonly detalles: DetalleError[];

  constructor(
    mensaje: string,
    opciones: { codigo?: string; estadoHttp?: number; detalles?: DetalleError[] } = {},
  ) {
    super(mensaje);
    this.name = 'AuthApiError';
    this.codigo = opciones.codigo ?? 'ERROR_DESCONOCIDO';
    this.estadoHttp = opciones.estadoHttp ?? 0;
    this.detalles = opciones.detalles ?? [];
  }
}

async function solicitar<T>(url: string, init: RequestInit): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let respuesta: Response;
  try {
    respuesta = await fetch(url, {
      ...init,
      headers,
      signal: AbortSignal.timeout(TIEMPO_LIMITE_MS),
    });
  } catch (error) {
    const agotado =
      error instanceof DOMException && (error.name === 'TimeoutError' || error.name === 'AbortError');
    throw new AuthApiError(
      agotado
        ? 'El servicio tardó demasiado en responder. Inténtalo de nuevo.'
        : 'No se pudo conectar con el servicio de autenticación. Verifica que esté en marcha.',
      { codigo: agotado ? 'TIEMPO_AGOTADO' : 'SIN_CONEXION', estadoHttp: 0 },
    );
  }

  const texto = await respuesta.text();
  let cuerpo: unknown = null;
  if (texto) {
    try {
      cuerpo = JSON.parse(texto);
    } catch {
      cuerpo = null;
    }
  }

  if (!respuesta.ok) {
    const objeto = esObjeto(cuerpo) ? cuerpo : {};
    const mensaje =
      (typeof objeto.mensaje === 'string' && objeto.mensaje) ||
      (typeof objeto.error === 'string' && objeto.error) ||
      (typeof objeto.message === 'string' && objeto.message) ||
      `No se pudo completar la operación (HTTP ${respuesta.status}).`;
    throw new AuthApiError(mensaje, {
      codigo: typeof objeto.codigo === 'string' ? objeto.codigo : codigoPorEstado(respuesta.status),
      estadoHttp: respuesta.status,
      detalles: extraerDetalles(objeto.detalles),
    });
  }

  if (cuerpo === null) {
    throw new AuthApiError('El servidor devolvió una respuesta vacía.', {
      codigo: 'RESPUESTA_INVALIDA',
      estadoHttp: respuesta.status,
    });
  }

  return cuerpo as T;
}

function crearSesion(datos: DatosSesion): Sesion {
  const segundos = Number.isFinite(datos.expiraEn) && datos.expiraEn > 0 ? datos.expiraEn : 900;
  return { ...datos, expiraEnMs: Date.now() + segundos * 1000 };
}

function validarRespuesta<T>(cuerpo: RespuestaApi<T>): T {
  if (!cuerpo.exito || !cuerpo.datos) {
    throw new AuthApiError(cuerpo.mensaje || 'No se pudo completar la operación.', {
      codigo: cuerpo.codigo,
      estadoHttp: 200,
      detalles: cuerpo.detalles,
    });
  }
  return cuerpo.datos;
}

export async function iniciarSesion(credenciales: CredencialesLogin): Promise<Sesion> {
  const cuerpo = await solicitar<RespuestaApi<DatosSesion>>(`${AUTH_API_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify(credenciales),
  });
  return crearSesion(validarRespuesta(cuerpo));
}

export async function registrarUsuario(datos: DatosRegistro): Promise<ResultadoRegistro> {
  const cuerpo = await solicitar<RespuestaApi<DatosSesion | RegistroPendienteVerificacion>>(
    `${AUTH_API_URL}/auth/registro`,
    { method: 'POST', body: JSON.stringify(datos) },
  );
  const respuesta = validarRespuesta(cuerpo);

  if ('token' in respuesta) {
    return { tipo: 'sesion', sesion: crearSesion(respuesta) };
  }

  return {
    tipo: 'verificacion',
    mensaje:
      respuesta.mensaje ??
      'Tu cuenta se creó. Revisa tu correo electrónico para verificarla antes de iniciar sesión.',
  };
}

export async function verificarSesion(token: string): Promise<VerificacionSesion> {
  const cuerpo = await solicitar<RespuestaApi<VerificacionSesion>>(`${AUTH_API_URL}/auth/verificar`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return validarRespuesta(cuerpo);
}

export async function consultarPanelAdmin(token: string): Promise<{ idUsuario: number }> {
  const cuerpo = await solicitar<RespuestaApi<{ idUsuario: number }>>(
    `${AUTH_API_URL}/auth/admin/panel`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return validarRespuesta(cuerpo);
}

/** La recuperación de contraseña vive en la API de cuentas (C#). */
export async function solicitarRecuperacion(correo: string): Promise<string> {
  const cuerpo = await solicitar<{ mensaje?: string }>(
    `${ACCOUNT_API_URL}/cuenta/recuperacion/solicitar`,
    { method: 'POST', body: JSON.stringify({ correo }) },
  );
  return cuerpo.mensaje ?? 'Si el correo existe, enviaremos instrucciones.';
}

export async function restablecerContrasena(token: string, nuevaContrasena: string): Promise<void> {
  await solicitar<{ ok?: boolean }>(`${ACCOUNT_API_URL}/cuenta/recuperacion/restablecer`, {
    method: 'POST',
    body: JSON.stringify({ token, nueva_contrasena: nuevaContrasena }),
  });
}

export { AUTH_API_URL, ACCOUNT_API_URL };
