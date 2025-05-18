import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://habitvault-backend-js12.onrender.com',
        changeOrigin: true,
      },
    },
  },
}); 