/** Consistent score -> color mapping used across badges, scanner rows and
 * score breakdown bars. 0-100, higher is always "better" for the category
 * it's attached to (risk/momentum/etc. are already framed that way upstream).
 * The mid tier is a distinct gold, deliberately NOT the amber accent used for
 * XP/streak/rewards (#B9822F/#E8C77A) -- that stays exclusive so it's always
 * legible as "progress" wherever it appears; scores never borrow it. */
export function scoreColor(value: number): { light: string; dark: string } {
  if (value >= 65) return { light: "#3F7D64", dark: "#6FAE94" }; // positive
  if (value >= 45) return { light: "#A97A26", dark: "#D9A441" }; // neutral gold
  return { light: "#A85A3F", dark: "#C9846A" }; // negative
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
