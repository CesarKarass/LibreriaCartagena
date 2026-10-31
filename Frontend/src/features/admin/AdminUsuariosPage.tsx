import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../services/api';
import {
  actualizarUsuario,
  crearUsuario,
  listarRoles,
  listarUsuarios,
  restablecerContrasenaUsuario,
} from '../../services/tiendaService';
import type { RolAdmin, UsuarioAdmin } from '../../types/tienda';
import type { Rol } from '../../types/auth';
import { ETIQUETA_ROL, inicialesDe } from '../../utils/roles';
import {
  requisitosContrasena,
  soloDigitos,
  validarContrasena,
  validarCorreo,
  validarNombreCompleto,
  validarNombreUsuario,
  validarTelefono,
} from '../../utils/validacion';

interface FormUsuario {
  nombre: string;
  nombre_usuario: string;
  correo: string;
  telefono: string;
  contrasena: string;
  rol: string;
  activo: boolean;
}

const FORM_VACIO: FormUsuario = {
  nombre: '',
  nombre_usuario: '',
  correo: '',
  telefono: '',
  contrasena: '',
  rol: 'CLIENTE',
  activo: true,
};

const ORDEN_ROLES: Rol[] = ['ADMIN', 'VENDEDOR', 'CLIENTE', 'REPARTIDOR', 'PROVEEDOR'];

function etiquetaRol(rol: string): string {
  return ETIQUETA_ROL[rol as Rol] ?? rol;
}

function formatearFecha(valor: string | null): string {
  if (!valor) return 'Nunca';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return '—';
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(fecha);
}

