import type { ReactNode } from 'react';
import logoCompleto from '../../assets/Fotografias_Cartagena/Logo Completo.jpeg';
import nombreCartagena from '../../assets/Fotografias_Cartagena/NombreCartagena.png';
import sloganImagen from '../../assets/Fotografias_Cartagena/Slogan.png';
import plumaImagen from '../../assets/Fotografias_Cartagena/Pluma.png';
import relojImagen from '../../assets/Fotografias_Cartagena/Reloj.png';
import registrateImagen from '../../assets/Fotografias_Cartagena/Registrate.png';
import olvidasteImagen from '../../assets/Fotografias_Cartagena/Olvidaste tu contraseña.png';
import tokenImagen from '../../assets/Fotografias_Cartagena/Token.png';
import './auth.css';

export type VarianteAuth = 'login' | 'registro' | 'recuperar' | 'restablecer';

interface AuthLayoutProps {
  children: ReactNode;
  footer?: ReactNode;
  titulo?: string;
  subtitulo?: string;
  amplio?: boolean;
  variante?: VarianteAuth;
}

const ENCABEZADOS: Record<Exclude<VarianteAuth, 'login'>, { imagen: string; alt: string }> = {
  registro: {
    imagen: registrateImagen,
    alt: 'Regístrate',
  },
  recuperar: {
    imagen: olvidasteImagen,
    alt: '¿Olvidaste tu llave en la madriguera? Recupera tu acceso',
  },
  restablecer: {
    imagen: tokenImagen,
    alt: 'Ingresa tu nueva contraseña para abrir la puerta secreta',
  },
};

export default function AuthLayout({
  children,
  footer,
  titulo,
  subtitulo,
  amplio = false,
  variante = 'login',
}: AuthLayoutProps) {
  const esLogin = variante === 'login';
  const encabezado = esLogin ? null : ENCABEZADOS[variante];

  return (
    <div className={`auth-page auth-page--${variante}`}>
      <main className={`auth-card${amplio ? ' auth-card--amplio' : ''}`}>
        {esLogin && (
          <>
            <img src={plumaImagen} alt="" className="auth-card__feather" aria-hidden="true" />
            <img src={relojImagen} alt="" className="auth-card__watch" aria-hidden="true" />
          </>
        )}

        {esLogin ? (
          <header className="auth-brand auth-brand--login">
            <img src={nombreCartagena} alt="Cartagena" className="auth-brand__wordmark" />
            <img
              src={sloganImagen}
              alt="Donde la magia de leer no tiene fin"
              className="auth-brand__slogan-img"
            />
          </header>
        ) : (
          <header className="auth-brand auth-brand--logo">
            <img
              src={logoCompleto}
              alt="Librería Cartagena"
              className="auth-brand__logo"
            />
            {encabezado && (
              <img src={encabezado.imagen} alt={encabezado.alt} className="auth-brand__heading" />
            )}
          </header>
        )}

        {titulo && <h2 className="auth-title">{titulo}</h2>}
        {subtitulo && <p className="auth-subtitle">{subtitulo}</p>}

        <div className="auth-card__body">{children}</div>
        {footer && <div className="auth-card__footer">{footer}</div>}
      </main>

      <p className="auth-page__copy">Cartagena Bookstore · Acceso seguro</p>
    </div>
  );
}
