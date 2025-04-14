
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { cartographerPlugin } from '@replit/vite-plugin-cartographer';
import { runtimeErrorPlugin } from '@replit/vite-plugin-runtime-error-modal';
import { shadcnThemePlugin } from '@replit/vite-plugin-shadcn-theme-json';

export default defineConfig({
  plugins: [
    react(),
    cartographerPlugin(),
    runtimeErrorPlugin(),
    shadcnThemePlugin()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5001,
    proxy: {
      '/api': {
        target: 'http://localhost:5002',
        changeOrigin: true
      }
    }
  }
});
