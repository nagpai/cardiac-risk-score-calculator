import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  const isProduction = mode === 'production'
  const enableAnalyzer = env.VITE_BUILD_ANALYZE === 'true'
  const enableSourcemap = env.VITE_BUILD_SOURCEMAP === 'true'

  return {
    plugins: [
      react(),
      // Bundle analyzer - only in development or when explicitly enabled
      ...(enableAnalyzer ? [
        visualizer({
          filename: 'dist/stats.html',
          open: !isProduction,
          gzipSize: true,
          brotliSize: true,
          template: 'treemap', // sunburst, treemap, network
        })
      ] : []),
    ],
    
    // Define global constants
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
      __APP_NAME__: JSON.stringify(env.VITE_APP_NAME || 'Cardiac Risk Calculator'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },

    // Force esbuild instead of rollup for production builds
    esbuild: isProduction ? {
      target: 'es2020',
      minify: true,
      treeShaking: true,
    } : undefined,

    build: {
      // Target modern browsers for better performance
      target: 'es2020',
      
      // Simplified rollup options - avoid complex chunking that can cause native binary issues
      rollupOptions: {
        output: {
          // Disable manual chunking to avoid rollup native binary issues
          manualChunks: undefined,
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
        },
      },
      
      // Optimize chunk size warnings
      chunkSizeWarningLimit: 1000,
      
      // Source maps based on environment
      sourcemap: enableSourcemap,
      
      // Use esbuild for minification to avoid rollup native binary issues
      minify: isProduction ? 'esbuild' : false,
      
      // CSS code splitting
      cssCodeSplit: true,
      
      // Optimize CSS
      cssMinify: isProduction,
      
      // Report compressed file sizes
      reportCompressedSize: isProduction,
      
      // Optimize asset inlining
      assetsInlineLimit: 4096,
      
      // Enable/disable asset hashing
      assetsDir: 'assets',
      
      // Production-specific optimizations
      ...(isProduction && {
        // Enable polyfill detection
        polyfillModulePreload: true,
        // Optimize module preload
        modulePreload: {
          polyfill: true,
        },
      }),
    },

    // Performance optimizations
    optimizeDeps: {
      include: [
        'react', 
        'react-dom', 
        'chart.js', 
        'react-chartjs-2', 
        'react-hook-form'
      ],
      // Force pre-bundling of these dependencies
      force: isProduction,
    },

    // Server configuration for development
    server: {
      port: 3000,
      open: true,
      cors: true,
    },

    // Preview server configuration
    preview: {
      port: 4173,
      open: true,
      cors: true,
    },

    // CSS configuration
    css: {
      // Enable CSS modules for .module.css files only
      modules: {
        localsConvention: 'camelCase',
      },
      // PostCSS configuration will use postcss.config.js
    },

    // Environment variables prefix
    envPrefix: 'VITE_',
  }
})
