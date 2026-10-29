import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// base relativa para poder publicar en cualquier hosting estático (GitHub Pages, Netlify, etc.)
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  // xlsx y jspdf se cargan bajo demanda; su tamaño no afecta la carga inicial
  build: { chunkSizeWarningLimit: 600 },
});
