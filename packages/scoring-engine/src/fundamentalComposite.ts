import type { ScoreBreakdown } from "@stockiq/shared-types";
import { weightedAverage } from "./utils";

/**
 * The "Fundamental Score" is a deliberate roll-up of quality, growth, value
 * and financial health -- the pure business/balance-sheet picture, kept
 * separate from momentum, risk and news which are more market/behavioral in
 * nature.
 */
export function scoreFundamentalComposite(
  quality: ScoreBreakdown,
  growth: ScoreBreakdown,
  value: ScoreBreakdown,
  financialHealth: ScoreBreakdown,
): ScoreBreakdown {
  const weighted: Array<[number, number]> = [
    [quality.value, 30],
    [growth.value, 30],
    [value.value, 20],
    [financialHealth.value, 20],
  ];
  const composite = Math.round(weightedAverage(weighted));

  return {
    category: "fundamental",
    value: composite,
    summary:
      composite >= 65
        ? "Cuadro fundamental sólido: calidad, crecimiento, valoración y balance apuntan en positivo."
        : composite <= 35
          ? "Cuadro fundamental débil en varias dimensiones a la vez."
          : "Cuadro fundamental mixto: fortalezas y debilidades se compensan.",
    factors: [
      { label: "Quality Score", value: quality.value, contribution: Math.round((quality.value - 50) * 0.3), benchmark: "peso 30%", explanation: "Rentabilidad y márgenes." },
      { label: "Growth Score", value: growth.value, contribution: Math.round((growth.value - 50) * 0.3), benchmark: "peso 30%", explanation: "Crecimiento de ingresos y BPA." },
      { label: "Value Score", value: value.value, contribution: Math.round((value.value - 50) * 0.2), benchmark: "peso 20%", explanation: "Atractivo de la valoración." },
      { label: "Financial Health Score", value: financialHealth.value, contribution: Math.round((financialHealth.value - 50) * 0.2), benchmark: "peso 20%", explanation: "Fortaleza del balance." },
    ],
  };
}
