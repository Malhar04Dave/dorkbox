import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // or whatever framework you are using

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})