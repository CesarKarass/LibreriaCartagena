const API_URL = import.meta.env.VITE_API_URL ?? '/api';

/** Error de la API con el código HTTP para que las pantallas puedan reaccionar. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function errorDesde(res: Response, path: string): Promise<never> {
  let detalle = '';
  try {
    // C# responde {error}, el microservicio de login {mensaje} y Flask {message}.
    const datos = (await res.json()) as { error?: string; mensaje?: string; message?: string };
    detalle = datos?.error ?? datos?.mensaje ?? datos?.message ?? '';
  } catch {
    // Respuesta sin cuerpo JSON.
  }
  throw new ApiError(detalle || `Error ${res.status} al consultar ${path}`, res.status);
}

function cabeceras(token?: string | null, json = false): Headers {
  const headers = new Headers();
  if (json) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return headers;
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string>,
  token?: string | null,
): Promise<T> {
  const query = params
    ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '')).toString()
    : '';
  const res = await fetch(`${API_URL}${path}${query}`, { headers: cabeceras(token) });
  if (!res.ok) await errorDesde(res, path);
  return res.json() as Promise<T>;
}

async function apiSend<T>(
  method: string,
  path: string,
  body?: unknown,
  token?: string | null,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: cabeceras(token, body !== undefined),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) await errorDesde(res, path);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function apiPost<T>(path: string, body?: unknown, token?: string | null): Promise<T> {
  return apiSend<T>('POST', path, body, token);
}

/** POST con cabecera extra (p. ej. Idempotency-Key para /api/checkout). */
export function apiPostCon<T>(
  path: string,
  body: unknown,
  token: string | null | undefined,
  extra: Record<string, string>,
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  Object.assign(headers, extra);
  return fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  }).then(async (r) => {
    if (!r.ok) await errorDesde(r, path);
    return r.json() as Promise<T>;
  });
}

export function apiPut<T>(path: string, body?: unknown, token?: string | null): Promise<T> {
  return apiSend<T>('PUT', path, body, token);
}

export function apiPatch<T>(path: string, body?: unknown, token?: string | null): Promise<T> {
  return apiSend<T>('PATCH', path, body, token);
}

export function apiDelete<T>(path: string, token?: string | null): Promise<T> {
  return apiSend<T>('DELETE', path, undefined, token);
}

/** Descarga un archivo (PDF) autenticado; un <a> normal no envía el JWT. */
export async function apiBlob(path: string, token?: string | null): Promise<Blob> {
  const res = await fetch(`${API_URL}${path}`, { headers: cabeceras(token) });
  if (!res.ok) await errorDesde(res, path);
  return res.blob();
}
