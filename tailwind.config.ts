import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#B8962E',
          light: '#C9A84C',
          subtle: '#E8D5A3',
        },
        surface: {
          DEFAULT: '#EFECE5',
          dark: '#E4E0D5',
        },
        background: '#F7F5F0',
        sidebar: '#1E1B16',
        'text-primary': '#1A1814',
        'text-secondary': '#5C5750',
        'text-muted': '#9C968E',
        danger: '#C0392B',
        success: '#2E7D52',
        info: '#2C5F8A',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
