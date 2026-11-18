import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        pv: {
          bg: "#07060d",
          panel: "#100e1c",
          panel2: "#161327",
          border: "#2a2444",
          purple: "#8b2fe0",
          purple2: "#a855f7",
          blue: "#2563ff",
          blue2: "#3b82f6",
          cyan: "#22d3ee",
          text: "#f5f3ff",
          muted: "#9a93b8",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(139,47,224,0.45), 0 0 40px rgba(37,99,255,0.25)",
        "glow-sm": "0 0 10px rgba(139,47,224,0.4)",
      },
      backgroundImage: {
        "pv-radial":
          "radial-gradient(circle at 20% 20%, rgba(139,47,224,0.25), transparent 50%), radial-gradient(circle at 80% 0%, rgba(37,99,255,0.25), transparent 50%), radial-gradient(circle at 50% 100%, rgba(34,211,238,0.12), transparent 60%)",
      },
      keyframes: {
        glowpulse: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        glowpulse: "glowpulse 3s ease-in-out infinite",
        floaty: "floaty 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
