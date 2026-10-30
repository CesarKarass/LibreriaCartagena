import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError } from '../../../services/api';
import {
  crearOrdenCompra,
  listarOrdenesCompra,
  listarProveedores,
  obtenerOrdenCompra,
  recibirOrdenCompra,
} from '../../../services/proveedoresService';
import type { LibroInventario } from '../../../types/book';
import type {
  LineaNuevaOrden,
  OrdenCompra,
  OrdenCompraDetalle,
  Proveedor,
} from '../../../types/proveedores';
import { claseEstado, fecha, importe, tinteEstado } from './comun';
import { useLibrosInventario } from './useLibrosInventario';

type FiltroEstado = 'todos' | 'pendiente' | 'recibido';

let contadorLineas = 0;
const nuevaClave = () => `linea-${++contadorLineas}`;

function lineaPara(libro: LibroInventario | undefined): LineaNuevaOrden {
  return {
    clave: nuevaClave(),
    id_libro: libro?.id_libro ?? '',
    cantidad: 1,
    costo_unitario: libro ? Number(libro.precio) : 0,
  };
}

export default function ComprasTab({ token }: { token: string | null }) {
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const { libros } = useLibrosInventario(token);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<FiltroEstado>('todos');

  const [formVisible, setFormVisible] = useState(false);
  const [idProveedor, setIdProveedor] = useState('');
  const [lineas, setLineas] = useState<LineaNuevaOrden[]>([]);
  const [guardando, setGuardando] = useState(false);

  const [detalle, setDetalle] = useState<OrdenCompraDetalle | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState<number | null>(null);
  const [recibiendo, setRecibiendo] = useState<number | null>(null);

  const cargar = useCallback(async () => {
    if (!token) return;
    setCargando(true);
    try {
      const [listaOrdenes, listaProveedores] = await Promise.all([
        listarOrdenesCompra(token),
        listarProveedores(token),
      ]);
      setOrdenes(listaOrdenes);
      setProveedores(listaProveedores);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar las órdenes de compra.');
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const tituloLibro = useMemo(() => {
    const mapa = new Map(libros.map((l) => [l.id_libro, l.titulo]));
    return (id: string) => mapa.get(id) ?? id;
  }, [libros]);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return ordenes.filter((orden) => {
      const estado = orden.estado.trim().toLowerCase();
      if (filtro === 'pendiente' && estado !== 'pendiente') return false;
      if (filtro === 'recibido' && estado !== 'recibido') return false;
      if (!q) return true;
      return [String(orden.id_pedido), orden.nombre].some((texto) =>
        texto.toLowerCase().includes(q),
      );
    });
  }, [ordenes, busqueda, filtro]);

  const abrirNueva = () => {
    setFormVisible(true);
    setIdProveedor(proveedores[0] ? String(proveedores[0].id) : '');
    setLineas([lineaPara(libros[0])]);
    setAviso(null);
    setError(null);
  };

  const cambiarLinea = (clave: string, cambios: Partial<LineaNuevaOrden>) =>
    setLineas((prev) =>
      prev.map((linea) => (linea.clave === clave ? { ...linea, ...cambios } : linea)),
    );

  const seleccionarLibro = (clave: string, idLibro: string) => {
    const libro = libros.find((l) => l.id_libro === idLibro);
    cambiarLinea(clave, {
      id_libro: idLibro,
      costo_unitario: libro ? Number(libro.precio) : 0,
    });
  };

  const agregarLinea = () => {
    const usados = new Set(lineas.map((l) => l.id_libro));
    const libre = libros.find((l) => !usados.has(l.id_libro));
    setLineas((prev) => [...prev, lineaPara(libre)]);
  };

  const quitarLinea = (clave: string) =>
    setLineas((prev) => prev.filter((linea) => linea.clave !== clave));

  const total = lineas.reduce(
    (suma, linea) => suma + Number(linea.cantidad || 0) * Number(linea.costo_unitario || 0),
    0,
  );

  const guardar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token || guardando) return;
    setError(null);
    setAviso(null);

    if (!idProveedor) {
      setError('Selecciona el proveedor de la orden.');
      return;
    }
    if (lineas.length === 0) {
      setError('Agrega al menos un libro a la orden.');
      return;
    }
    if (lineas.some((l) => !l.id_libro)) {
      setError('Cada renglón necesita un libro.');
      return;
    }
    if (new Set(lineas.map((l) => l.id_libro)).size !== lineas.length) {
      setError('No repitas el mismo libro en una orden.');
      return;
    }
    if (lineas.some((l) => !Number.isInteger(l.cantidad) || l.cantidad <= 0)) {
      setError('Las cantidades deben ser enteros mayores a cero.');
      return;
    }
    if (lineas.some((l) => !Number.isFinite(l.costo_unitario) || l.costo_unitario < 0)) {
      setError('El costo unitario debe ser un número mayor o igual a cero.');
      return;
    }

    setGuardando(true);
    try {
      const creada = await crearOrdenCompra(
        Number(idProveedor),
        lineas.map((l) => ({
          id_libro: l.id_libro,
          cantidad: l.cantidad,
          costo_unitario: l.costo_unitario,
        })),
        token,
      );
      setAviso(
        `Pedido de compra #${creada.id_pedido} creado por ${importe(creada.total)}. Queda en estado Pendiente hasta que se reciba.`,
      );
      setFormVisible(false);
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear la orden de compra.');
    } finally {
      setGuardando(false);
    }
  };

  const verDetalle = async (orden: OrdenCompra) => {
    if (!token) return;
    if (detalle?.pedido.id_pedido === orden.id_pedido) {
      setDetalle(null);
      return;
    }
    setCargandoDetalle(orden.id_pedido);
    setError(null);
    try {
      setDetalle(await obtenerOrdenCompra(orden.id_pedido, token));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cargar el detalle del pedido.');
    } finally {
      setCargandoDetalle(null);
    }
  };

  const recibir = async (orden: OrdenCompra) => {
    if (!token || recibiendo) return;
    const seguro = window.confirm(
      `¿Marcar el pedido #${orden.id_pedido} como recibido? Se sumará al inventario la cantidad de cada renglón.`,
    );
    if (!seguro) return;
    setRecibiendo(orden.id_pedido);
    setError(null);
    setAviso(null);
    try {
      await recibirOrdenCompra(orden.id_pedido, token);
      setAviso(`Pedido #${orden.id_pedido} recibido: el stock quedó actualizado.`);
      if (detalle?.pedido.id_pedido === orden.id_pedido) setDetalle(null);
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo recibir la orden.');
    } finally {
      setRecibiendo(null);
    }
  };

  return (
    <div className="admin-prov__panel">
      {aviso && <p className="admin-inv__aviso" role="status">{aviso}</p>}
      {error && <p className="checkout__error" role="alert">{error}</p>}

      <div className="admin-inv__toolbar">
        <label className="admin-inv__buscar">
          <span>Buscar orden</span>
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Folio o proveedor…"
          />
        </label>
        <div className="admin-inv__chips" role="group" aria-label="Filtrar por estado">
          {(['todos', 'pendiente', 'recibido'] as FiltroEstado[]).map((clave) => (
            <button
              key={clave}
              type="button"
              className={`chip${filtro === clave ? ' chip--on' : ''}`}
              onClick={() => setFiltro(clave)}
            >
              {clave === 'todos' ? 'Todos' : clave === 'pendiente' ? 'Pendientes' : 'Recibidos'}
            </button>
          ))}
        </div>
        <button type="button" className="btn" onClick={abrirNueva}>
          + Nueva orden
        </button>
        <span className="admin-inv__conteo">
          {visibles.length} de {ordenes.length} pedidos
        </span>
      </div>

      {formVisible && (
        <form className="panel admin-inv__form" onSubmit={guardar}>
          <div className="admin-inv__form-head">
            <h2>Nueva orden de compra</h2>
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
            <label className="field field--ancho">
              <span>Proveedor *</span>
              <select value={idProveedor} onChange={(e) => setIdProveedor(e.target.value)} required>
                <option value="">— Selecciona un proveedor —</option>
                {proveedores.map((proveedor) => (
                  <option key={proveedor.id} value={proveedor.id}>
                    {proveedor.nombre}
                    {proveedor.rfc ? ` · ${proveedor.rfc}` : ''}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {proveedores.length === 0 && (
            <p className="state state--error">
              Registra primero un proveedor en la pestaña «Proveedores».
            </p>
          )}

          <div className="admin-prov__lineas-head">
            <h3>Renglones del pedido</h3>
            <button
              type="button"
              className="btn-mini"
              onClick={agregarLinea}
              disabled={lineas.length >= libros.length}
            >
              + Agregar renglón
            </button>
          </div>

          <div className="admin-prov__lineas">
            {lineas.map((linea, indice) => {
              const usadosEnOtras = new Set(
                lineas.filter((l) => l.clave !== linea.clave).map((l) => l.id_libro),
              );
              return (
                <div className="admin-prov__linea" key={linea.clave}>
                  <label className="field">
                    <span>Libro {indice + 1}</span>
                    <select
                      value={linea.id_libro}
                      onChange={(e) => seleccionarLibro(linea.clave, e.target.value)}
                      required
                    >
                      <option value="">— Selecciona un libro —</option>
                      {libros
                        .filter((libro) => !usadosEnOtras.has(libro.id_libro))
                        .map((libro) => (
                          <option key={libro.id_libro} value={libro.id_libro}>
                            {libro.id_libro} · {libro.titulo} (stock {libro.stock})
                          </option>
                        ))}
                    </select>
                  </label>
                  <label className="field">
                    <span>Cantidad</span>
                    <input
                      value={linea.cantidad}
                      onChange={(e) =>
                        cambiarLinea(linea.clave, { cantidad: Number(e.target.value) || 0 })
                      }
                      inputMode="numeric"
                      min={1}
                      required
                    />
                  </label>
                  <label className="field">
                    <span>Costo unitario</span>
                    <input
                      value={linea.costo_unitario}
                      onChange={(e) =>
                        cambiarLinea(linea.clave, { costo_unitario: Number(e.target.value) || 0 })
                      }
                      inputMode="decimal"
                      min={0}
                      required
                    />
                  </label>
                  <div className="admin-prov__linea-acciones">
                    <span className="admin-prov__importe">
                      {importe(Number(linea.cantidad) * Number(linea.costo_unitario))}
                    </span>
                    <button
                      type="button"
                      className="btn-mini btn-mini--peligro"
                      onClick={() => quitarLinea(linea.clave)}
                      disabled={lineas.length === 1}
                      aria-label={`Quitar renglón ${indice + 1}`}
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="admin-prov__total">
            <span>Total del pedido</span>
            <strong>{importe(total)}</strong>
          </div>

          <div className="admin-inv__form-acciones">
            <button type="submit" className="btn" disabled={guardando || proveedores.length === 0}>
              {guardando ? 'Creando…' : 'Crear orden'}
            </button>
            <button type="button" className="btn btn--outline" onClick={() => setFormVisible(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="panel admin-inv__tabla-wrap">
        {cargando ? (
          <p className="state">Cargando órdenes de compra…</p>
        ) : visibles.length === 0 ? (
          <p className="state">
            {ordenes.length === 0
              ? 'Aún no hay pedidos de compra registrados.'
              : 'Ningún pedido coincide con el filtro.'}
          </p>
        ) : (
          <table className="admin-inv__tabla">
            <thead>
              <tr>
                <th scope="col">Pedido</th>
                <th scope="col">Proveedor</th>
                <th scope="col">Fecha</th>
                <th scope="col" className="num">Total</th>
                <th scope="col">Estado</th>
                <th scope="col">Recepción</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((orden) => {
                const pendiente = orden.estado.trim().toLowerCase() === 'pendiente';
                return (
                  <tr key={orden.id_pedido}>
                    <td className="admin-inv__clave">#{orden.id_pedido}</td>
                    <td>
                      <strong>{orden.nombre}</strong>
                      <span className="admin-inv__autor">Proveedor #{orden.id_proveedor}</span>
                    </td>
                    <td>{fecha(orden.fecha)}</td>
                    <td className="num">{importe(orden.costo_total)}</td>
                    <td>
                      <span className={claseEstado(orden.estado)}>{orden.estado}</span>
                    </td>
                    <td>{fecha(orden.fecha_recepcion)}</td>
                    <td>
                      <div className="admin-inv__fila-acciones">
                        <button
                          type="button"
                          className="btn-mini"
                          onClick={() => void verDetalle(orden)}
                          disabled={cargandoDetalle === orden.id_pedido}
                        >
                          {cargandoDetalle === orden.id_pedido ? 'Cargando…' : 'Ver detalle'}
                        </button>
                        {pendiente && (
                          <button
                            type="button"
                            className="btn-mini"
                            onClick={() => void recibir(orden)}
                            disabled={recibiendo === orden.id_pedido}
                          >
                            {recibiendo === orden.id_pedido ? 'Recibiendo…' : 'Recibir'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {detalle && (
        <div className="panel admin-prov__detalle">
          <div className="admin-inv__form-head">
            <h2>
              Pedido #{detalle.pedido.id_pedido}
              <span className={`pill ${tinteEstado(detalle.pedido.estado)}`}>
                {detalle.pedido.estado}
              </span>
            </h2>
            <button
              type="button"
              className="admin-inv__cerrar"
              onClick={() => setDetalle(null)}
              aria-label="Cerrar detalle"
            >
              ✕
            </button>
          </div>
          <table className="admin-inv__tabla">
            <thead>
              <tr>
                <th scope="col">Clave</th>
                <th scope="col">Libro</th>
                <th scope="col" className="num">Cantidad</th>
                <th scope="col" className="num">Costo unitario</th>
                <th scope="col" className="num">Importe</th>
              </tr>
            </thead>
            <tbody>
              {detalle.items.map((item) => (
                <tr key={item.id_detalle_compra}>
                  <td className="admin-inv__clave">{item.id_libro}</td>
                  <td>{tituloLibro(item.id_libro)}</td>
                  <td className="num">{item.cantidad}</td>
                  <td className="num">{importe(item.costo_unitario)}</td>
                  <td className="num">
                    <strong>{importe(Number(item.cantidad) * Number(item.costo_unitario))}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="admin-prov__total">
            <span>Total del pedido</span>
            <strong>{importe(detalle.pedido.costo_total)}</strong>
          </div>
        </div>
      )}
    </div>
  );
}
