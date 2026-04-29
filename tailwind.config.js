/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
        sans: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        bg: "#0d0d0f",
        surface: "#16161a",
        border: "#252530",
        accent: "#6ee7b7",
        "accent-dim": "#34d399",
        muted: "#4a4a5a",
        text: "#e8e8f0",
        "text-dim": "#8888a0",
        danger: "#f87171",
        warning: "#fbbf24",
        info: "#60a5fa",
      },
    },
  },
  plugins: [],
};

