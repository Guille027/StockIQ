/** Consistent score -> color mapping used across badges, scanner rows and
 * score breakdown bars. 0-100, higher is always "better" for the category
 * it's attached to (risk/momentum/etc. are already framed that way upstream).
 * The mid tier is a muted ochre, deliberately NOT the Ember accent (#E0930A)
 * -- Ember is reserved exclusively for XP/streak/rewards so it stays legible
 * as "progress" wherever it appears; scores never borrow it. */
export function scoreColor(value: number): { light: string; dark: string } {
  if (value >= 65) return { light: "#178F72", dark: "#4FCBAD" }; // positive
  if (value >= 45) return { light: "#B3872E", dark: "#D1AC63" }; // neutral ochre
  return { light: "#C6503F", dark: "#EA8E7A" }; // negative
}

export function scoreLabel(value: number): string {
  if (value >= 80) return "Excelente";
  if (value >= 65) return "Sólido";
  if (value >= 45) return "Neutral";
  if (value >= 30) return "Débil";
  return "Muy débil";
}

export const CATEGORY_LABELS: Record<string, string> = {
  fundamental: "Fundamental",
  growth: "Crecimiento",
  quality: "Calidad",
  momentum: "Momentum",
  value: "Valoración",
  risk: "Riesgo",
  news: "Noticias",
  financialHealth: "Salud Financiera",
  aiConfidence: "Confianza IA",
};
