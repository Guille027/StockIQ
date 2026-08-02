/** @type {import('tailwindcss').Config} */
// Calmer "learning app" palette on purpose: StockIQ teaches investing, it is
// not a trading floor. Muted teal/terracotta replace the classic aggressive
// green/red, indigo replaces "finance blue", and `accent` (amber) is reserved
// exclusively for XP, streaks and rewards.
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#FAFAF8",
        backgroundDark: "#101418",
        surface: "#F3F4F1",
        surfaceDark: "#181D23",
        card: "#FFFFFF",
        cardDark: "#1E242C",
        border: "#E7E5E0",
        borderDark: "#2A313A",
        primary: "#6366F1",
        primaryDark: "#818CF8",
        accent: "#F59E0B",
        accentDark: "#FBBF24",
        positive: "#2FA98C",
        positiveDark: "#5BC4A8",
        negative: "#E0755F",
        negativeDark: "#EE9B85",
        muted: "#77716A",
        mutedDark: "#98A0AA",
        ink: "#1F2328",
        inkDark: "#EDEFF2",
      },
    },
  },
  plugins: [],
};
