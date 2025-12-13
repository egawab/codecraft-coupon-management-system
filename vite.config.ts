import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      assetsInclude: ['**/*.json'],
      build: {
        outDir: 'dist',
        assetsDir: 'assets',
        copyPublicDir: true,
        minify: 'esbuild',
        cssMinify: true,
        cssCodeSplit: true,
        rollupOptions: {
          output: {
            manualChunks: (id) => {
              // Vendor chunks - separate large dependencies
              if (id.includes('node_modules')) {
                if (id.includes('firebase')) {
                  return 'vendor-firebase';
                }
                if (id.includes('react') || id.includes('react-dom')) {
                  return 'vendor-react';
                }
                if (id.includes('react-router')) {
                  return 'vendor-router';
                }
                if (id.includes('@heroicons')) {
                  return 'vendor-icons';
                }
                return 'vendor-other';
              }
              
              // Location data chunks
              if (id.includes('utils/locationData/')) {
                const continent = id.split('locationData/')[1]?.split('.')[0];
                if (continent) {
                  return `location-${continent}`;
                }
              }
              
              // Dashboard chunks - separate large pages
              if (id.includes('pages/')) {
                if (id.includes('SuperAdminDashboard')) {
                  return 'page-super-admin';
                }
                if (id.includes('ShopOwnerDashboard')) {
                  return 'page-shop-owner';
                }
                if (id.includes('AffiliateDashboard')) {
                  return 'page-affiliate';
                }
                if (id.includes('AdminDashboard')) {
                  return 'page-admin';
                }
                if (id.includes('MarketplacePage')) {
                  return 'page-marketplace';
                }
              }
              
              // Services chunk
              if (id.includes('services/')) {
                return 'services';
              }
              
              // Utils chunk
              if (id.includes('utils/') && !id.includes('locationData')) {
                return 'utils';
              }
            },
            format: 'es',
            hoistTransitiveImports: false,
            // Optimize chunk names for better caching
            chunkFileNames: 'assets/[name]-[hash].js',
            entryFileNames: 'assets/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash].[ext]',
          },
          external: [],
          preserveEntrySignatures: 'strict'
        },
        commonjsOptions: {
          include: [/node_modules/],
          transformMixedEsModules: true,
        },
        target: 'es2020',
        sourcemap: true,
        // Increase chunk size warning limit since we're splitting intelligently
        chunkSizeWarningLimit: 600
      }
    };
});
