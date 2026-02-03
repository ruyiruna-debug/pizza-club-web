import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'src/main.jsx'),
      output: {
        format: 'iife',
        entryFileNames: 'wallet-bundle.js',
        chunkFileNames: 'wallet-[name].js',
        assetFileNames: 'wallet-bundle.[ext]',
      },
    },
  },
});
