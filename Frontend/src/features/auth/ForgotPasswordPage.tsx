import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import { AuthAlert, AuthSubmit } from '../../components/auth/FormFeedback';
import { TextField } from '../../components/auth/TextField';
import { solicitarRecuperacion } from '../../services/authService';
import { mensajeErrorAuth } from './mensajes';

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USUARIO_VALIDO = /^[a-zA-Z0-9._-]{3,60}$/;

export default function ForgotPasswordPage() {
  const [correo, setCorreo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [errorCampo, setErrorCampo] = useState<string | undefined>();
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const onSubmit = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setError(null);
    setErrorCampo(undefined);

    const valor = correo.trim();
    if (!CORREO_VALIDO.test(valor) && !USUARIO_VALIDO.test(valor)) {
      setErrorCampo('Escribe el correo o el nombre de usuario de tu cuenta.');
      return;
    }

    setEnviando(true);
    try {
      const respuesta = await solicitarRecuperacion(correo.trim());
      setMensaje(respuesta);
    } catch (fallo) {
      setError(mensajeErrorAuth(fallo));
    } finally {
      setEnviando(false);
    }
  };

  if (mensaje) {
    return (
      <AuthLayout
        variante="recuperar"
        titulo="Revisa tu correo"
        footer={
          <p>
            <Link to="/login">Volver al inicio de sesión</Link>
          </p>
        }
      >
        <div className="auth-exito">
          <span className="auth-exito__icono" aria-hidden="true">
            ✉
          </span>
          <p>{mensaje}</p>
          <p>
            Si el correo está registrado, recibirás un token válido durante 20 minutos. Revisa
            también la carpeta de spam.
          </p>
          <Link
            className="auth-submit"
            to={`/restablecer-password?correo=${encodeURIComponent(correo.trim())}`}
          >
            Ya tengo mi token
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      variante="recuperar"
      footer={
        <p>
          <Link to="/login">← Volver al Inicio de Sesión</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        {error && <AuthAlert tipo="error">{error}</AuthAlert>}

        <TextField
          label="Correo electrónico o Usuario"
          id="recuperar-correo"
          name="correo"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          autoFocus
          placeholder="ej. alicia@wonderland.com"
          value={correo}
          onChange={(evento) => setCorreo(evento.target.value)}
          error={errorCampo}
          hint="Te enviaremos un token de un solo uso."
        />

        <AuthSubmit cargando={enviando} textoCargando="Enviando enlace…">
          Enviar Enlace de Recuperación
        </AuthSubmit>
      </form>
    </AuthLayout>
  );
}
