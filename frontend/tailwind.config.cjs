/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'main': {
          DEFAULT: '#92c51b',
          'dark': '#92c51b',
          'light': '#f0f7e6',
        }
      }
    },
  },
  plugins: [],
}