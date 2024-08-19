import type {Config} from 'tailwindcss'

const config: Config = {
  content: ['./src/components/**/*.tsx', './app/**/*.tsx'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 20px 3px #3B82F6',
      },
    },
  },
  daisyui: {
    themes: [
      {
        dark: {
          '.btn-success-gradient': {
            background: 'linear-gradient(to bottom, #34C759, #2E865F)',
            color: '#1E1E1E',
          },
          '.btn-error-gradient': {
            background: 'linear-gradient(to bottom, #FF3737, #C40000)',
            color: '#1E1E1E',
          },
          '.btn-warning-gradient': {
            background: 'linear-gradient(to bottom, #F2C464, #F7B733)',
            color: '#1E1E1E',
          },
          primary: '#4A5568',
          secondary: '#344055',
          accent: '#3B82F6',
          neutral: '#1F2937',
          success: '#34C759',
          error: '#E11D48',
          warning: '#F7DC6F',
          'base-100': '#000000',
        },
      },
    ],
  },
  plugins: [require('daisyui')],
}
export default config
