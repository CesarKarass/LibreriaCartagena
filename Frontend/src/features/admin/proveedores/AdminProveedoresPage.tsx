import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import ProveedoresTab from './ProveedoresTab';
import ComprasTab from './ComprasTab';
import MovimientosTab from './MovimientosTab';
import ReportesTab from './ReportesTab';

type Pestana = 'proveedores' | 'compras' | 'movimientos' | 'reportes';

const PESTANAS: Array<{ clave: Pestana; etiqueta: string }> = [
  { clave: 'proveedores', etiqueta: 'Proveedores' },
  { clave: 'compras', etiqueta: 'Órdenes de compra' },
  { clave: 'movimientos', etiqueta: 'Mermas y devoluciones' },
  { clave: 'reportes', etiqueta: 'Reportes de compras' },
];

const DESCRIPCIONES: Record<Pestana, string> = {
  proveedores: 'Alta, consulta y edición del directorio de proveedores.',
  compras: 'Crea pedidos a proveedores y recíbelos para cargar el inventario.',
  movimientos: 'Descuenta del inventario las mermas y las devoluciones a proveedor.',
  reportes: 'Consulta el total comprado por mes y su reparto entre proveedores.',
};

export default function AdminProveedoresPage() {
  const { token } = useAuth();
  const [pestana, setPestana] = useState<Pestana>('proveedores');

  return (
    <section className="admin-inv admin-prov">
      <header className="admin-inv__head">
        <div>
          <p className="admin-inv__eyebrow">Panel de administración</p>
          <h1>Proveedores y Compras</h1>
          <p className="admin-inv__subtitulo">
            Registra proveedores, genera pedidos de compra, controla mermas y devoluciones, y
            revisa los reportes mensuales de abastecimiento.
          </p>
        </div>
        <div className="admin-inv__acciones">
          <Link to="/admin" className="btn btn--outline">Volver al panel</Link>
        </div>
      </header>

      <div>
        <nav className="admin-prov__tabs" role="tablist" aria-label="Secciones de proveedores y compras">
          {PESTANAS.map(({ clave, etiqueta }) => (
            <button
              key={clave}
              type="button"
              role="tab"
              id={`tab-${clave}`}
              aria-selected={pestana === clave}
              aria-controls={`panel-${clave}`}
              className="admin-prov__tab"
              onClick={() => setPestana(clave)}
            >
              {etiqueta}
            </button>
          ))}
        </nav>
        <p className="admin-prov__descripcion">{DESCRIPCIONES[pestana]}</p>
      </div>

      <div
        role="tabpanel"
        id={`panel-${pestana}`}
        aria-labelledby={`tab-${pestana}`}
      >
        {pestana === 'proveedores' && <ProveedoresTab token={token} />}
        {pestana === 'compras' && <ComprasTab token={token} />}
        {pestana === 'movimientos' && <MovimientosTab token={token} />}
        {pestana === 'reportes' && <ReportesTab token={token} />}
      </div>
    </section>
  );
}
