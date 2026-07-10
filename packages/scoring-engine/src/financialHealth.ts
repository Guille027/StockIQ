import type { Fundamentals, ScoreBreakdown, ScoreFactor } from "@stockiq/shared-types";
import { factor, fmtRatio, linearScore, weightedAverage } from "./utils";

export function scoreFinancialHealth(f: Fundamentals): ScoreBreakdown {
  const factors: ScoreFactor[] = [];
  const weighted: Array<[number, number]> = [];

  if (f.cash !== undefined && f.totalDebt !== undefined) {
    const ratio = f.totalDebt === 0 ? 3 : f.cash / f.totalDebt;
    const s = linearScore(ratio, 0, 1.5);
    weighted.push([s, 25]);
    factors.push(
      factor("Caja / Deuda total", fmtRatio(ratio), s - 50, "0x - 1.5x", "Cuánta deuda podría cancelarse hoy usando solo la caja disponible."),
    );
  }
  if (f.freeCashFlow !== undefined && f.marketCap > 0) {
    const fcfYield = f.freeCashFlow / f.marketCap;
    const s = linearScore(fcfYield, -0.02, 0.08);
    weighted.push([s, 30]);
    factors.push(
      factor("FCF yield", `${(fcfYield * 100).toFixed(1)}%`, s - 50, "-2% - 8%", "Flujo de caja libre generado en relación al valor de mercado de la compañía."),
    );
  }
  if (f.netDebtToEbitda !== undefined) {
    const s = linearScore(f.netDebtToEbitda, 5, -1);
    weighted.push([s, 25]);
    factors.push(
      factor("Deuda neta/EBITDA", fmtRatio(f.netDebtToEbitda), s - 50, "-1x - 5x", "Apalancamiento de la compañía respecto a su generación de beneficio operativo."),
    );
  }
  if (f.currentRatio !== undefined) {
    const s = linearScore(f.currentRatio, 0.5, 2.5);
    weighted.push([s, 20]);
    factors.push(
      factor("Ratio corriente", fmtRatio(f.currentRatio), s - 50, "0.5x - 2.5x", "Liquidez a corto plazo: activos corrientes frente a pasivos corrientes."),
    );
  }

  const value = Math.round(weighted.length ? weightedAverage(weighted) : 50);
  return {
    category: "financialHealth",
    value,
    summary:
      weighted.length === 0
        ? "Datos de balance insuficientes para puntuar la salud financiera."
        : value >= 65
          ? "Balance sólido: caja, deuda y liquidez en buena posición."
          : value <= 35
            ? "Balance exigido: deuda elevada y/o generación de caja débil."
            : "Salud financiera aceptable, sin señales de alarma evidentes.",
    factors,
  };
}
