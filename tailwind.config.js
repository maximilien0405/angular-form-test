/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        red: "#A5283A",
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}