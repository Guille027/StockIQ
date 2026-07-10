/** Consistent score -> color mapping used across badges, scanner rows and
 * score breakdown bars. 0-100, higher is always "better" for the category
 * it's attached to (risk/momentum/etc. are already framed that way upstream). */
export function scoreColor(value: number): { light: string; dark: string } {
  if (value >= 65) return { light: "#16A34A", dark: "#34D399" };
  if (value >= 45) return { light: "#D97706", dark: "#FBBF24" };
  return { light: "#DC2626", dark: "#F87171" };
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
