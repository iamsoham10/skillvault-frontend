/** @type {import('tailwindcss').Config} */
import PrimeUI from "tailwindcss-primeui";
export default {
  content: ["./src/**/*.{html,ts,css}"],
  theme: {
    extend: {
      animation: {
        fadeInFromBottom: "fadeInFromBottom 1s ease-in-out",
      },
      keyframes: {
        fadeInFromBottom: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      fontFamily: {
        primary: ["Quicksand", "ui-sans-serif", "system-ui", "sans-serif"],
        secondary: ["Space Mono", "ui-monospace", "monospace"],
      },
      colors: {
        text: "#e6e9ef",
        background: "#090e15",
        subbackground: "#10161F",
        primary: "#89acdc",
        secondary: "#1a4f99",
        accent: "#3684f2",
      },
    },
  },
  plugins: [PrimeUI],
};
