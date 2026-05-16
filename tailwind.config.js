/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", "Consolas", "monospace"],
        sans: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
      },
      colors: {
        // Design system: dark console aesthetic
        canvas: {
          DEFAULT: "#0a0a0f",
          subtle: "#0f0f17",
          muted: "#141420",
        },
        surface: {
          DEFAULT: "#16161f",
          raised: "#1c1c28",
          overlay: "#222232",
        },
        border: {
          DEFAULT: "#2a2a3d",
          subtle: "#1f1f2e",
          strong: "#3d3d5c",
        },
        text: {
          primary: "#e8e8f0",
          secondary: "#9090b0",
          muted: "#5a5a7a",
          inverse: "#0a0a0f",
        },
        accent: {
          cyan: "#00d4ff",
          "cyan-dim": "#00a8cc",
          green: "#00ff9d",
          "green-dim": "#00cc7a",
          amber: "#ffb400",
          "amber-dim": "#cc8f00",
          red: "#ff4d6a",
          "red-dim": "#cc3d55",
          purple: "#9d4edd",
          "purple-dim": "#7b3db0",
        },
        status: {
          idle: "#5a5a7a",
          connecting: "#ffb400",
          streaming: "#00d4ff",
          completed: "#00ff9d",
          error: "#ff4d6a",
          aborted: "#9d4edd",
        },
      },
      keyframes: {
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "pulse-dot": "pulse-dot 1.2s ease-in-out infinite",
        "slide-in": "slide-in 0.2s ease-out",
        "fade-in": "fade-in 0.15s ease-out",
      },
    },
  },
  plugins: [],
};