import type {Config} from 'tailwindcss'
import {nextui} from '@nextui-org/react'

const config: Config = {
  content: [
    './src/components/**/*.tsx',
    './app/**/*.tsx',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 20px 3px #3B82F6',
      },
    },
  },
  darkMode: 'class',
  plugins: [nextui()],
}
export default config
