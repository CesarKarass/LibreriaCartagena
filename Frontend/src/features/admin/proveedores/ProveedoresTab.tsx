import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError } from '../../../services/api';
import {
  actualizarProveedor,
  crearProveedor,
  eliminarProveedor,
  listarProveedores,
} from '../../../services/proveedoresService';
import type { Proveedor, ProveedorPayload } from '../../../types/proveedores';

/** El formulario trabaja siempre con texto; se normaliza antes de enviar. */
type FormProveedor = { [K in keyof ProveedorPayload]: string };

const FORM_VACIO: FormProveedor = {
  nombre: '',
  contacto: '',
  razon_social: '',
  rfc: '',
  direccion: '',
  correo: '',
  telefono: '',
};

/** Convierte el texto del formulario al cuerpo que espera el microservicio. */
function aPayload(form: FormProveedor): ProveedorPayload {
  const limpiar = (valor: string) => valor.trim() || null;
  return {
    nombre: form.nombre.trim(),
    contacto: limpiar(form.contacto),
    razon_social: limpiar(form.razon_social),
    rfc: limpiar(form.rfc)?.toUpperCase() ?? null,
    direccion: limpiar(form.direccion),
    correo: limpiar(form.correo),
    telefono: limpiar(form.telefono),
  };
}

export default function ProveedoresTab({ token }: { token: string | null }) {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [editando, setEditando] = useState<Proveedor | null>(null);
  const [form, setForm] = useState<FormProveedor>(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    if (!token) return;
    setCargando(true);
    try {
      setProveedores(await listarProveedores(token));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cargar el directorio de proveedores.');
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return proveedores;
    return proveedores.filter((p) =>
      [p.nombre, p.razon_social ?? '', p.rfc ?? '', p.contacto ?? '', p.correo ?? '', p.telefono ?? '']
        .some((texto) => texto.toLowerCase().includes(q)),
    );
  }, [proveedores, busqueda]);

  const abrirNuevo = () => {
    setEditando(null);
    setForm(FORM_VACIO);
    setFormVisible(true);
    setAviso(null);
    setError(null);
  };

  const abrirEdicion = (proveedor: Proveedor) => {
    setEditando(proveedor);
    setForm({
      nombre: proveedor.nombre,
      contacto: proveedor.contacto ?? '',
      razon_social: proveedor.razon_social ?? '',
      rfc: proveedor.rfc ?? '',
      direccion: proveedor.direccion ?? '',
      correo: proveedor.correo ?? '',
      telefono: proveedor.telefono ?? '',
    });
    setFormVisible(true);
    setAviso(null);
    setError(null);
  };

  const campo =
    (nombre: keyof ProveedorPayload) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [nombre]: e.target.value }));

  const guardar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token || guardando) return;
    setGuardando(true);
    setError(null);
    setAviso(null);
    try {
      const datos = aPayload(form);
      if (editando) {
        await actualizarProveedor(editando.id, datos, token);
        setAviso(`Proveedor "${datos.nombre}" actualizado.`);
      } else {
        await crearProveedor(datos, token);
        setAviso(`Proveedor "${datos.nombre}" registrado.`);
      }
      setFormVisible(false);
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar el proveedor.');
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (proveedor: Proveedor) => {
    if (!token) return;
    const seguro = window.confirm(
      `¿Eliminar al proveedor "${proveedor.nombre}"? Sólo es posible si no tiene compras registradas.`,
    );
    if (!seguro) return;
    try {
      await eliminarProveedor(proveedor.id, token);
      setAviso(`Proveedor "${proveedor.nombre}" eliminado.`);
      setError(null);
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar el proveedor.');
    }
  };

  return (
    <div className="admin-prov__panel">
      {aviso && <p className="admin-inv__aviso" role="status">{aviso}</p>}
      {error && <p className="checkout__error" role="alert">{error}</p>}

      <div className="admin-inv__toolbar">
        <label className="admin-inv__buscar">
          <span>Buscar proveedor</span>
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Nombre, razón social, RFC, contacto…"
          />
        </label>
        <button type="button" className="btn" onClick={abrirNuevo}>
          + Nuevo proveedor
        </button>
        <span className="admin-inv__conteo">
          {visibles.length} de {proveedores.length} proveedores
        </span>
      </div>

      {formVisible && (
        <form className="panel admin-inv__form" onSubmit={guardar}>
          <div className="admin-inv__form-head">
            <h2>{editando ? `Editar proveedor #${editando.id}` : 'Nuevo proveedor'}</h2>
            <button
              type="button"
              className="admin-inv__cerrar"
              onClick={() => setFormVisible(false)}
              aria-label="Cerrar formulario"
            >
              ✕
            </button>
          </div>

          <div className="admin-inv__campos">
            <label className="field">
              <span>Nombre *</span>
              <input value={form.nombre} onChange={campo('nombre')} required maxLength={150} />
            </label>
            <label className="field">
              <span>Razón social</span>
              <input value={form.razon_social} onChange={campo('razon_social')} maxLength={150} />
            </label>
            <label className="field field--corto">
              <span>RFC</span>
              <input
                value={form.rfc}
                onChange={campo('rfc')}
                maxLength={13}
                placeholder="XAXX010101000"
              />
            </label>
            <label className="field field--corto">
              <span>Teléfono</span>
              <input value={form.telefono} onChange={campo('telefono')} maxLength={50} />
            </label>
            <label className="field">
              <span>Contacto</span>
              <input value={form.contacto} onChange={campo('contacto')} maxLength={150} />
            </label>
            <label className="field">
              <span>Correo</span>
              <input type="email" value={form.correo} onChange={campo('correo')} maxLength={150} />
            </label>
            <label className="field field--ancho">
              <span>Dirección</span>
              <input value={form.direccion} onChange={campo('direccion')} maxLength={255} />
            </label>
          </div>

          <div className="admin-inv__form-acciones">
            <button type="submit" className="btn" disabled={guardando}>
              {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Registrar proveedor'}
            </button>
            <button type="button" className="btn btn--outline" onClick={() => setFormVisible(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="panel admin-inv__tabla-wrap">
        {cargando ? (
          <p className="state">Cargando proveedores…</p>
        ) : visibles.length === 0 ? (
          <p className="state">
            {proveedores.length === 0
              ? 'Todavía no hay proveedores registrados.'
              : 'Ningún proveedor coincide con la búsqueda.'}
          </p>
        ) : (
          <table className="admin-inv__tabla">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Proveedor</th>
                <th scope="col">RFC</th>
                <th scope="col">Contacto</th>
                <th scope="col">Correo / Teléfono</th>
                <th scope="col">Dirección</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((proveedor) => (
                <tr key={proveedor.id}>
                  <td className="admin-inv__clave">{proveedor.id}</td>
                  <td>
                    <strong>{proveedor.nombre}</strong>
                    {proveedor.razon_social && (
                      <span className="admin-inv__autor">{proveedor.razon_social}</span>
                    )}
                  </td>
                  <td>{proveedor.rfc ?? '—'}</td>
                  <td>{proveedor.contacto ?? '—'}</td>
                  <td>
                    {proveedor.correo ?? '—'}
                    <span className="admin-inv__rango">{proveedor.telefono ?? 'Sin teléfono'}</span>
                  </td>
                  <td>{proveedor.direccion ?? '—'}</td>
                  <td>
                    <div className="admin-inv__fila-acciones">
                      <button type="button" className="btn-mini" onClick={() => abrirEdicion(proveedor)}>
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn-mini btn-mini--peligro"
                        onClick={() => void eliminar(proveedor)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
