import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../services/api';
import { actualizarPerfil, cambiarContrasena, obtenerPerfil } from '../../services/tiendaService';
import { PERSONAJES, guardarPersonaje, usePersonaje } from '../../utils/avatar';
import { ETIQUETA_ROL, nombreParaMostrar } from '../../utils/roles';
import {
  requisitosContrasena,
  soloDigitos,
  validarContrasena,
  validarCorreo,
  validarNombreCompleto,
  validarTelefono,
} from '../../utils/validacion';

function formatearFecha(valor: string | null): string {
  if (!valor) return '—';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return '—';
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(fecha);
}

export default function ConfiguracionPage() {
  const { token, usuario, sesion, actualizarDatosUsuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState({ nombre: '', correo: '', telefono: '' });
  const [cargandoPerfil, setCargandoPerfil] = useState(true);
  const [erroresPerfil, setErroresPerfil] = useState<Record<string, string>>({});
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [avisoPerfil, setAvisoPerfil] = useState<string | null>(null);
  const [errorPerfil, setErrorPerfil] = useState<string | null>(null);

  const [claves, setClaves] = useState({ actual: '', nueva: '', confirmar: '' });
  const [erroresClaves, setErroresClaves] = useState<Record<string, string>>({});
  const [guardandoClaves, setGuardandoClaves] = useState(false);
  const [avisoClaves, setAvisoClaves] = useState<string | null>(null);
  const [errorClaves, setErrorClaves] = useState<string | null>(null);

  const personaje = usePersonaje(usuario?.nombreUsuario);
  const [avisoAvatar, setAvisoAvatar] = useState<string | null>(null);

  const requisitos = useMemo(() => requisitosContrasena(claves.nueva), [claves.nueva]);

  useEffect(() => {
    if (!token) return;
    let cancelado = false;
    setCargandoPerfil(true);
    obtenerPerfil(token)
      .then((datos) => {
        if (cancelado) return;
        setPerfil({
          nombre: datos.nombre ?? '',
          correo: datos.correo ?? '',
          telefono: datos.telefono ?? '',
        });
        setErrorPerfil(null);
      })
      .catch((fallo: unknown) => {
        if (cancelado) return;
        setErrorPerfil(
          fallo instanceof ApiError ? fallo.message : 'No se pudieron cargar los datos del perfil.',
        );
      })
      .finally(() => {
        if (!cancelado) setCargandoPerfil(false);
      });
    return () => {
      cancelado = true;
    };
  }, [token]);

  const guardarPerfil = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (!token) return;
    setAvisoPerfil(null);
    setErrorPerfil(null);

    const nuevos: Record<string, string> = {};
    const nombre = validarNombreCompleto(perfil.nombre);
    const correo = validarCorreo(perfil.correo);
    const telefono = validarTelefono(perfil.telefono);
    if (nombre) nuevos.nombre = nombre;
    if (correo) nuevos.correo = correo;
    if (perfil.telefono.trim() && telefono) nuevos.telefono = telefono;
    setErroresPerfil(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    setGuardandoPerfil(true);
    try {
      await actualizarPerfil(
        {
          nombre: perfil.nombre.trim(),
          correo: perfil.correo.trim().toLowerCase(),
          telefono: soloDigitos(perfil.telefono),
        },
        token,
      );
      actualizarDatosUsuario({
        nombreCompleto: perfil.nombre.trim(),
        email: perfil.correo.trim().toLowerCase(),
      });
      setAvisoPerfil('Tus datos se guardaron correctamente.');
    } catch (fallo) {
      setErrorPerfil(fallo instanceof ApiError ? fallo.message : 'No se pudo guardar el perfil.');
    } finally {
      setGuardandoPerfil(false);
    }
  };

  const guardarClaves = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (!token) return;
    setAvisoClaves(null);
    setErrorClaves(null);

    const nuevos: Record<string, string> = {};
    if (!claves.actual) nuevos.actual = 'Escribe tu contraseña actual.';
    const nueva = validarContrasena(claves.nueva);
    if (nueva) nuevos.nueva = nueva;
    if (claves.confirmar !== claves.nueva) nuevos.confirmar = 'Las contraseñas no coinciden.';
    setErroresClaves(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    setGuardandoClaves(true);
    try {
      await cambiarContrasena({ actual: claves.actual, nueva: claves.nueva }, token);
      setClaves({ actual: '', nueva: '', confirmar: '' });
      setAvisoClaves('Tu contraseña se actualizó correctamente.');
    } catch (fallo) {
      setErrorClaves(
        fallo instanceof ApiError && fallo.status === 401
          ? 'La contraseña actual no es correcta.'
          : fallo instanceof ApiError
            ? fallo.message
            : 'No se pudo cambiar la contraseña.',
      );
    } finally {
      setGuardandoClaves(false);
    }
  };

  if (!usuario) return null;
  return (
    <div className="config-page">
      <header className="config-page__head">
        <div>
          <p className="config-page__eyebrow">Mi cuenta</p>
          <h1>Configuración</h1>
          <p className="config-page__subtitulo">
            Administra tus datos, tu contraseña y tu foto de perfil.
          </p>
        </div>
        <span className={`role role--${usuario.rol.toLowerCase()}`}>{ETIQUETA_ROL[usuario.rol]}</span>
      </header>

      <div className="config-page__grid">
        <section className="panel config-page__bloque" aria-labelledby="config-perfil">
          <h2 id="config-perfil">Datos personales</h2>
          {cargandoPerfil ? (
            <p className="state" aria-live="polite">
              Cargando tu perfil…
            </p>
          ) : (
            <form className="config-page__form" onSubmit={guardarPerfil} noValidate>
              {errorPerfil && (
                <p className="config-page__error" role="alert">
                  {errorPerfil}
                </p>
              )}
              {avisoPerfil && (
                <p className="config-page__aviso" role="status">
                  {avisoPerfil}
                </p>
              )}

              <label className="field">
                <span>Nombre completo</span>
                <input
                  value={perfil.nombre}
                  onChange={(evento) => setPerfil({ ...perfil, nombre: evento.target.value })}
                  autoComplete="name"
                  aria-invalid={Boolean(erroresPerfil.nombre)}
                />
                {erroresPerfil.nombre && (
                  <em className="config-page__campo-error">{erroresPerfil.nombre}</em>
                )}
              </label>

              <label className="field">
                <span>Usuario</span>
                <input value={usuario.nombreUsuario} disabled />
                <em className="config-page__ayuda">El nombre de usuario no se puede cambiar aquí.</em>
              </label>

              <label className="field">
                <span>Correo electrónico</span>
                <input
                  type="email"
                  value={perfil.correo}
                  onChange={(evento) => setPerfil({ ...perfil, correo: evento.target.value })}
                  autoComplete="email"
                  aria-invalid={Boolean(erroresPerfil.correo)}
                />
                {erroresPerfil.correo && (
                  <em className="config-page__campo-error">{erroresPerfil.correo}</em>
                )}
              </label>

              <label className="field">
                <span>Teléfono (opcional, 10 dígitos)</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={perfil.telefono}
                  onChange={(evento) =>
                    setPerfil({ ...perfil, telefono: soloDigitos(evento.target.value).slice(0, 10) })
                  }
                  autoComplete="tel"
                  aria-invalid={Boolean(erroresPerfil.telefono)}
                />
                {erroresPerfil.telefono && (
                  <em className="config-page__campo-error">{erroresPerfil.telefono}</em>
                )}
              </label>

              <button type="submit" className="btn config-page__btn" disabled={guardandoPerfil}>
                {guardandoPerfil ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </form>
          )}
        </section>

        <section className="panel config-page__bloque" aria-labelledby="config-seguridad">
          <h2 id="config-seguridad">Seguridad</h2>
          <form className="config-page__form" onSubmit={guardarClaves} noValidate>
            {errorClaves && (
              <p className="config-page__error" role="alert">
                {errorClaves}
              </p>
            )}
            {avisoClaves && (
              <p className="config-page__aviso" role="status">
                {avisoClaves}
              </p>
            )}

            <label className="field">
              <span>Contraseña actual</span>
              <input
                type="password"
                value={claves.actual}
                onChange={(evento) => setClaves({ ...claves, actual: evento.target.value })}
                autoComplete="current-password"
                aria-invalid={Boolean(erroresClaves.actual)}
              />
              {erroresClaves.actual && (
                <em className="config-page__campo-error">{erroresClaves.actual}</em>
              )}
            </label>

            <label className="field">
              <span>Nueva contraseña</span>
              <input
                type="password"
                value={claves.nueva}
                onChange={(evento) => setClaves({ ...claves, nueva: evento.target.value })}
                autoComplete="new-password"
                aria-invalid={Boolean(erroresClaves.nueva)}
              />
              {erroresClaves.nueva && (
                <em className="config-page__campo-error">{erroresClaves.nueva}</em>
              )}
            </label>

            <ul className="auth-requisitos auth-requisitos--claro" aria-label="Requisitos de la contraseña">
              {requisitos.map((requisito) => (
                <li
                  key={requisito.clave}
                  className={requisito.cumple ? 'auth-requisito auth-requisito--ok' : 'auth-requisito'}
                >
                  <span aria-hidden="true">{requisito.cumple ? '✓' : '○'}</span> {requisito.etiqueta}
                </li>
              ))}
            </ul>

            <label className="field">
              <span>Confirmar nueva contraseña</span>
              <input
                type="password"
                value={claves.confirmar}
                onChange={(evento) => setClaves({ ...claves, confirmar: evento.target.value })}
                autoComplete="new-password"
                aria-invalid={Boolean(erroresClaves.confirmar)}
              />
              {erroresClaves.confirmar && (
                <em className="config-page__campo-error">{erroresClaves.confirmar}</em>
              )}
            </label>

            <button type="submit" className="btn config-page__btn" disabled={guardandoClaves}>
              {guardandoClaves ? 'Actualizando…' : 'Cambiar contraseña'}
            </button>
          </form>
        </section>

        <section className="panel config-page__bloque" aria-labelledby="config-avatar">
          <h2 id="config-avatar">Foto de perfil</h2>
          <p className="config-page__nota">
            Elige un personaje de fantasía para que te represente en la tienda. Se guardará al instante.
          </p>
          <div className="config-avatares">
            <button
              type="button"
              className="config-avatar"
              aria-pressed={!personaje}
              onClick={() => {
                guardarPersonaje(usuario.nombreUsuario, null);
                setAvisoAvatar('Usarás tus iniciales como foto de perfil.');
              }}
            >
              <span className="config-avatar__emoji" aria-hidden="true">
                {nombreParaMostrar(usuario)
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((parte) => parte[0]?.toUpperCase() ?? '')
                  .join('') || '?'}
              </span>
              Mis iniciales
            </button>
            {PERSONAJES.map((opcion) => (
              <button
                key={opcion.clave}
                type="button"
                className="config-avatar"
                aria-pressed={personaje?.clave === opcion.clave}
                onClick={() => {
                  guardarPersonaje(usuario.nombreUsuario, opcion.clave);
                  setAvisoAvatar(`Ahora tu foto de perfil es ${opcion.nombre}.`);
                }}
              >
                <span className="config-avatar__emoji" aria-hidden="true">
                  {opcion.emoji}
                </span>
                {opcion.nombre}
              </button>
            ))}
          </div>
          {avisoAvatar && (
            <p className="config-page__aviso" role="status">
              {avisoAvatar}
            </p>
          )}
        </section>

        <section className="panel config-page__bloque" aria-labelledby="config-sesion">
          <h2 id="config-sesion">Sesión</h2>
          <dl className="account__data">
            <div>
              <dt>Cuenta</dt>
              <dd>{nombreParaMostrar(usuario)}</dd>
            </div>
            <div>
              <dt>Correo</dt>
              <dd>{usuario.email ?? 'Sin correo registrado'}</dd>
            </div>
            <div>
              <dt>Rol</dt>
              <dd>{ETIQUETA_ROL[usuario.rol]}</dd>
            </div>
            <div>
              <dt>Último acceso</dt>
              <dd>{formatearFecha(usuario.ultimoAcceso)}</dd>
            </div>
            <div>
              <dt>La sesión vence</dt>
              <dd>{sesion ? formatearFecha(new Date(sesion.expiraEnMs).toISOString()) : '—'}</dd>
            </div>
          </dl>

          <div className="config-page__acciones">
            {usuario.rol === 'ADMIN' && (
              <Link className="btn btn--outline" to="/admin">
                Ir al panel
              </Link>
            )}
            <Link className="btn btn--outline" to="/mis-pedidos">
              Mis pedidos
            </Link>
            <button
              type="button"
              className="btn btn--peligro"
              onClick={() => {
                cerrarSesion();
                navigate('/');
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
