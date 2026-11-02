import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import { AuthAlert, AuthSubmit } from '../../components/auth/FormFeedback';
import Recaptcha from '../../components/auth/Recaptcha';
import { PasswordField, TextField } from '../../components/auth/TextField';
import { useAuth } from '../../context/AuthContext';
import { AuthApiError, consultarDisponibilidadUsuario } from '../../services/authService';
import {
  requisitosContrasena,
  soloDigitos,
  sugerenciasUsuario,
  validarContrasena,
  validarCorreo,
  validarNombreCompleto,
  validarNombreUsuario,
  validarTelefono,
} from '../../utils/validacion';
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

type EstadoDisponibilidad = 'inicial' | 'verificando' | 'disponible' | 'ocupado' | 'sin-conexion';

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
  const [disponibilidad, setDisponibilidad] = useState<EstadoDisponibilidad>('inicial');
  const [sugerencias, setSugerencias] = useState<string[]>([]);

  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  const requisitos = useMemo(() => requisitosContrasena(campos.contrasena), [campos.contrasena]);

  useEffect(() => {
    if (cargando || !autenticado || !usuario) return;
    navigate(destinoTrasAutenticar(location.state, usuario.rol), { replace: true });
  }, [cargando, autenticado, usuario, location.state, navigate]);

  // Comprueba en el servidor si el nombre de usuario ya existe (con rebote).
  useEffect(() => {
    const nombre = campos.nombreUsuario.trim();
    if (validarNombreUsuario(nombre)) {
      setDisponibilidad('inicial');
      setSugerencias([]);
      return;
    }

    let cancelado = false;
    setDisponibilidad('verificando');
    const temporizador = window.setTimeout(async () => {
      try {
        const resultado = await consultarDisponibilidadUsuario(nombre, campos.nombreCompleto);
        if (cancelado) return;
        if (resultado.disponible) {
          setDisponibilidad('disponible');
          setSugerencias([]);
        } else {
          setDisponibilidad('ocupado');
          setSugerencias(resultado.sugerencias ?? []);
        }
      } catch {
        if (cancelado) return;
        setDisponibilidad('sin-conexion');
        setSugerencias(sugerenciasUsuario(nombre, campos.nombreCompleto));
      }
    }, 500);

    return () => {
      cancelado = true;
      window.clearTimeout(temporizador);
    };
  }, [campos.nombreUsuario, campos.nombreCompleto]);

  const actualizar = (campo: keyof Campos) => (evento: ChangeEvent<HTMLInputElement>) => {
    const valor = evento.target.value;
    setCampos((actuales) => ({
      ...actuales,
      [campo]: campo === 'telefono' ? soloDigitos(valor).slice(0, 10) : valor,
    }));
    setErrores((actuales) => {
      if (!actuales[campo]) return actuales;
      const siguiente = { ...actuales };
      delete siguiente[campo];
      return siguiente;
    });
  };

  const validar = () => {
    const nuevos: Record<string, string> = {};
    const nombreCompleto = validarNombreCompleto(campos.nombreCompleto);
    const nombreUsuario = validarNombreUsuario(campos.nombreUsuario);
    const email = validarCorreo(campos.email);
    const telefono = validarTelefono(campos.telefono);
    const contrasena = validarContrasena(campos.contrasena);

    if (nombreCompleto) nuevos.nombreCompleto = nombreCompleto;
    if (nombreUsuario) nuevos.nombreUsuario = nombreUsuario;
    if (email) nuevos.email = email;
    if (telefono) nuevos.telefono = telefono;
    if (contrasena) nuevos.contrasena = contrasena;
    if (campos.confirmar !== campos.contrasena) nuevos.confirmar = 'Las contraseñas no coinciden.';

    if (disponibilidad === 'ocupado') {
      nuevos.nombreUsuario = 'Ese nombre de usuario ya está registrado. Elige otro o usa una sugerencia.';
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
        email: campos.email.trim().toLowerCase(),
        telefono: soloDigitos(campos.telefono),
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

      if (error instanceof AuthApiError && error.codigo === 'USUARIO_YA_EXISTE') {
        setDisponibilidad('ocupado');
        setErrores((actuales) => ({
          ...actuales,
          nombreUsuario: 'Ese nombre de usuario o correo ya está registrado.',
        }));
      }

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
        variante="registro"
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
      variante="registro"
      footer={
        <p>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
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
          placeholder="Ej. Alicia Liddell"
          value={campos.nombreCompleto}
          onChange={actualizar('nombreCompleto')}
          error={errores.nombreCompleto}
          hint="Solo letras, espacios, apóstrofes, puntos y guiones."
        />

        <TextField
          label="Usuario"
          id="registro-usuario"
          name="nombreUsuario"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="Ej. alicia_wonder"
          value={campos.nombreUsuario}
          onChange={actualizar('nombreUsuario')}
          error={errores.nombreUsuario}
          hint={
            disponibilidad === 'inicial'
              ? 'Entre 3 y 60 caracteres. Lo usarás para iniciar sesión.'
              : undefined
          }
        />

        {disponibilidad !== 'inicial' && (
          <div
            className={`auth-disponibilidad auth-disponibilidad--${disponibilidad}`}
            role="status"
            aria-live="polite"
          >
            {disponibilidad === 'verificando' && <p>Comprobando disponibilidad…</p>}
            {disponibilidad === 'disponible' && <p>✓ Nombre de usuario disponible.</p>}
            {disponibilidad === 'ocupado' && (
              <>
                <p>✗ Ese nombre de usuario ya está registrado. Te sugerimos:</p>
                {sugerencias.length > 0 && (
                  <div className="auth-sugerencias">
                    {sugerencias.map((sugerencia) => (
                      <button
                        key={sugerencia}
                        type="button"
                        className="auth-sugerencia"
                        onClick={() => {
                          setCampos((actuales) => ({ ...actuales, nombreUsuario: sugerencia }));
                          setErrores((actuales) => {
                            const siguiente = { ...actuales };
                            delete siguiente.nombreUsuario;
                            return siguiente;
                          });
                        }}
                      >
                        {sugerencia}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
            {disponibilidad === 'sin-conexion' && (
              <>
                <p>No pudimos verificar en línea. Puedes continuar; el servidor validará el duplicado.</p>
                {sugerencias.length > 0 && (
                  <div className="auth-sugerencias">
                    {sugerencias.map((sugerencia) => (
                      <button
                        key={sugerencia}
                        type="button"
                        className="auth-sugerencia"
                        onClick={() =>
                          setCampos((actuales) => ({ ...actuales, nombreUsuario: sugerencia }))
                        }
                      >
                        {sugerencia}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <TextField
          label="Correo electrónico"
          id="registro-email"
          name="email"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="alicia@wonderland.com"
          value={campos.email}
          onChange={actualizar('email')}
          error={errores.email}
          hint="Debe incluir @ y terminar en .com."
        />

        <TextField
          label="Teléfono"
          id="registro-telefono"
          name="telefono"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          maxLength={10}
          placeholder="Ej. 5512345678"
          value={campos.telefono}
          onChange={actualizar('telefono')}
          error={errores.telefono}
          hint={`Exactamente 10 dígitos (${campos.telefono.length}/10).`}
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

        <ul className="auth-requisitos" aria-label="Requisitos de la contraseña">
          {requisitos.map((requisito) => (
            <li
              key={requisito.clave}
              className={requisito.cumple ? 'auth-requisito auth-requisito--ok' : 'auth-requisito'}
            >
              <span aria-hidden="true">{requisito.cumple ? '✓' : '○'}</span> {requisito.etiqueta}
            </li>
          ))}
        </ul>

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
          Crear Cuenta
        </AuthSubmit>
      </form>
    </AuthLayout>
  );
}
