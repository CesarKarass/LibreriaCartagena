import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  AuthApiError,
  iniciarSesion as iniciarSesionApi,
  registrarUsuario as registrarUsuarioApi,
  verificarSesion as verificarSesionApi,
} from '../services/authService';
import type {
  CredencialesLogin,
  DatosRegistro,
  ResultadoRegistro,
  Rol,
  Sesion,
  UsuarioSesion,
} from '../types/auth';
import { esRol } from '../utils/roles';

const CLAVE_SESION = 'cartagena.sesion.v1';

interface AuthContextValue {
  sesion: Sesion | null;
  usuario: UsuarioSesion | null;
  token: string | null;
  cargando: boolean;
  autenticado: boolean;
  iniciarSesion: (credenciales: CredencialesLogin) => Promise<Sesion>;
  registrar: (datos: DatosRegistro) => Promise<ResultadoRegistro>;
  cerrarSesion: () => void;
  tieneRol: (...roles: Rol[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function esSesionGuardada(valor: unknown): valor is Sesion {
  if (typeof valor !== 'object' || valor === null) return false;
  const sesion = valor as Partial<Sesion>;
  return (
    typeof sesion.token === 'string' &&
    sesion.token.length > 0 &&
    typeof sesion.expiraEnMs === 'number' &&
    Number.isFinite(sesion.expiraEnMs) &&
    typeof sesion.idUsuario === 'number' &&
    typeof sesion.nombreUsuario === 'string' &&
    esRol(sesion.rol)
  );
}

function leerSesionGuardada(): Sesion | null {
  try {
    const texto = localStorage.getItem(CLAVE_SESION);
    if (!texto) return null;
    const sesion: unknown = JSON.parse(texto);
    if (!esSesionGuardada(sesion) || sesion.expiraEnMs <= Date.now()) {
      localStorage.removeItem(CLAVE_SESION);
      return null;
    }
    return sesion;
  } catch {
    return null;
  }
}

function guardarSesion(sesion: Sesion): void {
  try {
    localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  } catch {
    // Si el navegador bloquea el almacenamiento, la sesión vive solo en memoria.
  }
}

function borrarSesionGuardada(): void {
  try {
    localStorage.removeItem(CLAVE_SESION);
  } catch {
    // noop
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(() => leerSesionGuardada());
  const [cargando, setCargando] = useState(true);

  const cerrarSesion = useCallback(() => {
    borrarSesionGuardada();
    setSesion(null);
  }, []);

  const iniciarSesion = useCallback(async (credenciales: CredencialesLogin) => {
    const nuevaSesion = await iniciarSesionApi(credenciales);
    guardarSesion(nuevaSesion);
    setSesion(nuevaSesion);
    return nuevaSesion;
  }, []);

  const registrar = useCallback(async (datos: DatosRegistro) => {
    const resultado = await registrarUsuarioApi(datos);
    if (resultado.tipo === 'sesion') {
      guardarSesion(resultado.sesion);
      setSesion(resultado.sesion);
    }
    return resultado;
  }, []);

  // Valida la sesión guardada contra el microservicio al cargar la aplicación.
  useEffect(() => {
    let cancelado = false;

    if (!sesion?.token) {
      setCargando(false);
      return () => {
        cancelado = true;
      };
    }

    verificarSesionApi(sesion.token)
      .then((datos) => {
        if (cancelado) return;
        setSesion((actual) =>
          actual
            ? {
                ...actual,
                idUsuario: datos.idUsuario,
                nombreUsuario: datos.nombreUsuario,
                email: datos.email ?? actual.email,
                rol: datos.rol,
                autenticado: datos.autenticado,
              }
            : actual,
        );
      })
      .catch((error: unknown) => {
        if (cancelado) return;
        if (error instanceof AuthApiError && (error.estadoHttp === 401 || error.estadoHttp === 403)) {
          cerrarSesion();
        }
        // Si el servicio está caído se conserva la sesión local hasta que expire.
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
    // La validación se hace una sola vez por token cargado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cierra la sesión automáticamente cuando vence el JWT (15 minutos).
  useEffect(() => {
    if (!sesion) return;
    const restante = sesion.expiraEnMs - Date.now();
    if (restante <= 0) {
      cerrarSesion();
      return;
    }
    const temporizador = window.setTimeout(cerrarSesion, Math.min(restante, 2_147_483_647));
    return () => window.clearTimeout(temporizador);
  }, [sesion, cerrarSesion]);

  // Mantiene sincronizadas las pestañas abiertas.
  useEffect(() => {
    const alCambiarAlmacenamiento = (evento: StorageEvent) => {
      if (evento.key !== CLAVE_SESION) return;
      setSesion(evento.newValue ? leerSesionGuardada() : null);
    };
    window.addEventListener('storage', alCambiarAlmacenamiento);
    return () => window.removeEventListener('storage', alCambiarAlmacenamiento);
  }, []);

  const usuario = useMemo<UsuarioSesion | null>(() => {
    if (!sesion) return null;
    return {
      idUsuario: sesion.idUsuario,
      nombreUsuario: sesion.nombreUsuario,
      email: sesion.email,
      nombreCompleto: sesion.nombreCompleto,
      rol: sesion.rol,
      ultimoAcceso: sesion.ultimoAcceso,
    };
  }, [sesion]);

  const value = useMemo<AuthContextValue>(
    () => ({
      sesion,
      usuario,
      token: sesion?.token ?? null,
      cargando,
      autenticado: Boolean(sesion),
      iniciarSesion,
      registrar,
      cerrarSesion,
      tieneRol: (...roles) => Boolean(usuario && roles.includes(usuario.rol)),
    }),
    [sesion, usuario, cargando, iniciarSesion, registrar, cerrarSesion],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return contexto;
}
