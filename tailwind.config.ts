import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        panel: "rgba(255, 255, 255, 0.92)",
        line: "rgba(15, 23, 42, 0.1)",
        mint: "#16a34a",
        cyan: "#2563eb",
        amber: "#d97706",
        rose: "#dc2626"
      },
      boxShadow: {
        glow: "0 12px 32px rgba(37, 99, 235, 0.18)",
        card: "0 18px 44px rgba(15, 23, 42, 0.12)"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
