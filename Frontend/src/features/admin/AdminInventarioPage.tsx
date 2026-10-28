import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ApiError, apiBlob, apiDelete, apiGet, apiPatch, apiPost } from '../../services/api';
import type { LibroInventario, ResumenInventario } from '../../types/book';

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

type FiltroAlerta = 'todos' | 'bajo' | 'alto';

interface LibroForm {
  id_libro: string;
  titulo: string;
  autor: string;
  precio: string;
  stock: string;
  stock_minimo: string;
  stock_maximo: string;
  descuento_porcentaje: string;
  isbn: string;
  editorial: string;
  categoria: string;
  genero: string;
  formato: string;
  imagen_portada: string;
  descripcion: string;
}

const FORM_VACIO: LibroForm = {
  id_libro: '',
  titulo: '',
  autor: '',
  precio: '',
  stock: '1',
  stock_minimo: '3',
  stock_maximo: '50',
  descuento_porcentaje: '0',
  isbn: '',
  editorial: '',
  categoria: '',
  genero: '',
  formato: 'Tapa blanda',
  imagen_portada: '',
  descripcion: '',
};

const ETIQUETA_ALERTA: Record<LibroInventario['alerta'], string> = {
  bajo: 'Stock mínimo',
  alto: 'Stock máximo',
  ok: 'Normal',
};

