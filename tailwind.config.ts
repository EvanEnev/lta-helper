import type {Config} from 'tailwindcss'

const config: Config = {
  content: ['./src/components/**/*.tsx', './app/**/*.tsx'],
  theme: {},
  daisyui: {
    themes: [
      {
        dark: {
          primary: '#4A5568',
          secondary: '#344055',
          accent: '#10B981',
          neutral: '#1F2937',
          success: '#34C759',
          error: '#E11D48',
          warning: '#F7DC6F',
          'base-100': '#252D3C',
        },
      },
    ],
  },
  plugins: [require('daisyui')],
}
export default config
