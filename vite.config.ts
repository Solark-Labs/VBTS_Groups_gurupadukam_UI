import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
      define: {
        // This is just generic value for the GEMINI API key.
        // This is not used at all, and can be ignored!
        'process.env.API_KEY' : JSON.stringify('api-key-this-is-not-used-can-be-ignored!'),
      },
      server: {
        headers: {
          'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
        },
        proxy: {
          //Target your Node.js backend
          '/api-proxy': 'http://localhost:5000',
          '/api': 'http://localhost:5000',
          '/ws-proxy': {target: 'ws://localhost:5000', ws: true},
        },
      },
      plugins: [react()],
      build: {
        rolldownOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules/firebase')) return 'vendor-firebase';
              if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
                return 'vendor-react';
              }
              if (id.includes('node_modules/lucide-react')) return 'vendor-icons';
            },
          },
        },
      },
      resolve: {
        alias: {
          '@': import.meta.dirname,
        }
      }
    };
});
