import { useSyncExternalStore } from 'react';

export interface Personaje {
  clave: string;
  emoji: string;
  nombre: string;
}

/** Catálogo de personajes de fantasía disponibles como foto de perfil. */
export const PERSONAJES: Personaje[] = [
  { clave: 'dragon', emoji: '🐉', nombre: 'Dragón' },
  { clave: 'mago', emoji: '🧙‍♂️', nombre: 'Mago' },
  { clave: 'maga', emoji: '🧙‍♀️', nombre: 'Maga' },
  { clave: 'elfa', emoji: '🧝‍♀️', nombre: 'Elfa' },
  { clave: 'unicornio', emoji: '🦄', nombre: 'Unicornio' },
  { clave: 'vampiro', emoji: '🧛', nombre: 'Vampiro' },
  { clave: 'hombre-lobo', emoji: '🐺', nombre: 'Hombre lobo' },
  { clave: 'zorro', emoji: '🦊', nombre: 'Zorro místico' },
  { clave: 'fenix', emoji: '🦅', nombre: 'Fénix' },
  { clave: 'sirena', emoji: '🧜‍♀️', nombre: 'Sirena' },
  { clave: 'serpiente', emoji: '🐍', nombre: 'Serpiente mágica' },
  { clave: 'fantasma', emoji: '👻', nombre: 'Fantasma' },
  { clave: 'caballero', emoji: '🛡️', nombre: 'Caballero' },
  { clave: 'automa', emoji: '🤖', nombre: 'Autómata' },
  { clave: 'luna', emoji: '🌙', nombre: 'Guardián lunar' },
  { clave: 'mariposa', emoji: '🦋', nombre: 'Mariposa feérica' },
];

const CLAVE_STORAGE = 'cartagena.avatar.v1';
export const EVENTO_AVATAR = 'cartagena-avatar:cambio';

type MapaAvatares = Record<string, string>;

function leerMapa(): MapaAvatares {
  try {
    const texto = localStorage.getItem(CLAVE_STORAGE);
    if (!texto) return {};
    const datos = JSON.parse(texto) as Record<string, unknown>;
    const mapa: MapaAvatares = {};
    for (const [usuario, clave] of Object.entries(datos)) {
      if (typeof clave === 'string') mapa[usuario.toLowerCase()] = clave;
    }
    return mapa;
  } catch {
    return {};
  }
}

function claveDe(usuario: string | null | undefined): string | null {
  if (!usuario) return null;
  return leerMapa()[usuario.toLowerCase()] ?? null;
}

export function personajeDe(usuario: string | null | undefined): Personaje | null {
  const clave = claveDe(usuario);
  if (!clave) return null;
  return PERSONAJES.find((personaje) => personaje.clave === clave) ?? null;
}

export function guardarPersonaje(usuario: string, clave: string | null): void {
  try {
    const mapa = leerMapa();
    if (clave) mapa[usuario.toLowerCase()] = clave;
    else delete mapa[usuario.toLowerCase()];
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(mapa));
  } catch {
    // Sin almacenamiento disponible: el avatar simplemente no persiste.
  }
  window.dispatchEvent(new Event(EVENTO_AVATAR));
}

function suscribir(alCambiar: () => void): () => void {
  window.addEventListener(EVENTO_AVATAR, alCambiar);
  window.addEventListener('storage', alCambiar);
  return () => {
    window.removeEventListener(EVENTO_AVATAR, alCambiar);
    window.removeEventListener('storage', alCambiar);
  };
}

/** Devuelve la clave del personaje elegido y se actualiza al instante en todo el sitio. */
export function usePersonaje(usuario: string | null | undefined): Personaje | null {
  const clave = useSyncExternalStore(suscribir, () => claveDe(usuario));
  if (!clave) return null;
  return PERSONAJES.find((personaje) => personaje.clave === clave) ?? null;
}