export default function AdminUsuariosPage() {
  const { token, usuario } = useAuth();

  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [roles, setRoles] = useState<RolAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');

  const [formAbierto, setFormAbierto] = useState(false);
  const [editando, setEditando] = useState<UsuarioAdmin | null>(null);
  const [form, setForm] = useState<FormUsuario>(FORM_VACIO);
  const [erroresForm, setErroresForm] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState(false);

  const [resetUsuario, setResetUsuario] = useState<UsuarioAdmin | null>(null);
  const [resetClave, setResetClave] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [reseteando, setReseteando] = useState(false);

  const cargar = useCallback(async () => {
    if (!token) return;
    setCargando(true);
    setError(null);
    try {
      const [listaUsuarios, listaRoles] = await Promise.all([
        listarUsuarios(token),
        listarRoles(token),
      ]);
      setUsuarios(listaUsuarios);
      setRoles(listaRoles);
    } catch (fallo) {
      setError(fallo instanceof ApiError ? fallo.message : 'No se pudieron cargar los usuarios.');
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return usuarios.filter((item) => {
      const coincideTexto =
        !texto ||
        item.nombre.toLowerCase().includes(texto) ||
        item.nombre_usuario.toLowerCase().includes(texto) ||
        item.correo.toLowerCase().includes(texto);
      const coincideRol = filtroRol === 'todos' || item.rol === filtroRol;
      return coincideTexto && coincideRol;
    });
  }, [usuarios, busqueda, filtroRol]);

  const resumen = useMemo(
    () => ({
      total: usuarios.length,
      activos: usuarios.filter((u) => u.activo).length,
      admins: usuarios.filter((u) => u.rol === 'ADMIN').length,
      clientes: usuarios.filter((u) => u.rol === 'CLIENTE').length,
    }),
    [usuarios],
  );

  const abrirNuevo = () => {
    setEditando(null);
    setForm(FORM_VACIO);
    setErroresForm({});
    setResetUsuario(null);
    setFormAbierto(true);
    setAviso(null);
    setError(null);
  };

  const abrirEdicion = (item: UsuarioAdmin) => {
    setEditando(item);
    setForm({
      nombre: item.nombre,
      nombre_usuario: item.nombre_usuario,
      correo: item.correo,
      telefono: item.telefono ?? '',
      contrasena: '',
      rol: item.rol,
      activo: item.activo,
    });
    setErroresForm({});
    setResetUsuario(null);
    setFormAbierto(true);
    setAviso(null);
    setError(null);
  };

  const cerrarForm = () => {
    setFormAbierto(false);
    setEditando(null);
    setErroresForm({});
  };

  const validarFormulario = () => {
    const nuevos: Record<string, string> = {};
    const nombre = validarNombreCompleto(form.nombre);
    const nombreUsuario = validarNombreUsuario(form.nombre_usuario);
    const correo = validarCorreo(form.correo);
    const telefono = form.telefono ? validarTelefono(form.telefono) : undefined;
    if (nombre) nuevos.nombre = nombre;
    if (nombreUsuario) nuevos.nombre_usuario = nombreUsuario;
    if (correo) nuevos.correo = correo;
    if (telefono) nuevos.telefono = telefono;
    if (!form.rol) nuevos.rol = 'Selecciona un rol.';
    if (!editando) {
      const contrasena = validarContrasena(form.contrasena);
      if (contrasena) nuevos.contrasena = contrasena;
    }
    setErroresForm(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const guardar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (!token || !validarFormulario()) return;
    setGuardando(true);
    setError(null);
    setAviso(null);
    const datos = {
      nombre: form.nombre.trim(),
      nombre_usuario: form.nombre_usuario.trim(),
      correo: form.correo.trim().toLowerCase(),
      telefono: soloDigitos(form.telefono),
      rol: form.rol,
      activo: form.activo,
    };
    try {
      if (editando) {
        await actualizarUsuario(editando.id_usuario, datos, token);
        setAviso(`Usuario ${datos.nombre_usuario} actualizado correctamente.`);
      } else {
        await crearUsuario({ ...datos, contrasena: form.contrasena }, token);
        setAviso(`Usuario ${datos.nombre_usuario} creado correctamente.`);
      }
      cerrarForm();
      await cargar();
    } catch (fallo) {
      setError(fallo instanceof ApiError ? fallo.message : 'No se pudo guardar el usuario.');
    } finally {
      setGuardando(false);
    }
  };

  const alternarActivo = async (item: UsuarioAdmin) => {
    if (!token) return;
    if (item.id_usuario === usuario?.idUsuario) {
      setError('No puedes desactivar tu propia cuenta.');
      return;
    }
    setError(null);
    setAviso(null);
    try {
      await actualizarUsuario(
        item.id_usuario,
        {
          nombre: item.nombre,
          nombre_usuario: item.nombre_usuario,
          correo: item.correo,
          telefono: item.telefono ?? '',
          rol: item.rol,
          activo: !item.activo,
        },
        token,
      );
      setAviso(`Cuenta ${item.activo ? 'desactivada' : 'activada'}: ${item.nombre_usuario}.`);
      await cargar();
    } catch (fallo) {
      setError(fallo instanceof ApiError ? fallo.message : 'No se pudo cambiar el estado de la cuenta.');
    }
  };

  const abrirReset = (item: UsuarioAdmin) => {
    setResetUsuario(item);
    setResetClave('');
    setResetError(null);
    setFormAbierto(false);
    setEditando(null);
    setAviso(null);
  };

  const guardarReset = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (!token || !resetUsuario) return;
    const problema = validarContrasena(resetClave);
    if (problema) {
      setResetError(problema);
      return;
    }
    setReseteando(true);
    setResetError(null);
    try {
      await restablecerContrasenaUsuario(resetUsuario.id_usuario, resetClave, token);
      setAviso(`Contraseña restablecida para ${resetUsuario.nombre_usuario}.`);
      setResetUsuario(null);
      setResetClave('');
    } catch (fallo) {
      setResetError(fallo instanceof ApiError ? fallo.message : 'No se pudo restablecer la contraseña.');
    } finally {
      setReseteando(false);
    }
  };

  const esPropiaCuenta = editando?.id_usuario === usuario?.idUsuario;
  const requisitos = requisitosContrasena(form.contrasena);

  return (
    <div className="admin-inv admin-usuarios">
      <header className="admin-inv__head">
        <div>
          <p className="admin-inv__eyebrow">Administración</p>
          <h1>Usuarios y roles</h1>
          <p className="admin-inv__subtitulo">
            Alta de usuarios, asignación de roles y control de cuentas. Los cambios se aplican al
            instante en el inicio de sesión.
          </p>
        </div>
        <div className="admin-inv__acciones">
          <Link className="btn btn--outline" to="/admin">
            Volver al panel
          </Link>
          <button type="button" className="btn" onClick={abrirNuevo}>
            + Nuevo usuario
          </button>
        </div>
      </header>

      <section className="admin-inv__alertas" aria-label="Resumen de usuarios">
        <div className="alerta alerta--valor">
          <span className="alerta__valor">{resumen.total}</span>
          <span className="alerta__texto">Usuarios registrados</span>
        </div>
        <div className="alerta alerta--ok">
          <span className="alerta__valor">{resumen.activos}</span>
          <span className="alerta__texto">Cuentas activas</span>
        </div>
        <div className="alerta">
          <span className="alerta__valor">{resumen.admins}</span>
          <span className="alerta__texto">Administradores</span>
        </div>
        <div className="alerta">
          <span className="alerta__valor">{resumen.clientes}</span>
          <span className="alerta__texto">Clientes</span>
        </div>
      </section>

      {aviso && (
        <p className="admin-inv__aviso" role="status">
          {aviso}
        </p>
      )}
      {error && (
        <p className="pedidos-page__error" role="alert">
          {error}
        </p>
      )}

      {formAbierto && (
        <section className="panel admin-inv__form" aria-labelledby="form-usuario">
          <div className="admin-inv__form-head">
            <h2 id="form-usuario">{editando ? 'Editar usuario' : 'Nuevo usuario'}</h2>
            <button type="button" className="admin-inv__cerrar" onClick={cerrarForm} aria-label="Cerrar formulario">
              ✕
            </button>
          </div>

          <form onSubmit={guardar} noValidate>
            <div className="admin-inv__campos">
              <label className="field">
                <span>Nombre completo</span>
                <input
                  value={form.nombre}
                  onChange={(evento) => setForm({ ...form, nombre: evento.target.value })}
                  autoComplete="name"
                />
                {erroresForm.nombre && <em className="config-page__campo-error">{erroresForm.nombre}</em>}
              </label>

              <label className="field">
                <span>Nombre de usuario</span>
                <input
                  value={form.nombre_usuario}
                  onChange={(evento) => setForm({ ...form, nombre_usuario: evento.target.value })}
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                />
                {erroresForm.nombre_usuario && (
                  <em className="config-page__campo-error">{erroresForm.nombre_usuario}</em>
                )}
              </label>

              <label className="field">
                <span>Correo electrónico</span>
                <input
                  type="email"
                  value={form.correo}
                  onChange={(evento) => setForm({ ...form, correo: evento.target.value })}
                  autoComplete="off"
                />
                {erroresForm.correo && <em className="config-page__campo-error">{erroresForm.correo}</em>}
              </label>

              <label className="field">
                <span>Teléfono (10 dígitos)</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={form.telefono}
                  onChange={(evento) =>
                    setForm({ ...form, telefono: soloDigitos(evento.target.value).slice(0, 10) })
                  }
                  autoComplete="off"
                />
                {erroresForm.telefono && (
                  <em className="config-page__campo-error">{erroresForm.telefono}</em>
                )}
              </label>

              <label className="field">
                <span>Rol</span>
                <select
                  value={form.rol}
                  onChange={(evento) => setForm({ ...form, rol: evento.target.value })}
                  disabled={esPropiaCuenta}
                >
                  {ORDEN_ROLES.map((rol) => (
                    <option key={rol} value={rol}>
                      {etiquetaRol(rol)}
                    </option>
                  ))}
                  {roles
                    .filter((rol) => !ORDEN_ROLES.includes(rol.nombre.toUpperCase() as Rol))
                    .map((rol) => (
                      <option key={rol.id_rol} value={rol.nombre.toUpperCase()}>
                        {rol.nombre}
                      </option>
                    ))}
                </select>
                {erroresForm.rol && <em className="config-page__campo-error">{erroresForm.rol}</em>}
                {esPropiaCuenta && (
                  <em className="config-page__ayuda">No puedes quitarte el rol de administrador.</em>
                )}
              </label>

              {!editando && (
                <label className="field">
                  <span>Contraseña inicial</span>
                  <input
                    type="password"
                    value={form.contrasena}
                    onChange={(evento) => setForm({ ...form, contrasena: evento.target.value })}
                    autoComplete="new-password"
                  />
                  {erroresForm.contrasena && (
                    <em className="config-page__campo-error">{erroresForm.contrasena}</em>
                  )}
                </label>
              )}

              <label className="config-check config-check--compact">
                <input
                  type="checkbox"
                  checked={form.activo}
                  disabled={esPropiaCuenta}
                  onChange={() => setForm({ ...form, activo: !form.activo })}
                />
                <span>
                  <strong>Cuenta activa</strong>
                  <em>Puede iniciar sesión y comprar.</em>
                </span>
              </label>
            </div>

            {!editando && (
              <ul className="auth-requisitos auth-requisitos--claro">
                {requisitos.map((requisito) => (
                  <li
                    key={requisito.clave}
                    className={requisito.cumple ? 'auth-requisito auth-requisito--ok' : 'auth-requisito'}
                  >
                    <span aria-hidden="true">{requisito.cumple ? '✓' : '○'}</span> {requisito.etiqueta}
                  </li>
                ))}
              </ul>
            )}

            <div className="admin-inv__form-acciones">
              <button type="submit" className="btn" disabled={guardando}>
                {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear usuario'}
              </button>
              <button type="button" className="btn btn--outline" onClick={cerrarForm}>
                Cancelar
              </button>
            </div>
          </form>
        </section>
      )}

      {resetUsuario && (
        <section className="panel admin-inv__form" aria-labelledby="form-reset">
          <div className="admin-inv__form-head">
            <h2 id="form-reset">Restablecer contraseña · {resetUsuario.nombre_usuario}</h2>
            <button
              type="button"
              className="admin-inv__cerrar"
              onClick={() => setResetUsuario(null)}
              aria-label="Cerrar formulario"
            >
              ✕
            </button>
          </div>
          <form onSubmit={guardarReset} noValidate>
            <div className="admin-inv__campos">
              <label className="field">
                <span>Nueva contraseña</span>
                <input
                  type="password"
                  value={resetClave}
                  onChange={(evento) => setResetClave(evento.target.value)}
                  autoComplete="new-password"
                />
                {resetError && <em className="config-page__campo-error">{resetError}</em>}
              </label>
            </div>
            <ul className="auth-requisitos auth-requisitos--claro">
              {requisitosContrasena(resetClave).map((requisito) => (
                <li
                  key={requisito.clave}
                  className={requisito.cumple ? 'auth-requisito auth-requisito--ok' : 'auth-requisito'}
                >
                  <span aria-hidden="true">{requisito.cumple ? '✓' : '○'}</span> {requisito.etiqueta}
                </li>
              ))}
            </ul>
            <div className="admin-inv__form-acciones">
              <button type="submit" className="btn" disabled={reseteando}>
                {reseteando ? 'Actualizando…' : 'Restablecer contraseña'}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="panel admin-inv__tabla-wrap">
        <div className="admin-inv__toolbar">
          <label className="admin-inv__buscar">
            <span>Buscar usuario</span>
            <input
              type="search"
              placeholder="Nombre, usuario o correo…"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
            />
          </label>
          <div className="admin-inv__chips" role="group" aria-label="Filtrar por rol">
            <button
              type="button"
              className={filtroRol === 'todos' ? 'chip chip--on' : 'chip'}
              onClick={() => setFiltroRol('todos')}
            >
              Todos
            </button>
            {ORDEN_ROLES.map((rol) => (
              <button
                key={rol}
                type="button"
                className={filtroRol === rol ? 'chip chip--on' : 'chip'}
                onClick={() => setFiltroRol(rol)}
              >
                {etiquetaRol(rol)}
              </button>
            ))}
          </div>
          <span className="admin-inv__conteo">
            {filtrados.length} de {usuarios.length}
          </span>
        </div>

        {cargando ? (
          <p className="state" aria-live="polite">
            Cargando usuarios…
          </p>
        ) : (
          <table className="admin-inv__tabla">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Último acceso</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((item) => (
                <tr key={item.id_usuario}>
                  <td>
                    <div className="admin-usuarios__persona">
                      <span className="admin-usuarios__avatar" aria-hidden="true">
                        {inicialesDe(item.nombre) || item.nombre_usuario.slice(0, 1).toUpperCase()}
                      </span>
                      <span>
                        <strong>{item.nombre}</strong>
                        <em>@{item.nombre_usuario}</em>
                      </span>
                    </div>
                  </td>
                  <td>{item.correo}</td>
                  <td>
                    <span className={`role role--${item.rol.toLowerCase()}`}>{etiquetaRol(item.rol)}</span>
                  </td>
                  <td>
                    <span className={item.activo ? 'pill pill--ok' : 'pill pill--bajo'}>
                      {item.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td>{formatearFecha(item.ultimo_acceso)}</td>
                  <td>
                    <div className="admin-inv__fila-acciones">
                      <button type="button" className="btn-mini" onClick={() => abrirEdicion(item)}>
                        Editar
                      </button>
                      <button type="button" className="btn-mini" onClick={() => abrirReset(item)}>
                        Contraseña
                      </button>
                      <button
                        type="button"
                        className={
                          item.activo ? 'btn-mini btn-mini--peligro' : 'btn-mini'
                        }
                        onClick={() => void alternarActivo(item)}
                        disabled={item.id_usuario === usuario?.idUsuario}
                      >
                        {item.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!cargando && filtrados.length === 0 && (
          <p className="state">No hay usuarios que coincidan con la búsqueda.</p>
        )}
      </section>
    </div>
  );
}
