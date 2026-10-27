import { Route, Routes } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import AdminPage from '../features/auth/AdminPage';
import CuentaPage from '../features/auth/CuentaPage';
import ForgotPasswordPage from '../features/auth/ForgotPasswordPage';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import ResetPasswordPage from '../features/auth/ResetPasswordPage';
import HomePage from '../features/catalog/HomePage';
import RequireAuth from './RequireAuth';

function Pendiente({ titulo }: { titulo: string }) {
  return <p className="pendiente">{titulo}: pantalla pendiente de desarrollar.</p>;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Autenticación: pantallas con tarjeta propia, sin cabecera del catálogo. */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/recuperar-password" element={<ForgotPasswordPage />} />
      <Route path="/restablecer-password" element={<ResetPasswordPage />} />

      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/carrito" element={<Pendiente titulo="Carrito" />} />
        <Route
          path="/cuenta"
          element={
            <RequireAuth>
              <CuentaPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth roles={['ADMIN']}>
              <AdminPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Pendiente titulo="Página no encontrada" />} />
      </Route>
    </Routes>
  );
}
