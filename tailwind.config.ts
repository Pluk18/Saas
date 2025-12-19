import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Earth Tone Professional Color Palette
        primary: {
          50: '#faf8f3',
          100: '#f3ede0',
          200: '#e7d9c0',
          300: '#d6bd97',
          400: '#c4a06d',
          500: '#b8884f',
          600: '#aa7343',
          700: '#8d5c38',
          800: '#734c33',
          900: '#5f402c',
        },
        secondary: {
          50: '#f8f7f4',
          100: '#eeeadf',
          200: '#ddd4be',
          300: '#c6b798',
          400: '#af9872',
          500: '#9d8256',
          600: '#8f704a',
          700: '#765a3e',
          800: '#624a36',
          900: '#523e2e',
        },
        accent: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        neutral: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
      },
      fontFamily: {
        sans: ['var(--font-sarabun)', 'system-ui', 'sans-serif'],
        display: ['var(--font-kanit)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}
export default config

