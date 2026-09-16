/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: { DEFAULT: 'var(--surface)', elevated: 'var(--surface-elevated)', muted: 'var(--surface-muted)' },
        ink: { DEFAULT: 'var(--text-primary)', secondary: 'var(--text-secondary)', muted: 'var(--text-muted)' },
        line: 'var(--border)',
        accent: { DEFAULT: 'var(--accent)', hover: 'var(--accent-hover)', muted: 'var(--accent-muted)', soft: 'var(--accent-soft)' },
        success: 'var(--success)', warning: 'var(--warning)', danger: 'var(--danger)',
        brand: { 50:'#f0f7ff',100:'#e0effe',200:'#bae0fd',300:'#7cc8fb',400:'#36aaf5',500:'#0c8ee6',600:'#0a7bc7',700:'#0866a8',800:'#064b84',900:'#0b3f6e',950:'#072849' },
        industrial: { 50:'#f4f5f7',100:'#e6e8ec',200:'#cfd3db',300:'#aeb5c2',400:'#868f9f',500:'#6b7485',600:'#565e6d',700:'#464d59',800:'#3c424c',900:'#2a2f38',950:'#14171c' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'], display: ['Inter', 'system-ui', 'sans-serif'] },
      borderRadius: { card: '12px', btn: '8px' },
      transitionDuration: { fast: '150ms', base: '200ms', slow: '280ms' },
      maxWidth: { content: '72rem', narrow: '48rem' },
    },
  },
  plugins: [],
}