export default function AdminInventarioPage() {
  const { token } = useAuth();
  const [libros, setLibros] = useState<LibroInventario[]>([]);
  const [resumen, setResumen] = useState<ResumenInventario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<FiltroAlerta>('todos');

  const [formVisible, setFormVisible] = useState(false);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState<LibroForm>(FORM_VACIO);
  const [descuentoOriginal, setDescuentoOriginal] = useState('0');
  const [guardando, setGuardando] = useState(false);
  const [descargando, setDescargando] = useState(false);

  const cargar = useCallback(async () => {
    if (!token) return;
    setCargando(true);
    try {
      const res = await apiGet<{ data: LibroInventario[]; resumen: ResumenInventario }>(
        '/admin/inventario',
        undefined,
        token,
      );
      setLibros(res.data ?? []);
      setResumen(res.resumen ?? null);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cargar el inventario.');
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return libros.filter((l) => {
      if (filtro !== 'todos' && l.alerta !== filtro) return false;
      if (!q) return true;
      return [l.id_libro, l.titulo, l.autor, l.isbn ?? ''].some((t) =>
        t.toLowerCase().includes(q),
      );
    });
  }, [libros, busqueda, filtro]);

  const siguienteId = useCallback(() => {
    const nums = libros
      .map((l) => Number((/LIB-(\d+)$/i.exec(l.id_libro) ?? [])[1]))
      .filter((n) => Number.isFinite(n));
    const siguiente = (nums.length ? Math.max(...nums) : 0) + 1;
    return `LIB-${String(siguiente).padStart(3, '0')}`;
  }, [libros]);

  const abrirNuevo = () => {
    setEditando(false);
    setForm({ ...FORM_VACIO, id_libro: siguienteId() });
    setDescuentoOriginal('0');
    setFormVisible(true);
    setAviso(null);
    setError(null);
  };

  const abrirEdicion = (libro: LibroInventario) => {
    setEditando(true);
    setDescuentoOriginal(libro.descuento_porcentaje);
    setForm({
      id_libro: libro.id_libro,
      titulo: libro.titulo,
      autor: libro.autor,
      precio: libro.precio,
      stock: String(libro.stock),
      stock_minimo: String(libro.stock_minimo),
      stock_maximo: String(libro.stock_maximo),
      descuento_porcentaje: libro.descuento_porcentaje,
      isbn: libro.isbn ?? '',
      editorial: libro.editorial ?? '',
      categoria: libro.categoria ?? '',
      genero: libro.genero ?? '',
      formato: libro.formato ?? '',
      imagen_portada: libro.imagen_portada ?? '',
      descripcion: libro.descripcion ?? '',
    });
    setFormVisible(true);
    setAviso(null);
    setError(null);
  };

  const campo = (nombre: keyof LibroForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [nombre]: e.target.value }));

  const guardar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token || guardando) return;
    setGuardando(true);
    setError(null);
    setAviso(null);
    try {
      const numeros = (valor: string, predeterminado: number) => {
        const n = Number(valor);
        return Number.isFinite(n) ? n : predeterminado;
      };
      const datos: Record<string, unknown> = {
        titulo: form.titulo.trim(),
        autor: form.autor.trim(),
        precio: numeros(form.precio, 0),
        stock: numeros(form.stock, 0),
        stock_minimo: numeros(form.stock_minimo, 0),
        stock_maximo: numeros(form.stock_maximo, 0),
        isbn: form.isbn.trim() || null,
        editorial: form.editorial.trim() || null,
        categoria: form.categoria.trim() || null,
        genero: form.genero.trim() || null,
        formato: form.formato.trim() || null,
        imagen_portada: form.imagen_portada.trim() || null,
        descripcion: form.descripcion.trim() || null,
      };
      // El backend sólo permite cambiar el descuento si el stock supera las 10 unidades,
      // por eso sólo se envía cuando el administrador lo modificó.
      const descuentoCambio = form.descuento_porcentaje !== descuentoOriginal;
      if (!editando || descuentoCambio) {
        datos.descuento_porcentaje = numeros(form.descuento_porcentaje, 0);
      }
      if (editando) {
        await apiPatch(`/libros/${encodeURIComponent(form.id_libro)}`, datos, token);
        setAviso(`Libro "${datos.titulo}" actualizado.`);
      } else {
        await apiPost('/libros', { id_libro: form.id_libro.trim(), ...datos }, token);
        setAviso(`Libro "${datos.titulo}" agregado al inventario.`);
      }
      setFormVisible(false);
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar el libro.');
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (libro: LibroInventario) => {
    if (!token) return;
    const seguro = window.confirm(`¿Eliminar "${libro.titulo}" del inventario? Esta acción no se puede deshacer.`);
    if (!seguro) return;
    try {
      await apiDelete(`/libros/${encodeURIComponent(libro.id_libro)}`, token);
      setAviso(`Libro "${libro.titulo}" eliminado.`);
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar el libro.');
    }
  };

  const aplicarDescuento = async (libro: LibroInventario) => {
    if (!token) return;
    const actual = Number(libro.descuento_porcentaje) || 0;
    const respuesta = window.prompt(
      `Descuento para "${libro.titulo}" (% de 0 a 100):`,
      String(actual),
    );
    if (respuesta === null) return;
    const valor = Number(respuesta);
    if (!Number.isFinite(valor) || valor < 0 || valor > 100) {
      setError('El descuento debe ser un número entre 0 y 100.');
      return;
    }
    try {
      await apiPatch(`/libros/${encodeURIComponent(libro.id_libro)}`, { descuento_porcentaje: valor }, token);
      setAviso(
        valor > 0
          ? `Descuento del ${valor}% aplicado a "${libro.titulo}".`
          : `Descuento retirado de "${libro.titulo}".`,
      );
      setError(null);
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo aplicar el descuento.');
    }
  };

  const descargarReporte = async () => {
    if (!token || descargando) return;
    setDescargando(true);
    setError(null);
    try {
      const blob = await apiBlob('/admin/inventario/reporte.pdf', token);
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = 'reporte-inventario.pdf';
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      URL.revokeObjectURL(url);
      setAviso('Reporte PDF descargado.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo generar el reporte PDF.');
    } finally {
      setDescargando(false);
    }
  };

  return (
    <section className="admin-inv">
      <header className="admin-inv__head">
        <div>
          <p className="admin-inv__eyebrow">Panel de administración</p>
          <h1>CRUD de Inventario y Alertas</h1>
          <p className="admin-inv__subtitulo">
            Da de alta, edita y descarta libros, aplica descuentos y vigila el stock mínimo y máximo.
          </p>
        </div>
        <div className="admin-inv__acciones">
          <button type="button" className="btn" onClick={abrirNuevo}>
            + Nuevo libro
          </button>
          <button
            type="button"
            className="btn btn--outline"
            onClick={() => void descargarReporte()}
            disabled={descargando}
          >
            {descargando ? 'Generando…' : '⬇ Reporte PDF'}
          </button>
          <Link to="/admin" className="btn btn--outline">Volver al panel</Link>
        </div>
      </header>

      {/* ---------- Alertas ---------- */}
      <div className="admin-inv__alertas" aria-label="Alertas de stock">
        <article className="alerta alerta--ok">
          <span className="alerta__valor">{resumen?.titulos ?? '—'}</span>
          <span className="alerta__texto">Títulos en catálogo</span>
        </article>
        <article className="alerta alerta--ok">
          <span className="alerta__valor">{resumen?.unidades ?? '—'}</span>
          <span className="alerta__texto">Unidades en existencia</span>
        </article>
        <article className={`alerta${(resumen?.bajo_stock ?? 0) > 0 ? ' alerta--bajo' : ''}`}>
          <span className="alerta__valor">{resumen?.bajo_stock ?? '—'}</span>
          <span className="alerta__texto">⚠ Libros en stock mínimo</span>
        </article>
        <article className={`alerta${(resumen?.sobre_stock ?? 0) > 0 ? ' alerta--alto' : ''}`}>
          <span className="alerta__valor">{resumen?.sobre_stock ?? '—'}</span>
          <span className="alerta__texto">↑ Libros en stock máximo</span>
        </article>
        <article className="alerta alerta--valor">
          <span className="alerta__valor">
            {resumen ? money.format(Number(resumen.valor_inventario)) : '—'}
          </span>
          <span className="alerta__texto">Valor del inventario</span>
        </article>
      </div>

      {aviso && <p className="admin-inv__aviso" role="status">{aviso}</p>}
      {error && <p className="checkout__error" role="alert">{error}</p>}

      {/* ---------- Formulario CRUD ---------- */}
      {formVisible && (
        <form className="panel admin-inv__form" onSubmit={guardar}>
          <div className="admin-inv__form-head">
            <h2>{editando ? `Editar libro ${form.id_libro}` : `Nuevo libro ${form.id_libro}`}</h2>
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
              <span>Título *</span>
              <input value={form.titulo} onChange={campo('titulo')} required />
            </label>
            <label className="field">
              <span>Autor *</span>
              <input value={form.autor} onChange={campo('autor')} required />
            </label>
            <label className="field field--corto">
              <span>Precio *</span>
              <input value={form.precio} onChange={campo('precio')} inputMode="decimal" required />
            </label>
            <label className="field field--corto">
              <span>Stock *</span>
              <input value={form.stock} onChange={campo('stock')} inputMode="numeric" required />
            </label>
            <label className="field field--corto">
              <span>Stock mínimo</span>
              <input value={form.stock_minimo} onChange={campo('stock_minimo')} inputMode="numeric" />
            </label>
            <label className="field field--corto">
              <span>Stock máximo</span>
              <input value={form.stock_maximo} onChange={campo('stock_maximo')} inputMode="numeric" />
            </label>
            <label className="field field--corto">
              <span>Descuento %</span>
              <input
                value={form.descuento_porcentaje}
                onChange={campo('descuento_porcentaje')}
                inputMode="decimal"
                min={0}
                max={100}
              />
            </label>
            <label className="field">
              <span>ISBN</span>
              <input value={form.isbn} onChange={campo('isbn')} />
            </label>
            <label className="field">
              <span>Editorial</span>
              <input value={form.editorial} onChange={campo('editorial')} />
            </label>
            <label className="field">
              <span>Categoría</span>
              <input value={form.categoria} onChange={campo('categoria')} />
            </label>
            <label className="field">
              <span>Género</span>
              <input value={form.genero} onChange={campo('genero')} />
            </label>
            <label className="field">
              <span>Formato</span>
              <input value={form.formato} onChange={campo('formato')} />
            </label>
            <label className="field field--ancho">
              <span>Ruta de la portada</span>
              <input
                value={form.imagen_portada}
                onChange={campo('imagen_portada')}
                placeholder="/images/libros/mi-libro.jpg"
              />
            </label>
            <label className="field field--ancho">
              <span>Descripción</span>
              <textarea value={form.descripcion} onChange={campo('descripcion')} rows={3} />
            </label>
          </div>

          <div className="admin-inv__form-acciones">
            <button type="submit" className="btn" disabled={guardando}>
              {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear libro'}
            </button>
            <button type="button" className="btn btn--outline" onClick={() => setFormVisible(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* ---------- Barra de herramientas ---------- */}
      <div className="admin-inv__toolbar">
        <label className="admin-inv__buscar">
          <span>Buscar</span>
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Título, autor, ISBN o clave…"
          />
        </label>
        <div className="admin-inv__chips" role="group" aria-label="Filtrar por alerta">
          {(['todos', 'bajo', 'alto'] as FiltroAlerta[]).map((clave) => (
            <button
              key={clave}
              type="button"
              className={`chip${filtro === clave ? ' chip--on' : ''}`}
              onClick={() => setFiltro(clave)}
            >
              {clave === 'todos' ? 'Todos' : clave === 'bajo' ? '⚠ Stock mínimo' : '↑ Stock máximo'}
            </button>
          ))}
        </div>
        <span className="admin-inv__conteo">
          {visibles.length} de {libros.length} libros
        </span>
      </div>

      {/* ---------- Tabla ---------- */}
      <div className="panel admin-inv__tabla-wrap">
        {cargando ? (
          <p className="state">Cargando inventario…</p>
        ) : visibles.length === 0 ? (
          <p className="state">No hay libros que coincidan con el filtro.</p>
        ) : (
          <table className="admin-inv__tabla">
            <thead>
              <tr>
                <th scope="col">Clave</th>
                <th scope="col">Título / Autor</th>
                <th scope="col" className="num">Precio</th>
                <th scope="col" className="num">Descuento</th>
                <th scope="col" className="num">Stock</th>
                <th scope="col">Alerta</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((libro) => (
                <tr key={libro.id_libro}>
                  <td className="admin-inv__clave">{libro.id_libro}</td>
                  <td>
                    <strong>{libro.titulo}</strong>
                    <span className="admin-inv__autor">{libro.autor}</span>
                  </td>
                  <td className="num">
                    {money.format(Number(libro.precio_oferta))}
                    {Number(libro.descuento_porcentaje) > 0 && (
                      <s>{money.format(Number(libro.precio))}</s>
                    )}
                  </td>
                  <td className="num">
                    {Number(libro.descuento_porcentaje) > 0
                      ? `${Number(libro.descuento_porcentaje).toFixed(0)}%`
                      : '—'}
                  </td>
                  <td className="num">
                    <strong>{libro.stock}</strong>
                    <span className="admin-inv__rango">
                      min {libro.stock_minimo} / máx {libro.stock_maximo}
                    </span>
                  </td>
                  <td>
                    <span className={`pill pill--${libro.alerta}`}>
                      {ETIQUETA_ALERTA[libro.alerta]}
                    </span>
                  </td>
                  <td>
                    <div className="admin-inv__fila-acciones">
                      <button type="button" className="btn-mini" onClick={() => abrirEdicion(libro)}>
                        Editar
                      </button>
                      <button type="button" className="btn-mini" onClick={() => void aplicarDescuento(libro)}>
                        Descuento
                      </button>
                      <button
                        type="button"
                        className="btn-mini btn-mini--peligro"
                        onClick={() => void eliminar(libro)}
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
    </section>
  );
}
