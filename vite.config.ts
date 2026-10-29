import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Custom Vite plugin to eliminate debug statements & console logs in production builds
function removeDebugInProduction(isProd: boolean) {
  if (!isProd) return null;
  return {
    name: 'remove-debug-in-production',
    transform(code: string, id: string) {
      if (id.includes('node_modules')) return null;
      const cleaned = code
        .replace(/\bdebugger\s*;?/g, '')
        .replace(/\bconsole\.(log|debug|info|trace|warn|error)\s*\([^;]*\)\s*;?/g, '/* removed */');
      return { code: cleaned, map: null };
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';
  return {
    plugins: [
      react(),
      tailwindcss(),
      removeDebugInProduction(isProd),
    ],
    build: {
      target: 'es2022',
      sourcemap: false,
    },
  };
})
