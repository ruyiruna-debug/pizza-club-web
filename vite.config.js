import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/wallet-connect.js',
      name: 'OKXWalletConnect',
      fileName: 'wallet-connect',
      formats: ['iife'],
    },
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        extend: true,
        inlineDynamicImports: true,
      },
    },
  },
});
