import type { Fundamentals, ScoreBreakdown, ScoreFactor } from "@stockiq/shared-types";
import { factor, fmtPct, linearScore, weightedAverage } from "./utils";

export function scoreMomentum(f: Fundamentals): ScoreBreakdown {
  const factors: ScoreFactor[] = [];
  const weighted: Array<[number, number]> = [];

  if (f.priceChange1M !== undefined) {
    const s = linearScore(f.priceChange1M, -0.15, 0.15);
    weighted.push([s, 15]);
    factors.push(factor("Variación 1 mes", fmtPct(f.priceChange1M), s - 50, "-15% a +15%", "Momentum de precio a muy corto plazo."));
  }
  if (f.priceChange3M !== undefined) {
    const s = linearScore(f.priceChange3M, -0.25, 0.25);
    weighted.push([s, 20]);
    factors.push(factor("Variación 3 meses", fmtPct(f.priceChange3M), s - 50, "-25% a +25%", "Tendencia de precio a corto/medio plazo."));
  }
  if (f.priceChange6M !== undefined) {
    const s = linearScore(f.priceChange6M, -0.3, 0.3);
    weighted.push([s, 25]);
    factors.push(factor("Variación 6 meses", fmtPct(f.priceChange6M), s - 50, "-30% a +30%", "Tendencia de precio a medio plazo."));
  }
  if (f.priceChange12M !== undefined) {
    const s = linearScore(f.priceChange12M, -0.4, 0.4);
    weighted.push([s, 25]);
    factors.push(factor("Variación 12 meses", fmtPct(f.priceChange12M), s - 50, "-40% a +40%", "Tendencia de precio a largo plazo."));
  }
  if (f.week52High !== undefined && f.week52Low !== undefined && f.week52High > f.week52Low) {
    const position = (f.price - f.week52Low) / (f.week52High - f.week52Low);
    const s = clampScore(position * 100);
    weighted.push([s, 15]);
    factors.push(
      factor(
        "Posición en rango 52 semanas",
        `${(position * 100).toFixed(0)}%`,
        s - 50,
        "0% (mínimo anual) - 100% (máximo anual)",
        "Dónde cotiza el precio actual dentro de su rango de las últimas 52 semanas.",
      ),
    );
  }

  const value = Math.round(weighted.length ? weightedAverage(weighted) : 50);
  return {
    category: "momentum",
    value,
    summary:
      weighted.length === 0
        ? "Datos de precio insuficientes para puntuar el momentum."
        : value >= 65
          ? "Tendencia de precio claramente positiva en los últimos meses."
          : value <= 35
            ? "Tendencia de precio negativa; el mercado ha castigado el valor recientemente."
            : "Tendencia de precio lateral, sin momentum claro en ninguna dirección.",
    factors,
  };
}

function clampScore(v: number): number {
  return Math.min(100, Math.max(0, v));
}
