/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0a0f1e",
        "navy-light": "#0d1b2a",
        blue: {
          electric: "#3b82f6",
        },
        violet: {
          accent: "#7c3aed",
        },
        cyan: {
          accent: "#06b6d4",
        },
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
