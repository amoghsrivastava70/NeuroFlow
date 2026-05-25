/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        card: 'rgb(var(--color-card) / <alpha-value>)',
        'card-hover': 'rgb(var(--color-card-hover) / <alpha-value>)',
        'accent-indigo': 'rgb(var(--color-accent-indigo) / <alpha-value>)',
        'accent-teal': 'rgb(var(--color-accent-teal) / <alpha-value>)',
        'accent-rose': 'rgb(var(--color-accent-rose) / <alpha-value>)',
        'accent-amber': 'rgb(var(--color-accent-amber) / <alpha-value>)',
        'text-primary': 'rgb(var(--color-text-primary) / <alpha-value>)',
        'text-muted': 'rgb(var(--color-text-muted) / <alpha-value>)',
        'text-faint': 'rgb(var(--color-text-faint) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        overlay: 'rgb(var(--color-overlay) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, rgb(var(--color-accent-indigo)), rgb(56 189 248))',
        'gradient-page': 'radial-gradient(circle at top, rgb(var(--color-page-glow) / 0.18), transparent 38%), linear-gradient(180deg, rgb(var(--color-primary)), rgb(var(--color-secondary)))',
      }
    },
  },
  plugins: [],
}
