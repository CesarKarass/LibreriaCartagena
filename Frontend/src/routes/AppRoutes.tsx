import { Route, Routes } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import AdminPage from '../features/auth/AdminPage';
import CuentaPage from '../features/auth/CuentaPage';
import ForgotPasswordPage from '../features/auth/ForgotPasswordPage';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import ResetPasswordPage from '../features/auth/ResetPasswordPage';
import HomePage from '../features/catalog/HomePage';
import BookDetailPage from '../features/catalog/BookDetailPage';
import CartPage from '../features/cart/CartPage';
import CheckoutPage from '../features/checkout/CheckoutPage';
import PedidoPage from '../features/checkout/PedidoPage';
import AdminInventarioPage from '../features/admin/AdminInventarioPage';
import AdminProveedoresPage from '../features/admin/proveedores/AdminProveedoresPage';
import TerminosPage from '../features/legal/TerminosPage';
import AvisoPrivacidadPage from '../features/legal/AvisoPrivacidadPage';
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
        <Route path="/libro/:id" element={<BookDetailPage />} />
        <Route path="/carrito" element={<CartPage />} />
        {/* Checkout: sólo con cuenta (el invitado es redirigido a /login). */}
        <Route
          path="/checkout"
          element={
            <RequireAuth>
              <CheckoutPage />
            </RequireAuth>
          }
        />
        <Route
          path="/pedido/:id"
          element={
            <RequireAuth>
              <PedidoPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/inventario"
          element={
            <RequireAuth roles={['ADMIN']}>
              <AdminInventarioPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/proveedores"
          element={
            <RequireAuth roles={['ADMIN']}>
              <AdminProveedoresPage />
            </RequireAuth>
          }
        />
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
        {/* Páginas legales: públicas, con la cabecera y el pie del catálogo. */}
        <Route path="/terminos" element={<TerminosPage />} />
        <Route path="/aviso-privacidad" element={<AvisoPrivacidadPage />} />
        <Route path="*" element={<Pendiente titulo="Página no encontrada" />} />
      </Route>
    </Routes>
  );
}
