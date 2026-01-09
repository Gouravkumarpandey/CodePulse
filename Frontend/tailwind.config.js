/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        github: {
          bg: '#0d1117',
          canvas: '#010409',
          border: '#30363d',
          'border-muted': '#21262d',
          text: '#e6edf3',
          'text-secondary': '#7d8590',
          'text-link': '#58a6ff',
          success: '#2ea043',
          warning: '#d29922',
          danger: '#da3633',
          accent: '#1f6feb',
          'accent-emphasis': '#388bfd',
          'canvas-subtle': '#161b22',
          'canvas-inset': '#010409',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
