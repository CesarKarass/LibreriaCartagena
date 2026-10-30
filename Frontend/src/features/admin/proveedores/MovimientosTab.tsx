import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../../../services/api';
import {
  listarProveedores,
  registrarDevolucionProveedor,
  registrarMerma,
} from '../../../services/proveedoresService';
import type { Proveedor } from '../../../types/proveedores';
import { useLibrosInventario } from './useLibrosInventario';

interface FormMerma {
  id_libro: string;
  cantidad: string;
  referencia: string;
}

interface FormDevolucion {
  id_proveedor: string;
  id_libro: string;
  cantidad: string;
  motivo: string;
  referencia: string;
}

const MERMA_VACIA: FormMerma = { id_libro: '', cantidad: '1', referencia: '' };
const DEVOLUCION_VACIA: FormDevolucion = {
  id_proveedor: '',
  id_libro: '',
  cantidad: '1',
  motivo: '',
  referencia: '',
};

export default function MovimientosTab({ token }: { token: string | null }) {
  const { libros, cargando: cargandoLibros, error: errorLibros, recargar } = useLibrosInventario(token);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const [merma, setMerma] = useState<FormMerma>(MERMA_VACIA);
  const [enviandoMerma, setEnviandoMerma] = useState(false);

  const [devolucion, setDevolucion] = useState<FormDevolucion>(DEVOLUCION_VACIA);
  const [enviandoDevolucion, setEnviandoDevolucion] = useState(false);

  const cargarProveedores = useCallback(async () => {
    if (!token) return;
    try {
      setProveedores(await listarProveedores(token));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cargar el directorio de proveedores.');
    }
  }, [token]);

  useEffect(() => {
    void cargarProveedores();
  }, [cargarProveedores]);

  const stockDe = (idLibro: string) => libros.find((l) => l.id_libro === idLibro)?.stock ?? 0;

  const guardarMerma = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token || enviandoMerma) return;
    setError(null);
    setAviso(null);

    const cantidad = Number(merma.cantidad);
    const referencia = merma.referencia.trim();
    if (!merma.id_libro) {
      setError('Selecciona el libro que sufrió la merma.');
      return;
    }
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      setError('La cantidad de la merma debe ser un entero mayor a cero.');
      return;
    }
    if (cantidad > stockDe(merma.id_libro)) {
      setError(`El stock disponible de ese libro es ${stockDe(merma.id_libro)}.`);
      return;
    }
    if (referencia.length < 5 || referencia.length > 100) {
      setError('La referencia de la merma debe tener entre 5 y 100 caracteres.');
      return;
    }

    setEnviandoMerma(true);
    try {
      await registrarMerma({ id_libro: merma.id_libro, cantidad, referencia }, token);
      setAviso(
        `Merma registrada: ${cantidad} unidad(es) de ${merma.id_libro}. Referencia ${referencia}.`,
      );
      setMerma(MERMA_VACIA);
      await recargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo registrar la merma.');
    } finally {
      setEnviandoMerma(false);
    }
  };

  const guardarDevolucion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token || enviandoDevolucion) return;
    setError(null);
    setAviso(null);

    const cantidad = Number(devolucion.cantidad);
    const referencia = devolucion.referencia.trim();
    const motivo = devolucion.motivo.trim();
    if (!devolucion.id_proveedor) {
      setError('Selecciona el proveedor al que se devuelve el material.');
      return;
    }
    if (!devolucion.id_libro) {
      setError('Selecciona el libro que se devuelve.');
      return;
    }
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      setError('La cantidad a devolver debe ser un entero mayor a cero.');
      return;
    }
    if (cantidad > stockDe(devolucion.id_libro)) {
      setError(`El stock disponible de ese libro es ${stockDe(devolucion.id_libro)}.`);
      return;
    }
    if (!motivo) {
      setError('Escribe el motivo de la devolución.');
      return;
    }
    if (referencia.length < 8 || referencia.length > 100) {
      setError('La referencia de la devolución debe tener entre 8 y 100 caracteres.');
      return;
    }

    setEnviandoDevolucion(true);
    try {
      const res = await registrarDevolucionProveedor(
        {
          id_proveedor: Number(devolucion.id_proveedor),
          id_libro: devolucion.id_libro,
          cantidad,
          motivo,
          referencia,
        },
        token,
      );
      setAviso(`Devolución #${res.id_devolucion} registrada y descontada del inventario.`);
      setDevolucion(DEVOLUCION_VACIA);
      await recargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo registrar la devolución.');
    } finally {
      setEnviandoDevolucion(false);
    }
  };

  return (
    <div className="admin-prov__panel">
      {aviso && <p className="admin-inv__aviso" role="status">{aviso}</p>}
      {error && <p className="checkout__error" role="alert">{error}</p>}
      {errorLibros && <p className="checkout__error" role="alert">{errorLibros}</p>}

      <div className="admin-prov__dos">
        {/* ---------- Merma ---------- */}
        <form className="panel" onSubmit={guardarMerma}>
          <h2>Registrar merma</h2>
          <p className="admin-prov__nota">
            Pérdida, daño o robo de ejemplares. Descuenta unidades del inventario y queda como
            movimiento <strong>MERMA</strong>.
          </p>

          <label className="field">
            <span>Libro *</span>
            <select
              value={merma.id_libro}
              onChange={(e) => setMerma((prev) => ({ ...prev, id_libro: e.target.value }))}
              required
              disabled={cargandoLibros}
            >
              <option value="">— Selecciona un libro —</option>
              {libros.map((libro) => (
                <option key={libro.id_libro} value={libro.id_libro}>
                  {libro.id_libro} · {libro.titulo} (stock {libro.stock})
                </option>
              ))}
            </select>
          </label>

          <label className="field field--corto">
            <span>Cantidad *</span>
            <input
              value={merma.cantidad}
              onChange={(e) => setMerma((prev) => ({ ...prev, cantidad: e.target.value }))}
              inputMode="numeric"
              min={1}
              required
            />
          </label>

          <label className="field">
            <span>Referencia *</span>
            <input
              value={merma.referencia}
              onChange={(e) => setMerma((prev) => ({ ...prev, referencia: e.target.value }))}
              placeholder="MERMA-2026-001"
              minLength={5}
              maxLength={100}
              required
            />
            <small className="admin-prov__ayuda">
              Entre 5 y 100 caracteres. {merma.referencia.trim().length}/100
            </small>
          </label>

          <button type="submit" className="btn" disabled={enviandoMerma || cargandoLibros}>
            {enviandoMerma ? 'Registrando…' : 'Registrar merma'}
          </button>
        </form>

        {/* ---------- Devolución a proveedor ---------- */}
        <form className="panel" onSubmit={guardarDevolucion}>
          <h2>Devolución a proveedor</h2>
          <p className="admin-prov__nota">
            Material defectuoso o no solicitado que regresa al proveedor. Descuenta stock y guarda
            el movimiento <strong>DEVOLUCION_PROVEEDOR</strong>.
          </p>

          <label className="field">
            <span>Proveedor *</span>
            <select
              value={devolucion.id_proveedor}
              onChange={(e) => setDevolucion((prev) => ({ ...prev, id_proveedor: e.target.value }))}
              required
            >
              <option value="">— Selecciona un proveedor —</option>
              {proveedores.map((proveedor) => (
                <option key={proveedor.id} value={proveedor.id}>
                  {proveedor.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Libro *</span>
            <select
              value={devolucion.id_libro}
              onChange={(e) => setDevolucion((prev) => ({ ...prev, id_libro: e.target.value }))}
              required
              disabled={cargandoLibros}
            >
              <option value="">— Selecciona un libro —</option>
              {libros.map((libro) => (
                <option key={libro.id_libro} value={libro.id_libro}>
                  {libro.id_libro} · {libro.titulo} (stock {libro.stock})
                </option>
              ))}
            </select>
          </label>

          <label className="field field--corto">
            <span>Cantidad *</span>
            <input
              value={devolucion.cantidad}
              onChange={(e) => setDevolucion((prev) => ({ ...prev, cantidad: e.target.value }))}
              inputMode="numeric"
              min={1}
              required
            />
          </label>

          <label className="field">
            <span>Motivo *</span>
            <input
              value={devolucion.motivo}
              onChange={(e) => setDevolucion((prev) => ({ ...prev, motivo: e.target.value }))}
              placeholder="Ejemplares con encuadernación defectuosa"
              maxLength={255}
              required
            />
          </label>

          <label className="field">
            <span>Referencia *</span>
            <input
              value={devolucion.referencia}
              onChange={(e) => setDevolucion((prev) => ({ ...prev, referencia: e.target.value }))}
              placeholder="DEV-2026-0001"
              minLength={8}
              maxLength={100}
              required
            />
            <small className="admin-prov__ayuda">
              Entre 8 y 100 caracteres. {devolucion.referencia.trim().length}/100
            </small>
          </label>

          <button type="submit" className="btn" disabled={enviandoDevolucion || cargandoLibros}>
            {enviandoDevolucion ? 'Registrando…' : 'Registrar devolución'}
          </button>
        </form>
      </div>
    </div>
  );
}
