import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react({
      // Fast Refresh options to prevent caching issues
      fastRefresh: true,
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  // Build configuration to prevent caching issues
  build: {
    // Generate unique file names with content hash to bust cache
    rollupOptions: {
      output: {
        // Ensure consistent file naming
        manualChunks: undefined,
        // Add hash to filenames for cache busting
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
    // Ensure source maps for better debugging
    sourcemap: true,
  },

  // Development server configuration
  server: {
    // Force disable caching during development
    headers: {
      'Cache-Control': 'no-store',
    },
    // Improved HMR configuration to prevent connection errors
    hmr: {
      overlay: true,
      // Add timeout and protocol settings
      timeout: 30000,
      // Handle connection errors gracefully
      clientPort: undefined,
    },
    // Watch configuration to improve stability
    watch: {
      // Ignore node_modules to reduce overhead
      ignored: ['**/node_modules/**', '**/.git/**'],
    },
  },

  // Optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router'],
  },
})