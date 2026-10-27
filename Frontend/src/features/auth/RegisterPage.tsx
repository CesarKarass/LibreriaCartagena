import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import { AuthAlert, AuthSubmit } from '../../components/auth/FormFeedback';
import Recaptcha from '../../components/auth/Recaptcha';
import { PasswordField, TextField } from '../../components/auth/TextField';
import { useAuth } from '../../context/AuthContext';
import { AuthApiError } from '../../services/authService';
import { destinoTrasAutenticar, erroresPorCampo, mensajeErrorAuth } from './mensajes';

interface Campos {
  nombreCompleto: string;
  nombreUsuario: string;
  email: string;
  telefono: string;
  contrasena: string;
  confirmar: string;
}

const CAMPOS_INICIALES: Campos = {
  nombreCompleto: '',
  nombreUsuario: '',
  email: '',
  telefono: '',
  contrasena: '',
  confirmar: '',
};

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function RegisterPage() {
  const { autenticado, cargando, registrar, usuario } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [campos, setCampos] = useState<Campos>(CAMPOS_INICIALES);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaReset, setCaptchaReset] = useState(0);
  const [verificacion, setVerificacion] = useState<string | null>(null);

  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    if (cargando || !autenticado || !usuario) return;
    navigate(destinoTrasAutenticar(location.state, usuario.rol), { replace: true });
  }, [cargando, autenticado, usuario, location.state, navigate]);

  const actualizar = (campo: keyof Campos) => (evento: ChangeEvent<HTMLInputElement>) => {
    setCampos((actuales) => ({ ...actuales, [campo]: evento.target.value }));
  };

  const validar = () => {
    const nuevos: Record<string, string> = {};
    if (campos.nombreCompleto.trim().length < 2) {
      nuevos.nombreCompleto = 'Escribe tu nombre completo.';
    }
    if (campos.nombreUsuario.trim().length < 3) {
      nuevos.nombreUsuario = 'El nombre de usuario debe tener al menos 3 caracteres.';
    } else if (campos.nombreUsuario.trim().length > 60) {
      nuevos.nombreUsuario = 'El nombre de usuario no puede superar 60 caracteres.';
    }
    if (!CORREO_VALIDO.test(campos.email.trim())) {
      nuevos.email = 'Escribe un correo electrónico válido.';
    }
    if (campos.telefono.trim().length < 7) {
      nuevos.telefono = 'El teléfono debe tener al menos 7 caracteres.';
    } else if (campos.telefono.trim().length > 30) {
      nuevos.telefono = 'El teléfono no puede superar 30 caracteres.';
    }
    if (campos.contrasena.length < 8) {
      nuevos.contrasena = 'La contraseña debe tener al menos 8 caracteres.';
    } else if (campos.contrasena.length > 200) {
      nuevos.contrasena = 'La contraseña no puede superar 200 caracteres.';
    }
    if (campos.confirmar !== campos.contrasena) {
      nuevos.confirmar = 'Las contraseñas no coinciden.';
    }

    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const onSubmit = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setErrorGeneral(null);

    if (!validar()) return;

    if (siteKey && !captchaToken) {
      setErrorGeneral('Completa la verificación anti-bot para crear tu cuenta.');
      return;
    }

    setEnviando(true);
    try {
      const resultado = await registrar({
        nombreCompleto: campos.nombreCompleto.trim(),
        nombreUsuario: campos.nombreUsuario.trim(),
        email: campos.email.trim(),
        telefono: campos.telefono.trim(),
        contrasena: campos.contrasena,
        captchaToken: captchaToken ?? undefined,
      });

      if (resultado.tipo === 'verificacion') {
        setVerificacion(resultado.mensaje);
      }
    } catch (error) {
      setErrores(erroresPorCampo(error));
      setErrorGeneral(mensajeErrorAuth(error));
      setCaptchaToken(null);
      setCaptchaReset((valor) => valor + 1);

      if (error instanceof AuthApiError && error.codigo === 'DATOS_INVALIDOS') {
        setErrorGeneral('Revisa los campos marcados e inténtalo de nuevo.');
      }
    } finally {
      setEnviando(false);
    }
  };

  if (verificacion) {
    return (
      <AuthLayout
        titulo="Cuenta creada"
        footer={
          <p>
            ¿Ya verificaste tu correo? <Link to="/login">Inicia sesión</Link>
          </p>
        }
      >
        <div className="auth-exito">
          <span className="auth-exito__icono" aria-hidden="true">
            ✓
          </span>
          <p>{verificacion}</p>
          <p>Cuando confirmes tu correo podrás entrar con el usuario que acabas de registrar.</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      amplio
      titulo="Crea tu cuenta"
      subtitulo="Regístrate para comprar tus libros favoritos y seguir tus pedidos."
      footer={
        <p>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        {errorGeneral && <AuthAlert tipo="error">{errorGeneral}</AuthAlert>}

        <TextField
          label="Nombre completo"
          id="registro-nombre"
          name="nombreCompleto"
          autoComplete="name"
          placeholder="ej. Alicia Liddell"
          value={campos.nombreCompleto}
          onChange={actualizar('nombreCompleto')}
          error={errores.nombreCompleto}
        />

        <TextField
          label="Nombre de usuario"
          id="registro-usuario"
          name="nombreUsuario"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="ej. alicia"
          value={campos.nombreUsuario}
          onChange={actualizar('nombreUsuario')}
          error={errores.nombreUsuario}
          hint="Entre 3 y 60 caracteres. Lo usarás para iniciar sesión."
        />

        <TextField
          label="Correo electrónico"
          id="registro-email"
          name="email"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="ej. alicia@wonderland.com"
          value={campos.email}
          onChange={actualizar('email')}
          error={errores.email}
          hint="Ahí recibirás los avisos de tu cuenta."
        />

        <TextField
          label="Teléfono"
          id="registro-telefono"
          name="telefono"
          type="tel"
          autoComplete="tel"
          placeholder="ej. 55 1234 5678"
          value={campos.telefono}
          onChange={actualizar('telefono')}
          error={errores.telefono}
          hint="Entre 7 y 30 caracteres."
        />

        <PasswordField
          label="Contraseña"
          id="registro-contrasena"
          name="contrasena"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          value={campos.contrasena}
          onChange={actualizar('contrasena')}
          error={errores.contrasena}
        />

        <PasswordField
          label="Confirmar contraseña"
          id="registro-confirmar"
          name="confirmar"
          autoComplete="new-password"
          placeholder="Repite tu contraseña"
          value={campos.confirmar}
          onChange={actualizar('confirmar')}
          error={errores.confirmar}
        />

        <Recaptcha onToken={setCaptchaToken} resetKey={captchaReset} />

        <AuthSubmit cargando={enviando} textoCargando="Creando cuenta…">
          Crear cuenta
        </AuthSubmit>
      </form>
    </AuthLayout>
  );
}
