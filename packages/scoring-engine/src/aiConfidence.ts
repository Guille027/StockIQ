import type { Fundamentals, ScoreBreakdown } from "@stockiq/shared-types";

const TRACKED_FIELDS: Array<keyof Fundamentals> = [
  "peRatio",
  "pegRatio",
  "roe",
  "roic",
  "grossMargin",
  "operatingMargin",
  "netMargin",
  "revenueGrowthYoY",
  "epsGrowthYoY",
  "freeCashFlow",
  "totalDebt",
  "cash",
  "dividendYield",
  "institutionalOwnershipPct",
  "insiderNetBuys3m",
  "beta",
];

/**
 * Placeholder confidence score based purely on data completeness, used until
 * a real AI report has been generated for this company (the `ai` module's
 * orchestrator produces its own, more meaningful confidence score once it
 * has actually reasoned over the data -- that value should be preferred
 * over this one whenever available).
 */
export function scoreAiConfidencePlaceholder(f: Fundamentals): ScoreBreakdown {
  const present = TRACKED_FIELDS.filter((key) => f[key] !== undefined).length;
  const completeness = present / TRACKED_FIELDS.length;
  const value = Math.round(20 + completeness * 70); // cap at 90, floor at 20

  return {
    category: "aiConfidence",
    value,
    summary:
      "Estimación provisional basada en la completitud de los datos disponibles, en espera de un informe IA generado para esta empresa.",
    factors: [
      {
        label: "Completitud de datos fundamentales",
        value: `${present}/${TRACKED_FIELDS.length}`,
        contribution: Math.round(completeness * 70),
        benchmark: "16/16 campos clave disponibles",
        explanation: "Cuantos más datos fundamentales estén disponibles, con más base puede razonar la IA.",
      },
    ],
  };
}
