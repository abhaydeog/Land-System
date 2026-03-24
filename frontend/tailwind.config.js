/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1a4f7a', light: '#e8f2fb', mid: '#3a7fc1', dark: '#153e61' },
        accent:  { DEFAULT: '#c8872a', light: '#fdf3e3' },
        success: { DEFAULT: '#2d7d46', light: '#e8f5ec' },
        danger:  { DEFAULT: '#b03030', light: '#fdeaea' },
        warning: { DEFAULT: '#a06010', light: '#fef5e0' },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
