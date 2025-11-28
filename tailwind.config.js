/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './components/**/*.{ts,tsx}',
    './services/**/*.{ts,tsx}',
    './types.ts',
    './test-gemini.ts',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        gray: {
          750: '#2d3748',
          850: '#1a202c',
          950: '#0d1117',
        },
      },
    },
  },
  plugins: [],
};
