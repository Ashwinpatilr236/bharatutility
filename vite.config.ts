import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Split third-party vendor code
            if (id.includes('node_modules')) {
              if (id.includes('recharts') || id.includes('d3-') || id.includes('victory') || id.includes('internmap') || id.includes('decimal.js-light')) {
                return 'vendor-charts';
              }
              if (id.includes('@supabase')) {
                return 'vendor-supabase';
              }
              if (id.includes('react') || id.includes('scheduler') || id.includes('motion')) {
                return 'vendor-framework';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
            }
            // Split massive data registries
            if (id.includes('src/data/toolsRegistry.ts')) {
              return 'data-tools';
            }
            if (id.includes('src/data/contentRegistry.ts')) {
              return 'data-content';
            }
            // Group calculator components by functional domains for optimal caching and fast mobile load
            if (id.includes('src/components/calculators/')) {
              if (
                id.includes('Emi') ||
                id.includes('Sip') ||
                id.includes('Fd') ||
                id.includes('Salary') ||
                id.includes('Finance') ||
                id.includes('Tax') ||
                id.includes('Tds') ||
                id.includes('Cagr') ||
                id.includes('Xirr') ||
                id.includes('Lumpsum') ||
                id.includes('Swp')
              ) {
                return 'calculators-money';
              }
              if (
                id.includes('Government') ||
                id.includes('Official') ||
                id.includes('Legal') ||
                id.includes('Ayushman') ||
                id.includes('Citizen')
              ) {
                return 'calculators-gov';
              }
              if (
                id.includes('Travel') ||
                id.includes('Vehicle') ||
                id.includes('Fuel') ||
                id.includes('Ev')
              ) {
                return 'calculators-transit';
              }
              if (
                id.includes('Document') ||
                id.includes('Text') ||
                id.includes('Svg') ||
                id.includes('ExamPhoto')
              ) {
                return 'calculators-documents';
              }
              return 'calculators-utility';
            }
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify-file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
