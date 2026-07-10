/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        backgroundDark: "#0B1120",
        surface: "#F5F6F8",
        surfaceDark: "#131B2E",
        card: "#FFFFFF",
        cardDark: "#182238",
        border: "#E5E7EB",
        borderDark: "#1F2A3F",
        primary: "#2563EB",
        primaryDark: "#5B8DEF",
        positive: "#16A34A",
        positiveDark: "#34D399",
        negative: "#DC2626",
        negativeDark: "#F87171",
        muted: "#6B7280",
        mutedDark: "#8B93A7",
        ink: "#0F172A",
        inkDark: "#F1F5F9",
      },
    },
  },
  plugins: [],
};
