import type { ReactNode } from 'react';
import { FeatherOrnament, Flourish, PocketWatchOrnament } from './Ornaments';
import './auth.css';

interface AuthLayoutProps {
  children: ReactNode;
  footer?: ReactNode;
  titulo?: string;
  subtitulo?: string;
  amplio?: boolean;
}

export default function AuthLayout({
  children,
  footer,
  titulo,
  subtitulo,
  amplio = false,
}: AuthLayoutProps) {
  return (
    <div className="auth-page">
      <main className={`auth-card${amplio ? ' auth-card--amplio' : ''}`}>
        <FeatherOrnament className="auth-card__feather" />
        <PocketWatchOrnament className="auth-card__watch" />

        <header className="auth-brand">
          <h1 className="auth-brand__name">Cartagena</h1>
          <p className="auth-brand__slogan">Donde la magia de leer no tiene fin</p>
          <Flourish className="auth-brand__flourish" />
        </header>

        {titulo && <h2 className="auth-title">{titulo}</h2>}
        {subtitulo && <p className="auth-subtitle">{subtitulo}</p>}

        <div className="auth-card__body">{children}</div>
        {footer && <div className="auth-card__footer">{footer}</div>}
      </main>

      <p className="auth-page__copy">Cartagena Bookstore · Acceso seguro</p>
    </div>
  );
}
