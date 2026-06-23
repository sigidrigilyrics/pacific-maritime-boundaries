import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ocean: "#050B1D",
        primary: "#00E5FF",
        secondary: "#00AEEF",
        accent: "#8A3FFC",
        success: "#00D084",
        warning: "#F4B400",
      },
      boxShadow: {
        glow: "0 0 32px rgba(0,229,255,0.22)",
        purple: "0 0 34px rgba(138,63,252,0.2)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
