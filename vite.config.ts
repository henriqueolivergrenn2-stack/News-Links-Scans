import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  base: './',                    // Mantém build relativo (bom para deploy em subpastas ou Android)

  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),  // Alias @ → src/ continua funcionando
    },
  },

  server: {
    // Necessário para expor o servidor no Android/Termux e ngrok
    host: '0.0.0.0',

    // Porta padrão do Vite (pode mudar se quiser)
    port: 5173,

    // Permite o domínio do ngrok (resolve o erro "host is not allowed")
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'cokelike-nonexpiable-lakeisha.ngrok-free.dev',
      '.ngrok-free.dev',          // wildcard para todos os subdomínios ngrok-free (recomendado)
    ],

    // Seu proxy existente continua intacto
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        // Opcional: útil para debug
        // secure: false,
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },

    // Opcional: desativa o overlay de erro no browser (se ficar chato)
    // hmr: {
    //   overlay: false,
    // },
  },
});