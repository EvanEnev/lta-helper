import type {Config} from 'tailwindcss'
import {heroui} from '@heroui/react'

const config: Config = {
  content: [
    './src/**/*.tsx',
    './app/**/*.tsx',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 20px 3px #3B82F6',
      },
      gridColumnStart: {
        '13': '13',
        '14': '14',
        '15': '15',
        '16': '16',
        '17': '17',
        '18': '18',
      },
    },
  },
  darkMode: 'class',
  plugins: [heroui()],
}
export default config
