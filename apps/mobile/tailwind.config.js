/** @type {import('tailwindcss').Config} */
// "El cuaderno de un inversor que sí sube de nivel" -- fondo de papel de
// cuaderno (no blanco clínico ni negro de casino), índigo de marca serio,
// y una regla estricta: `accent` (Ember) SOLO aparece en XP/racha/logros,
// nunca en ningún otro contexto. Ver el sistema de diseño completo para la
// justificación de cada token.
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#FAF7F0",
        backgroundDark: "#14171D",
        surface: "#F1ECDE",
        surfaceDark: "#242838",
        card: "#FFFFFF",
        cardDark: "#1C202A",
        border: "#E7E0CE",
        borderDark: "#2B3040",
        primary: "#5B5BD6",
        primaryDark: "#8B89EE",
        primarySoft: "#ECEBFA",
        primarySoftDark: "#262456",
        accent: "#E0930A",
        accentDark: "#F5B03D",
        accentSoft: "#FCEECE",
        accentSoftDark: "#3A2C10",
        positive: "#178F72",
        positiveDark: "#4FCBAD",
        positiveSoft: "#DFF2EA",
        positiveSoftDark: "#15352D",
        negative: "#C6503F",
        negativeDark: "#EA8E7A",
        negativeSoft: "#FAE8E4",
        negativeSoftDark: "#3A2019",
        muted: "#6D7086",
        mutedDark: "#999CB0",
        ink: "#1B1F27",
        inkDark: "#F1EFE7",
      },
      // Radios de "ficha de fichero", no de burbuja: más cerrados que la
      // moda rounded-2xl=24px por defecto de Tailwind.
      borderRadius: {
        xl: "14px",
        "2xl": "20px",
      },
      fontFamily: {
        // Cuerpo por defecto (parcheado globalmente via Text.defaultProps,
        // ver src/theme/fonts.ts) -- estas utilidades son para overrides puntuales.
        sans: ["Manrope_500Medium"],
        "sans-semibold": ["Manrope_600SemiBold"],
        "sans-bold": ["Manrope_700Bold"],
        // Títulos -- nunca junto a font-bold/font-semibold (ya es 800 propio).
        display: ["PlusJakartaSans_800ExtraBold"],
        // Cifras -- precios, XP, %, scores, streak. Combinar con tabular-nums.
        mono: ["IBMPlexMono_500Medium"],
        "mono-bold": ["IBMPlexMono_600SemiBold"],
      },
    },
  },
  plugins: [],
};
