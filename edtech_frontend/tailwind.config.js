/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'premium-light': '0 10px 30px rgba(30, 64, 175, 0.10)',
      },
      colors: {
        richblack: {
          5: "#F1F2FF",
          25: "#DBD9E1",
          50: "#C5C7D4",
          100: "#AFB2BF",
          200: "#999DAA",
          300: "#838894",
          400: "#6D727F",
          500: "#585D69",
          600: "#424854",
          700: "#2C333F",
          800: "#161D29",
          900: "#000814",
        },
        yellow: {
          5: "#FFD60A",
          25: "#FFEE32",
          50: "#FFD60A",
          100: "#FBC02D",
          200: "#F9A825",
          300: "#F57F17",
          400: "#F57C00",
          500: "#EF6C00",
        },
        blue: {
          5: "#13D8FF",
          25: "#13D8FF",
          50: "#1FA7FF",
          100: "#47A5F5",
          200: "#64B5F6",
          300: "#90CAF9",
          400: "#BBDEFB",
          500: "#3BA7F2",
          600: "#3BA7F2",
          700: "#3BA7F2",
        },
        indigo: {
          500: "#3BA7F2",
          600: "#3BA7F2",
          700: "#3BA7F2",
        },
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        mono: ["Roboto Mono", "monospace"],
      },
    },
  },
  plugins: [],
}
