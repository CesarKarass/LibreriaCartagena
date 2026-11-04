import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const authTarget = env.VITE_AUTH_PROXY_TARGET || 'http://localhost:3000';
  const coreTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:5000';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        // Microservicio de login (Node/Express).
        '/api/v1': { target: authTarget, changeOrigin: true },
        // API principal (C#): catálogo, compras, mermas, reportes y proveedores.
        // Ojo: /api/proveedores estaba enrutado aquí mismo a un Flask (5001) que
        // ya no existe; el CRUD de proveedores vive en ProveedoresController.cs.
        '/api': { target: coreTarget, changeOrigin: true },
      },
    },
  };
});
