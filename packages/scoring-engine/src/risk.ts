import type { Fundamentals, ScoreBreakdown, ScoreFactor } from "@stockiq/shared-types";
import { factor, fmtRatio, linearScore, weightedAverage } from "./utils";

/** Higher score = LOWER risk. Always framed explicitly so the UI never has
 * to guess the direction. */
export function scoreRisk(f: Fundamentals): ScoreBreakdown {
  const factors: ScoreFactor[] = [];
  const weighted: Array<[number, number]> = [];

  if (f.beta !== undefined) {
    const s = linearScore(f.beta, 2.2, 0.6);
    weighted.push([s, 30]);
    factors.push(
      factor("Beta", fmtRatio(f.beta), s - 50, "0.6 (poco volátil) - 2.2 (muy volátil)", "Sensibilidad histórica del precio frente al mercado; menor beta implica menos vaivenes."),
    );
  }
  if (f.netDebtToEbitda !== undefined) {
    const s = linearScore(f.netDebtToEbitda, 5, -1);
    weighted.push([s, 30]);
    factors.push(
      factor("Deuda neta/EBITDA", fmtRatio(f.netDebtToEbitda), s - 50, "-1x (caja neta) - 5x (muy endeudada)", "Cuántos años de beneficio operativo harían falta para pagar la deuda neta."),
    );
  }
  if (f.currentRatio !== undefined) {
    const s = linearScore(f.currentRatio, 0.5, 2.5);
    weighted.push([s, 20]);
    factors.push(
      factor("Ratio corriente", fmtRatio(f.currentRatio), s - 50, "0.5x - 2.5x", "Capacidad de cubrir obligaciones a corto plazo con activos líquidos."),
    );
  }
  if (f.operatingMargin !== undefined) {
    const s = linearScore(f.operatingMargin, 0, 0.3);
    weighted.push([s, 20]);
    factors.push(
      factor("Colchón de margen operativo", fmtRatio(f.operatingMargin), s - 50, "0% - 30%", "Un margen operativo amplio da más margen de maniobra ante shocks de costes o demanda."),
    );
  }

  const value = Math.round(weighted.length ? weightedAverage(weighted) : 50);
  return {
    category: "risk",
    value,
    summary:
      weighted.length === 0
        ? "Datos insuficientes para evaluar el riesgo con confianza."
        : value >= 65
          ? "Perfil de riesgo relativamente bajo: balance sólido y volatilidad contenida."
          : value <= 35
            ? "Perfil de riesgo elevado: endeudamiento alto y/o volatilidad significativa."
            : "Perfil de riesgo moderado, en línea con una gran compañía cotizada.",
    factors,
  };
}
