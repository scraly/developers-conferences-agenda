import { join } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
	server: { port: 8080 },
	preview: { port: 9090 },
  plugins: [react()],
  resolve: {
		alias: {
			utils: join(__dirname, 'src', 'utils'),
			components: join(__dirname, 'src', 'components'),
			"app.context": join(__dirname, 'src', 'app.context'),
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
