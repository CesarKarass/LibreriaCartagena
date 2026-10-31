/**
 * Reglas de validación del registro y de la configuración de la cuenta.
 * Deben coincidir con el microservicio de login
 * (src/controllers/autenticacion.controller.js) y con
 * Backend/Cartagena/backend/Cartagena.Api/Infrastructure/Validaciones.cs.
 */

export const NOMBRE_COMPLETO_RE = /^[\p{L}][\p{L}\s'.-]{1,149}$/u;
export const NOMBRE_USUARIO_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{2,59}$/;
export const CORREO_COM_RE = /^[^\s@]+@[^\s@]+\.com(\.[a-z]{2,})?$/i;
export const TELEFONO_RE = /^\d{10}$/;

export interface RequisitoContrasena {
  clave: string;
  etiqueta: string;
  cumple: boolean;
}

export function soloDigitos(valor: string): string {
  return valor.replace(/\D/g, '');
}

export function validarNombreCompleto(valor: string): string | undefined {
  const nombre = valor.trim();
  if (nombre.length < 2) return 'Escribe tu nombre completo.';
  if (nombre.length > 150) return 'El nombre no puede superar 150 caracteres.';
  if (!NOMBRE_COMPLETO_RE.test(nombre)) {
    return 'Solo se permiten letras, espacios, apóstrofes, puntos y guiones.';
  }
  return undefined;
}

export function validarNombreUsuario(valor: string): string | undefined {
  const usuario = valor.trim();
  if (usuario.length < 3) return 'El usuario debe tener al menos 3 caracteres.';
  if (usuario.length > 60) return 'El usuario no puede superar 60 caracteres.';
  if (!NOMBRE_USUARIO_RE.test(usuario)) {
    return 'Usa letras, números, punto, guion o guion bajo; debe iniciar con letra o número.';
  }
  return undefined;
}

export function validarCorreo(valor: string): string | undefined {
  const correo = valor.trim();
  if (!correo) return 'El correo electrónico es obligatorio.';
  if (correo.length > 120) return 'El correo no puede superar 120 caracteres.';
  if (!correo.includes('@')) return 'El correo debe incluir @.';
  if (!/\.com(\.[a-z]{2,})?$/i.test(correo)) return 'El correo debe terminar en .com.';
  if (!CORREO_COM_RE.test(correo)) return 'Escribe un correo válido, por ejemplo nombre@dominio.com.';
  return undefined;
}

export function validarTelefono(valor: string): string | undefined {
  const telefono = soloDigitos(valor);
  if (!telefono) return 'El teléfono es obligatorio.';
  if (!TELEFONO_RE.test(telefono)) return 'El teléfono debe tener exactamente 10 dígitos.';
  return undefined;
}

export function requisitosContrasena(valor: string): RequisitoContrasena[] {
  return [
    { clave: 'longitud', etiqueta: 'Al menos 8 caracteres', cumple: valor.length >= 8 && valor.length <= 200 },
    { clave: 'mayuscula', etiqueta: 'Una letra mayúscula', cumple: /[A-Z]/.test(valor) },
    { clave: 'numero', etiqueta: 'Un número', cumple: /\d/.test(valor) },
    { clave: 'especial', etiqueta: 'Un carácter especial', cumple: /[^A-Za-z0-9\s]/.test(valor) },
  ];
}

export function validarContrasena(valor: string): string | undefined {
  if (valor.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (valor.length > 200) return 'La contraseña no puede superar 200 caracteres.';
  if (!/[A-Z]/.test(valor)) return 'La contraseña debe incluir al menos una mayúscula.';
  if (!/\d/.test(valor)) return 'La contraseña debe incluir al menos un número.';
  if (!/[^A-Za-z0-9\s]/.test(valor)) return 'La contraseña debe incluir al menos un carácter especial.';
  return undefined;
}

/** Sugerencias locales cuando el servicio de disponibilidad no responde. */
export function sugerenciasUsuario(nombreUsuario: string, nombreCompleto = ''): string[] {
  const base =
    nombreUsuario
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '')
      .replace(/[0-9._-]+$/g, '') || 'lector';

  const partes = nombreCompleto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(/\s+/)
    .map((parte) => parte.replace(/[^a-z0-9]/g, ''))
    .filter(Boolean);

  const candidatos = new Set<string>([`${base}1`, `${base}2`, `${base}.${new Date().getFullYear() % 100}`]);
  if (partes.length >= 2) {
    candidatos.add(`${partes[0]}.${partes[partes.length - 1]}`);
    candidatos.add(`${partes[0]}_${partes[partes.length - 1]}`);
  }
  candidatos.add(`${base}_lector`);

  return [...candidatos].filter((c) => NOMBRE_USUARIO_RE.test(c.slice(0, 60))).slice(0, 3);
}
