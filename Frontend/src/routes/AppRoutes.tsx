import { Route, Routes } from 'react-router-dom';
import HomePage from '../features/catalog/HomePage';
import Layout from '../components/layout/Layout';

function Pendiente({ titulo }: { titulo: string }) {
  return <p className="pendiente">{titulo}: pantalla pendiente de desarrollar.</p>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/carrito" element={<Pendiente titulo="Carrito" />} />
        <Route path="/cuenta" element={<Pendiente titulo="Mi cuenta" />} />
        <Route path="*" element={<Pendiente titulo="Página no encontrada" />} />
      </Route>
    </Routes>
  );
}
