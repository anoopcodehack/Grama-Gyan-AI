/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#c8f000",
        brandRed: "#e5473b"
      }
    },
  },
  plugins: [],
}
