import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      'components': path.resolve(__dirname, './src/components'),
      'contexts': path.resolve(__dirname, './src/contexts'),
      'hooks': path.resolve(__dirname, './src/hooks'),
      'routes': path.resolve(__dirname, './src/routes'),
      'styles': path.resolve(__dirname, './src/styles'),
      'utils': path.resolve(__dirname, './src/utils'),
      'misc': path.resolve(__dirname, './src/misc'),
    }
  }
})
