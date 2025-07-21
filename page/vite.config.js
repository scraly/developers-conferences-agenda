import { join } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

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
			utils: join(__dirname, 'src', 'utils'),
			components: join(__dirname, 'src', 'components'),
			contexts: join(__dirname, 'src', 'contexts'),
            routes: join(__dirname, 'src', 'routes'),
			"app.context": join(__dirname, 'src', 'app.context'),
			"app.hooks": join(__dirname, 'src', 'app.hooks'),
			"app.reducer": join(__dirname, 'src', 'app.reducer'),
			misc: join(__dirname, 'src', 'misc'),
			styles: join(__dirname, 'src', 'styles')
		}
  },
  build: {
		emptyOutDir: true,
		outDir: 'build'
	}
})
