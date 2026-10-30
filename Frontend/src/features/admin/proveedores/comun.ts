const formatoMoneda = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
});

/** Formatea un importe que puede venir como número o como cadena decimal. */
export function importe(valor: number | string | null | undefined): string {
  const numero = Number(valor);
  return formatoMoneda.format(Number.isFinite(numero) ? numero : 0);
}

/**
 * Muestra una fecha del backend (ISO o `AAAA-MM-DD HH:MM:SS`) como
 * `DD/MM/AAAA HH:MM`. No convierte zona horaria para no desfasar los registros.
 */
export function fecha(valor: string | null | undefined): string {
  if (!valor) return '—';
  const [dia, hora = ''] = valor.replace('T', ' ').split(' ');
  const partes = dia.split('-');
  if (partes.length !== 3) return valor;
  const [anio, mes, d] = partes;
  return `${d}/${mes}/${anio}${hora ? ` ${hora.slice(0, 5)}` : ''}`;
}

/** Clase de la píldora según el estado de la orden de compra. */
export function claseEstado(estado: string): string {
  switch (estado.trim().toLowerCase()) {
    case 'recibido':
      return 'pill pill--ok';
    case 'cancelado':
    case 'rechazado':
      return 'pill pill--bajo';
    default:
      return 'pill pill--alto';
  }
}

/** Modificador de color para combinar con `pill` (p. ej. `pill--ok`). */
export function tinteEstado(estado: string): string {
  return claseEstado(estado).split(' ')[1] ?? 'pill--alto';
}

/** Mes actual en formato AAAA-MM (hora local). */
export function mesActual(): string {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
}

/** Texto legible de un mes AAAA-MM. */
export function nombreMes(mes: string): string {
  const [anio, numero] = mes.split('-');
  const indice = Number(numero) - 1;
  const nombres = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];
  return indice >= 0 && indice < 12 ? `${nombres[indice]} de ${anio}` : mes;
}
