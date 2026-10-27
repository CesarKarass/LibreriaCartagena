import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import { AuthAlert, AuthSubmit } from '../../components/auth/FormFeedback';
import { PasswordField, TextField } from '../../components/auth/TextField';
import { useAuth } from '../../context/AuthContext';
import { destinoTrasAutenticar, erroresPorCampo, mensajeErrorAuth } from './mensajes';

export default function LoginPage() {
  const { autenticado, cargando, iniciarSesion, usuario } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [nombreUsuario, setNombreUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (cargando || !autenticado || !usuario) return;
    navigate(destinoTrasAutenticar(location.state, usuario.rol), { replace: true });
  }, [cargando, autenticado, usuario, location.state, navigate]);

  const validar = () => {
    const nuevos: Record<string, string> = {};
    if (nombreUsuario.trim().length < 3) {
      nuevos.nombreUsuario = 'Escribe tu correo o un usuario de al menos 3 caracteres.';
    }
    if (!contrasena) {
      nuevos.contrasena = 'La contraseña es obligatoria.';
    }
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const onSubmit = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setErrorGeneral(null);
    if (!validar()) return;

    setEnviando(true);
    try {
      await iniciarSesion({
        nombreUsuario: nombreUsuario.trim(),
        contrasena,
      });
    } catch (error) {
      setErrores(erroresPorCampo(error));
      setErrorGeneral(mensajeErrorAuth(error));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AuthLayout
      footer={
        <p>
          ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        {errorGeneral && <AuthAlert tipo="error">{errorGeneral}</AuthAlert>}

        <TextField
          label="Correo electrónico o Usuario"
          id="login-usuario"
          name="nombreUsuario"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          autoFocus
          placeholder="ej. alicia@wonderland.com"
          value={nombreUsuario}
          onChange={(evento) => setNombreUsuario(evento.target.value)}
          error={errores.nombreUsuario}
        />

        <PasswordField
          label="Contraseña"
          id="login-contrasena"
          name="contrasena"
          autoComplete="current-password"
          placeholder="••••••••"
          value={contrasena}
          onChange={(evento) => setContrasena(evento.target.value)}
          error={errores.contrasena}
        />

        <div className="auth-row auth-row--right">
          <Link className="auth-link" to="/recuperar-password">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <AuthSubmit cargando={enviando} textoCargando="Entrando…">
          Entrar a la Madriguera
        </AuthSubmit>
      </form>
    </AuthLayout>
  );
}
