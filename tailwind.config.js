// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}", // This line ensures Tailwind scans your Vue files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}