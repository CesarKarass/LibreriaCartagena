import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const authTarget = env.VITE_AUTH_PROXY_TARGET || 'http://localhost:3000';
  const coreTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:5000';
  const proveedoresTarget = env.VITE_PROVEEDORES_PROXY_TARGET || 'http://localhost:5001';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        // Microservicio de login (Node/Express).
        '/api/v1': { target: authTarget, changeOrigin: true },
        // Microservicio de proveedores (Flask). Va antes que /api porque la API
        // principal no expone esas rutas; en Docker las enruta el gateway.
        '/api/proveedores': { target: proveedoresTarget, changeOrigin: true },
        // API principal (C#): catálogo, compras, mermas y reportes.
        '/api': { target: coreTarget, changeOrigin: true },
      },
    },
  };
});
