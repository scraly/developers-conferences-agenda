/* eslint no-undef: 0 */  // --> OFF
import { join } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
	server: { 
		port: 8080,
		allowedHosts: true,
	 },
	preview: { port: 9090 },
  plugins: [react()],
  resolve: {
		alias: {
			utils: join(import.meta.dirname, 'src', 'utils'),
			components: join(import.meta.dirname, 'src', 'components'),
			contexts: join(import.meta.dirname, 'src', 'contexts'),
            routes: join(import.meta.dirname, 'src', 'routes'),
			"app.context": join(import.meta.dirname, 'src', 'app.context'),
			"app.hooks": join(import.meta.dirname, 'src', 'app.hooks'),
			"app.reducer": join(import.meta.dirname, 'src', 'app.reducer'),
			misc: join(import.meta.dirname, 'src', 'misc'),
			styles: join(import.meta.dirname, 'src', 'styles')
		}
  },
  build: {
		emptyOutDir: true,
		outDir: 'build'
	}
})
