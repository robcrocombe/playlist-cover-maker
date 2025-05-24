import react from '@vitejs/plugin-react';
import autoprefixer from 'autoprefixer';
import { defineConfig, type Plugin } from 'vite';
import checker from 'vite-plugin-checker';

export default defineConfig({
  server: {
    port: 9000,
    strictPort: true,
  },
  preview: {
    port: 9000,
    strictPort: true,
  },
  plugins: [
    react(),
    checker({
      typescript: true,
    }),
    clearTerminal(),
  ],
  css: {
    postcss: {
      plugins: [autoprefixer],
    },
  },
});

function clearTerminal(): Plugin {
  return {
    name: 'clear-terminal',
    apply: 'serve',
    handleHotUpdate() {
      // Clear the terminal on hot reload
      process.stdout.write('\u001Bc\u001B[3J');
    },
  };
}
