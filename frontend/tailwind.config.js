/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          navy: { 800: '#1e293b', 900: '#0f172a' },
          teal: { 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488' }
        }
      },
    },
    plugins: [],
  }