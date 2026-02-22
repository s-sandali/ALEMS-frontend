/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: "#D5FF40",
        bg: "#0C0C0C",
        surface: "#151515",
        muted: "#C0C2B8",
        "text-primary": "#FFFFFF",
        "text-secondary": "#A1A1A1",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
