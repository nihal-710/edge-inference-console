/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'JetBrains Mono'", "Consolas", "monospace"],
        sans: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
        display: ["'Syne'", "sans-serif"],
      },
      colors: {
        canvas:  { DEFAULT: "#080810", subtle: "#0c0c16", muted: "#10101c" },
        surface: { DEFAULT: "#13131e", raised: "#181826", overlay: "#1e1e2e" },
        border:  { DEFAULT: "#252538", subtle: "#1c1c2c", strong: "#363654" },
        text: {
          primary:   "#eaeaf5",
          secondary: "#8888aa",
          muted:     "#52526e",
          inverse:   "#080810",
        },
        accent: {
          cyan:        "#00d4ff",
          "cyan-dim":  "#0099bb",
          green:       "#00e887",
          "green-dim": "#00b868",
          amber:       "#ffb020",
          "amber-dim": "#cc8a10",
          red:         "#ff4466",
          "red-dim":   "#cc3355",
          purple:      "#a855f7",
          "purple-dim":"#8833dd",
          blue:        "#4488ff",
          "blue-dim":  "#2266dd",
        },
        status: {
          idle:       "#52526e",
          connecting: "#ffb020",
          streaming:  "#00d4ff",
          completed:  "#00e887",
          error:      "#ff4466",
          aborted:    "#a855f7",
        },
      },
      animation: {
        "pulse-dot":  "pulseDot 1.4s ease-in-out infinite",
        "fade-in":    "fadeIn 0.2s ease-out",
        "slide-up":   "slideUp 0.3s ease-out",
        "scanline":   "scanline 3s linear infinite",
      },
      boxShadow: {
        "card":  "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)",
        "card-lg": "0 4px 16px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)",
        "inner-top": "inset 0 1px 0 rgba(255,255,255,0.04)",
      },
    },
  },
  plugins: [],
};