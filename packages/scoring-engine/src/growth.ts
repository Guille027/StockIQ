import type { Fundamentals, ScoreBreakdown, ScoreFactor } from "@stockiq/shared-types";
import { factor, fmtPct, linearScore, weightedAverage } from "./utils";

export function scoreGrowth(f: Fundamentals): ScoreBreakdown {
  const factors: ScoreFactor[] = [];
  const weighted: Array<[number, number]> = [];

  if (f.revenueGrowthYoY !== undefined) {
    const s = linearScore(f.revenueGrowthYoY, -0.1, 0.3);
    weighted.push([s, 30]);
    factors.push(factor("Crecimiento ingresos (YoY)", fmtPct(f.revenueGrowthYoY), s - 50, "-10% a +30%", "Variación interanual de los ingresos totales."));
  }
  if (f.epsGrowthYoY !== undefined) {
    const s = linearScore(f.epsGrowthYoY, -0.2, 0.4);
    weighted.push([s, 30]);
    factors.push(factor("Crecimiento BPA (YoY)", fmtPct(f.epsGrowthYoY), s - 50, "-20% a +40%", "Variación interanual del beneficio por acción."));
  }
  if (f.revenueGrowth3yCagr !== undefined) {
    const s = linearScore(f.revenueGrowth3yCagr, -0.05, 0.25);
    weighted.push([s, 20]);
    factors.push(factor("CAGR ingresos 3 años", fmtPct(f.revenueGrowth3yCagr), s - 50, "-5% a +25%", "Crecimiento anual compuesto de ingresos en los últimos 3 años, suaviza efectos puntuales."));
  }
  if (f.epsGrowth3yCagr !== undefined) {
    const s = linearScore(f.epsGrowth3yCagr, -0.1, 0.3);
    weighted.push([s, 20]);
    factors.push(factor("CAGR BPA 3 años", fmtPct(f.epsGrowth3yCagr), s - 50, "-10% a +30%", "Crecimiento anual compuesto del beneficio por acción en los últimos 3 años."));
  }

  const value = Math.round(weighted.length ? weightedAverage(weighted) : 50);
  return {
    category: "growth",
    value,
    summary:
      weighted.length === 0
        ? "Datos de crecimiento insuficientes para puntuar con confianza."
        : value >= 65
          ? "Crecimiento sólido y consistente de ingresos y beneficios."
          : value <= 35
            ? "Crecimiento débil o en contracción respecto a periodos anteriores."
            : "Crecimiento moderado, en línea con una gran empresa madura.",
    factors,
  };
}
