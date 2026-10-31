import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import { AuthAlert, AuthSubmit } from '../../components/auth/FormFeedback';
import { PasswordField, TextField } from '../../components/auth/TextField';
import { restablecerContrasena } from '../../services/authService';
import { validarContrasena } from '../../utils/validacion';
import { mensajeErrorAuth } from './mensajes';

const TOKEN_VALIDO = /^[0-9a-f]{64}$/;

export default function ResetPasswordPage() {
  const [parametros] = useSearchParams();
  const tokenEnUrl = Boolean(parametros.get('token'));

  const [token, setToken] = useState(parametros.get('token') ?? '');
  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState(false);

  const onSubmit = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setErrorGeneral(null);

    const nuevos: Record<string, string> = {};
    const tokenNormalizado = token.trim().toLowerCase();
    if (!TOKEN_VALIDO.test(tokenNormalizado)) {
      nuevos.token = 'El token debe tener 64 caracteres hexadecimales.';
    }
    const problemaContrasena = validarContrasena(contrasena);
    if (problemaContrasena) nuevos.contrasena = problemaContrasena;
    if (confirmar !== contrasena) {
      nuevos.confirmar = 'Las contraseñas no coinciden.';
    }

    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    setEnviando(true);
    try {
      await restablecerContrasena(tokenNormalizado, contrasena);
      setListo(true);
    } catch (fallo) {
      setErrorGeneral(mensajeErrorAuth(fallo));
    } finally {
      setEnviando(false);
    }
  };

  if (listo) {
    return (
      <AuthLayout
        variante="restablecer"
        titulo="Contraseña actualizada"
        footer={
          <p>
            <Link to="/login">Ir al inicio de sesión</Link>
          </p>
        }
      >
        <div className="auth-exito">
          <span className="auth-exito__icono" aria-hidden="true">
            ✓
          </span>
          <p>Tu contraseña se actualizó correctamente.</p>
          <p>Ya puedes entrar a la Madriguera con tu nueva contraseña.</p>
          <Link className="auth-submit" to="/login">
            Iniciar sesión
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      variante="restablecer"
      footer={
        <p>
          <Link to="/login">← Ir a Iniciar Sesión</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        {errorGeneral && <AuthAlert tipo="error">{errorGeneral}</AuthAlert>}

        {!tokenEnUrl && (
          <TextField
            label="Token de recuperación"
            id="reset-token"
            name="token"
            autoComplete="one-time-code"
            autoCapitalize="none"
            spellCheck={false}
            autoFocus={!token}
            placeholder="64 caracteres hexadecimales"
            value={token}
            onChange={(evento) => setToken(evento.target.value)}
            error={errores.token}
            hint="Viene en el correo de recuperación. Caduca a los 20 minutos."
          />
        )}

        <PasswordField
          label="Nueva contraseña"
          id="reset-contrasena"
          name="contrasena"
          autoComplete="new-password"
          autoFocus={tokenEnUrl}
          placeholder="Mínimo 8 caracteres"
          value={contrasena}
          onChange={(evento) => setContrasena(evento.target.value)}
          error={errores.contrasena}
        />

        <PasswordField
          label="Confirmar nueva contraseña"
          id="reset-confirmar"
          name="confirmar"
          autoComplete="new-password"
          placeholder="Repite la contraseña"
          value={confirmar}
          onChange={(evento) => setConfirmar(evento.target.value)}
          error={errores.confirmar}
        />

        <AuthSubmit cargando={enviando} textoCargando="Restableciendo contraseña…">
          Restablecer Contraseña
        </AuthSubmit>
      </form>
    </AuthLayout>
  );
}
