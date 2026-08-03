/** @type {import('tailwindcss').Config} */
// StockIQ Claude Design system: dark is the PRIMARY theme (more serious,
// less "game app" than a light-first look) -- the app still fully supports
// light mode (synced to system by default, overridable in Ajustes), it's
// just designed dark-first. Deep indigo + amber, and a desaturated
// teal/terracotta in place of aggressive trading green/red. `accent` (amber)
// is reserved exclusively for XP/streak/rewards -- never any other context.
// Every screen uses the `bg-X dark:bg-XDark` pattern, so X = light value,
// XDark = dark value (same convention as before this palette swap).
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#f7f5f1",
        backgroundDark: "#101019",
        surface: "#efece3",
        surfaceDark: "#232535",
        card: "#ffffff",
        cardDark: "#1a1c27",
        border: "rgba(20,20,30,0.10)",
        borderDark: "rgba(255,255,255,0.08)",
        primary: "#6a56e0",
        primaryDark: "#8b7cf6",
        primarySoft: "rgba(106,86,224,0.12)",
        primarySoftDark: "rgba(139,124,246,0.16)",
        accent: "#b9822f",
        accentDark: "#e8c77a",
        accentSoft: "rgba(185,130,47,0.12)",
        accentSoftDark: "rgba(232,199,122,0.16)",
        positive: "#3f7d64",
        positiveDark: "#6fae94",
        positiveSoft: "rgba(63,125,100,0.12)",
        positiveSoftDark: "rgba(111,174,148,0.16)",
        negative: "#a85a3f",
        negativeDark: "#c9846a",
        negativeSoft: "rgba(168,90,63,0.12)",
        negativeSoftDark: "rgba(201,132,106,0.16)",
        muted: "#6b6a72",
        mutedDark: "#8a8998",
        ink: "#1a1a22",
        inkDark: "#f2f1f6",
      },
      // Radios de "ficha de fichero": sm 8, md 14, lg 20, full para píldoras.
      borderRadius: {
        xl: "14px",
        "2xl": "20px",
      },
      fontFamily: {
        sans: ["Inter_400Regular"],
        "sans-semibold": ["Inter_600SemiBold"],
        "sans-bold": ["Inter_700Bold"],
        // Títulos -- nunca junto a font-bold/font-semibold (ya es 700 propio).
        display: ["SpaceGrotesk_700Bold"],
        "display-semibold": ["SpaceGrotesk_600SemiBold"],
        // Cifras -- precios, XP, %, scores. Combinar con tabular-nums.
        mono: ["JetBrainsMono_500Medium"],
        "mono-bold": ["JetBrainsMono_600SemiBold"],
        "mono-black": ["JetBrainsMono_700Bold"],
      },
    },
  },
  plugins: [],
};
