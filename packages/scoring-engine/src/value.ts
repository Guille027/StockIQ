import type { Fundamentals, ScoreBreakdown, ScoreFactor } from "@stockiq/shared-types";
import { factor, fmtRatio, linearScore, weightedAverage } from "./utils";

export function scoreValue(f: Fundamentals): ScoreBreakdown {
  const factors: ScoreFactor[] = [];
  const weighted: Array<[number, number]> = [];

  if (f.peRatio !== undefined && f.peRatio > 0) {
    const s = linearScore(f.peRatio, 60, 8);
    weighted.push([s, 35]);
    factors.push(
      factor("PER", fmtRatio(f.peRatio), s - 50, "8x (barato) - 60x (caro)", "Un PER más bajo indica que se paga menos por cada dólar de beneficio."),
    );
  }
  if (f.pegRatio !== undefined && f.pegRatio > 0) {
    const s = linearScore(f.pegRatio, 4, 0.5);
    weighted.push([s, 25]);
    factors.push(
      factor("PEG", fmtRatio(f.pegRatio), s - 50, "0.5 (barato) - 4 (caro)", "El PEG ajusta el PER por el crecimiento esperado; por debajo de 1 suele considerarse atractivo."),
    );
  }
  if (f.priceToSales !== undefined && f.priceToSales > 0) {
    const s = linearScore(f.priceToSales, 15, 1);
    weighted.push([s, 20]);
    factors.push(
      factor("Precio/Ventas", fmtRatio(f.priceToSales), s - 50, "1x - 15x", "Cuánto paga el mercado por cada dólar de ingresos."),
    );
  }
  if (f.evToEbitda !== undefined && f.evToEbitda > 0) {
    const s = linearScore(f.evToEbitda, 35, 6);
    weighted.push([s, 20]);
    factors.push(
      factor("EV/EBITDA", fmtRatio(f.evToEbitda), s - 50, "6x - 35x", "Valoración de la empresa (incl. deuda) respecto a su beneficio operativo en caja."),
    );
  }

  const value = Math.round(weighted.length ? weightedAverage(weighted) : 50);
  return {
    category: "value",
    value,
    summary:
      weighted.length === 0
        ? "Datos de valoración insuficientes para puntuar con confianza."
        : value >= 65
          ? "Valoración atractiva frente a sus múltiplos históricos/típicos de mercado."
          : value <= 35
            ? "Cotiza con múltiplos exigentes; el mercado ya descuenta mucho optimismo."
            : "Valoración razonable, ni claramente barata ni claramente cara.",
    factors,
  };
}
