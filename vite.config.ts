import react from '@vitejs/plugin-react';
import autoprefixer from 'autoprefixer';
import { defineConfig, type Plugin } from 'vite';
import checker from 'vite-plugin-checker';
import csp from 'vite-plugin-csp-guard';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig(({ mode }) => ({
  server: {
    port: 9000,
    strictPort: true,
    hmr: { overlay: false },
    // Use localhost IP to comply with Spotify redirect URI requirements
    host: '127.0.0.1',
  },
  preview: {
    port: 9000,
    strictPort: true,
  },
  base: '/playlist-cover-maker',
  plugins: [
    mkcert(),
    react(),
    checker({
      typescript: true,
    }),
    csp({
      dev: { run: true, outlierSupport: ['less'] },
      policy: {
        'style-src-elem': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'img-src': ["'self'", 'blob:', 'data:', 'https:'],
        'connect-src': [
          mode === 'development' ? "'self'" : '',
          'https://accounts.spotify.com',
          'https://api.spotify.com',
        ].filter(Boolean),
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
      },
      build: {
        sri: true,
      },
    }),
    clearTerminal(),
  ],
  css: {
    postcss: {
      plugins: [autoprefixer],
    },
  },
}));

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
