import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['pdfjs-dist', 'pdf-lib', 'jszip', 'file-saver']
  },
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 2000
  }
});
