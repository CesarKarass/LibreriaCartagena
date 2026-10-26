const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

export async function apiGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const query = params
    ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '')).toString()
    : '';
  const res = await fetch(`${API_URL}${path}${query}`);
  if (!res.ok) throw new Error(`Error ${res.status} al consultar ${path}`);
  return res.json() as Promise<T>;
}
