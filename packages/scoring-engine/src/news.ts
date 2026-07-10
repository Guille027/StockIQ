import type { ScoreBreakdown, ScoreFactor } from "@stockiq/shared-types";
import { clamp, factor } from "./utils";
import type { NewsSignalInput } from "./types";

export function scoreNews(news: NewsSignalInput | undefined): ScoreBreakdown {
  if (!news || news.totalRelevant === 0) {
    return {
      category: "news",
      value: 50,
      summary: "Sin noticias recientes relevantes; se asume un punto neutro.",
      factors: [],
    };
  }

  const factors: ScoreFactor[] = [];
  let value = 50 + news.avgSentiment * 40;
  factors.push(
    factor(
      "Sentimiento medio",
      news.avgSentiment.toFixed(2),
      news.avgSentiment * 40,
      "-1 (muy negativo) a +1 (muy positivo)",
      "Promedio de sentimiento de las noticias relevantes analizadas recientemente.",
    ),
  );

  const netImportant = news.importantPositiveCount - news.importantNegativeCount;
  const importantAdj = clamp(netImportant * 5, -20, 20);
  value += importantAdj;
  factors.push(
    factor(
      "Noticias importantes (netas)",
      `${news.importantPositiveCount} positivas / ${news.importantNegativeCount} negativas`,
      importantAdj,
      "Balance de titulares de alta relevancia",
      "Noticias de alta importancia pesan más que menciones menores.",
    ),
  );

  value = clamp(value, 0, 100);
  return {
    category: "news",
    value: Math.round(value),
    summary:
      value >= 65
        ? "Flujo de noticias recientes predominantemente positivo."
        : value <= 35
          ? "Flujo de noticias recientes predominantemente negativo."
          : "Flujo de noticias mixto o poco concluyente.",
    factors,
  };
}
