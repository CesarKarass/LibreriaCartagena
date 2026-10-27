import { useId, useState, type InputHTMLAttributes } from 'react';

interface CampoProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

function Mensaje({ id, error, hint }: { id: string; error?: string; hint?: string }) {
  if (!error && !hint) return null;
  return (
    <p id={id} className={error ? 'auth-field__error' : 'auth-field__hint'}>
      {error ?? hint}
    </p>
  );
}

export function TextField({ label, error, hint, id, ...props }: CampoProps) {
  const generado = useId();
  const inputId = id ?? generado;
  const descripcionId = `${inputId}-descripcion`;

  return (
    <div className={`auth-field${error ? ' auth-field--error' : ''}`}>
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        {...props}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? descripcionId : undefined}
      />
      <Mensaje id={descripcionId} error={error} hint={hint} />
    </div>
  );
}

export function PasswordField({ label, error, hint, id, ...props }: Omit<CampoProps, 'type'>) {
  const generado = useId();
  const inputId = id ?? generado;
  const descripcionId = `${inputId}-descripcion`;
  const [visible, setVisible] = useState(false);

  return (
    <div className={`auth-field${error ? ' auth-field--error' : ''}`}>
      <label htmlFor={inputId}>{label}</label>
      <div className="auth-field__control">
        <input
          id={inputId}
          {...props}
          type={visible ? 'text' : 'password'}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? descripcionId : undefined}
        />
        <button
          type="button"
          className="auth-field__toggle"
          onClick={() => setVisible((valor) => !valor)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
        >
          {visible ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>
      <Mensaje id={descripcionId} error={error} hint={hint} />
    </div>
  );
}
