import type { Fundamentals, ScoreBreakdown, ScoreFactor } from "@stockiq/shared-types";
import { factor, fmtPct, linearScore, weightedAverage } from "./utils";

export function scoreQuality(f: Fundamentals): ScoreBreakdown {
  const factors: ScoreFactor[] = [];
  const weighted: Array<[number, number]> = [];

  if (f.roe !== undefined) {
    const s = linearScore(f.roe, 0, 0.4);
    weighted.push([s, 25]);
    factors.push(factor("ROE", fmtPct(f.roe), s - 50, "0% - 40%", "Rentabilidad generada sobre el capital de los accionistas."));
  }
  if (f.roic !== undefined) {
    const s = linearScore(f.roic, 0, 0.3);
    weighted.push([s, 25]);
    factors.push(factor("ROIC", fmtPct(f.roic), s - 50, "0% - 30%", "Rentabilidad sobre el capital total invertido; clave para medir la calidad del negocio."));
  }
  if (f.grossMargin !== undefined) {
    const s = linearScore(f.grossMargin, 0.1, 0.7);
    weighted.push([s, 15]);
    factors.push(factor("Margen bruto", fmtPct(f.grossMargin), s - 50, "10% - 70%", "Rentabilidad tras el coste directo de producir el bien/servicio."));
  }
  if (f.operatingMargin !== undefined) {
    const s = linearScore(f.operatingMargin, 0, 0.35);
    weighted.push([s, 20]);
    factors.push(factor("Margen operativo", fmtPct(f.operatingMargin), s - 50, "0% - 35%", "Eficiencia del negocio principal antes de intereses e impuestos."));
  }
  if (f.netMargin !== undefined) {
    const s = linearScore(f.netMargin, 0, 0.25);
    weighted.push([s, 15]);
    factors.push(factor("Margen neto", fmtPct(f.netMargin), s - 50, "0% - 25%", "Qué porcentaje de cada dólar de ingresos se convierte en beneficio final."));
  }

  const value = Math.round(weighted.length ? weightedAverage(weighted) : 50);
  return {
    category: "quality",
    value,
    summary:
      weighted.length === 0
        ? "Datos de rentabilidad insuficientes para puntuar con confianza."
        : value >= 65
          ? "Negocio de alta calidad: rentabilidad y márgenes por encima de la media."
          : value <= 35
            ? "Rentabilidad y márgenes débiles frente a otras grandes compañías."
            : "Calidad de negocio media, sin señales destacables en ningún sentido.",
    factors,
  };
}
