import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function AuthAlert({
  tipo = 'error',
  children,
}: {
  tipo?: 'error' | 'success' | 'info';
  children: ReactNode;
}) {
  return (
    <div
      className={`auth-alert auth-alert--${tipo}`}
      role={tipo === 'error' ? 'alert' : 'status'}
      aria-live={tipo === 'error' ? 'assertive' : 'polite'}
    >
      {children}
    </div>
  );
}

interface AuthSubmitProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  cargando?: boolean;
  textoCargando: string;
  children: ReactNode;
}

export function AuthSubmit({ cargando = false, textoCargando, children, ...props }: AuthSubmitProps) {
  return (
    <button
      type="submit"
      className="auth-submit"
      {...props}
      disabled={cargando || props.disabled}
      aria-busy={cargando}
    >
      {cargando && <span className="auth-submit__spinner" aria-hidden="true" />}
      {cargando ? textoCargando : children}
    </button>
  );
}
