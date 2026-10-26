import type { BookFilters } from '../../types/book';

interface Props {
  filters: BookFilters;
  options: { categorias: string[]; generos: string[]; formatos: string[] };
  onChange: (key: 'categoria' | 'genero' | 'formato', value: string) => void;
}

function Field({ label, all, value, items, onChange }: {
  label: string; all: string; value: string; items: string[]; onChange: (v: string) => void;
}) {
  const id = `f-${label}`;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{all}</option>
        {items.map((i) => <option key={i} value={i}>{i}</option>)}
      </select>
    </div>
  );
}

export default function FiltersPanel({ filters, options, onChange }: Props) {
  return (
    <aside className="filters" aria-label="Filtros de búsqueda">
      <h2>Filtros de Búsqueda</h2>
      <Field label="Categoría" all="Todas las categorías" value={filters.categoria} items={options.categorias} onChange={(v) => onChange('categoria', v)} />
      <Field label="Género" all="Todos los géneros" value={filters.genero} items={options.generos} onChange={(v) => onChange('genero', v)} />
      <Field label="Formato" all="Todos los formatos" value={filters.formato} items={options.formatos} onChange={(v) => onChange('formato', v)} />
    </aside>
  );
}
