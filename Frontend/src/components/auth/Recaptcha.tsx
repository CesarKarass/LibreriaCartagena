import { useEffect, useRef, useState } from 'react';

interface RecaptchaProps {
  onToken: (token: string | null) => void;
  /** Cambia este valor para reiniciar el widget después de un error. */
  resetKey?: number;
}

let cargaDelScript: Promise<void> | null = null;

function cargarScriptRecaptcha(): Promise<void> {
  if (window.grecaptcha?.render) return Promise.resolve();
  if (cargaDelScript) return cargaDelScript;

  cargaDelScript = new Promise<void>((resolver, rechazar) => {
    const existente = document.querySelector<HTMLScriptElement>('script[data-recaptcha="true"]');
    if (existente) {
      if (window.grecaptcha?.render) {
        resolver();
        return;
      }
      existente.addEventListener('load', () => resolver(), { once: true });
      existente.addEventListener('error', () => rechazar(new Error('reCAPTCHA no disponible')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit&hl=es';
    script.async = true;
    script.defer = true;
    script.dataset.recaptcha = 'true';
    script.onload = () => resolver();
    script.onerror = () => {
      cargaDelScript = null;
      rechazar(new Error('No se pudo cargar reCAPTCHA'));
    };
    document.head.appendChild(script);
  });

  return cargaDelScript;
}

export default function Recaptcha({ onToken, resetKey = 0 }: RecaptchaProps) {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  const contenedor = useRef<HTMLDivElement>(null);
  const widget = useRef<number | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!siteKey) {
      onToken(null);
      return;
    }

    let cancelado = false;

    cargarScriptRecaptcha()
      .then(() => {
        window.grecaptcha?.ready(() => {
          if (cancelado || !contenedor.current || widget.current !== null) return;
          widget.current = window.grecaptcha!.render(contenedor.current, {
            sitekey: siteKey,
            theme: 'dark',
            callback: (token: string) => onToken(token),
            'expired-callback': () => onToken(null),
            'error-callback': () => {
              setError(true);
              onToken(null);
            },
          });
        });
      })
      .catch(() => {
        if (!cancelado) setError(true);
      });

    return () => {
      cancelado = true;
    };
  }, [siteKey, onToken]);

  useEffect(() => {
    if (resetKey === 0 || widget.current === null || !window.grecaptcha) return;
    try {
      window.grecaptcha.reset(widget.current);
      setError(false);
      onToken(null);
    } catch {
      // El widget ya no existe en el DOM.
    }
  }, [resetKey, onToken]);

  if (!siteKey) {
    return import.meta.env.DEV ? (
      <p className="auth-captcha__aviso">
        Verificación anti-bot sin configurar: define <code>VITE_RECAPTCHA_SITE_KEY</code>.
      </p>
    ) : null;
  }

  return (
    <div className="auth-captcha">
      <div ref={contenedor} className="auth-captcha__widget" />
      {error && (
        <p className="auth-field__error" role="alert">
          No se pudo cargar la verificación anti-bot. Recarga la página e inténtalo de nuevo.
        </p>
      )}
      <p className="auth-captcha__legal">
        Protegido por reCAPTCHA. Se aplican la{' '}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">
          Política de Privacidad
        </a>{' '}
        y los{' '}
        <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer">
          Términos de Servicio
        </a>{' '}
        de Google.
      </p>
    </div>
  );
}
