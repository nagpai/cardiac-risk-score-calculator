import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  const isProduction = mode === 'production'
  const enableAnalyzer = env.VITE_BUILD_ANALYZE === 'true'
  const enableSourcemap = env.VITE_BUILD_SOURCEMAP === 'true'

  return {
    plugins: [
      react({
        // Enable React Fast Refresh in development
        fastRefresh: !isProduction,
      }),
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

    build: {
      // Target modern browsers for better performance
      target: 'es2020',
      
      // Enable code splitting
      rollupOptions: {
        output: {
          // Manual chunks for better caching
          manualChunks: {
            // Vendor chunk for React and related libraries
            vendor: ['react', 'react-dom'],
            // Chart.js and related libraries
            charts: ['chart.js', 'react-chartjs-2'],
            // Form handling libraries
            forms: ['react-hook-form'],
          },
          // Optimize asset file names for caching
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.') || []
            let extType = info[info.length - 1]
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
              extType = 'img'
            } else if (/woff|woff2|eot|ttf|otf/i.test(extType)) {
              extType = 'fonts'
            }
            return `assets/${extType}/[name]-[hash][extname]`
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
        },
      },
      
      // Optimize chunk size warnings
      chunkSizeWarningLimit: 1000,
      
      // Source maps based on environment
      sourcemap: enableSourcemap,
      
      // Minification settings
      minify: isProduction ? 'terser' : false,
      terserOptions: isProduction ? {
        compress: {
          drop_console: true, // Remove console.log in production
          drop_debugger: true,
        },
        mangle: {
          safari10: true,
        },
      } : undefined,
      
      // CSS code splitting
      cssCodeSplit: true,
      
      // Optimize CSS
      cssMinify: isProduction,
      
      // Report compressed file sizes
      reportCompressedSize: isProduction,
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
      // Enable HTTP/2 in development
      https: false,
    },

    // Preview server configuration
    preview: {
      port: 4173,
      open: true,
      cors: true,
    },

    // CSS configuration
    css: {
      // Enable CSS modules
      modules: {
        localsConvention: 'camelCase',
      },
      // PostCSS configuration
      postcss: {
        plugins: [],
      },
    },

    // Environment variables prefix
    envPrefix: 'VITE_',
  }
})
