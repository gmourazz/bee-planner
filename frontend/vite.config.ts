import { defineConfig } from 'vite'
import path from 'path'
import { spawn, ChildProcess } from 'child_process'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// Sobe o backend Go junto com o Vite dev server
function backendPlugin() {
  let proc: ChildProcess | null = null
  return {
    name: 'backend-go',
    configureServer() {
      const backendDir = path.resolve(__dirname, '../backend')
      proc = spawn('go', ['run', 'main.go'], {
        cwd: backendDir,
        stdio: 'inherit',
        shell: false,
      })
      proc.on('error', (err) => console.error('[backend-go]', err.message))
    },
    closeBundle() {
      proc?.kill()
    },
  }
}

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
    backendPlugin(),
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 5173,
    strictPort: true,
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
