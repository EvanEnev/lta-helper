import vinext from 'vinext'
import {defineConfig} from 'vite'
import {cjsInterop} from 'vite-plugin-cjs-interop'

export default defineConfig({
  ssr: {
    noExternal: true,
    external: ['react-aria-components', 'heroui'],
  },
  plugins: [
    vinext(),
    cjsInterop({
      dependencies: [
        'semver',
        'jszip',
        'readable-stream',
        'glob',
        'fstream',
        'async',
        'googleapis',
        'googleapis-common',
        'winston',
        'cookies-next',
      ],
    }),
  ],
})
