import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { NewsItem } from "@stockiq/shared-types";
import { getCompany, isInUniverse } from "@stockiq/universe";
import { CacheService } from "../common/cache/cache.service";
import { analyzeSentiment, dedupeByHeadline } from "./sentiment.util";
import type { NewsSignalInput } from "@stockiq/scoring-engine";

const BASE_URL = "https://finnhub.io/api/v1";
const TICKER_NEWS_TTL_SECONDS = 60 * 60; // 1h
const MARKET_NEWS_TTL_SECONDS = 30 * 60; // 30min

interface FinnhubNewsArticle {
  id?: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  datetime: number;
  related?: string;
}

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);
  private readonly apiKey: string;

  constructor(
    config: ConfigService,
    private readonly cache: CacheService,
  ) {
    this.apiKey = config.get<string>("FINNHUB_API_KEY") ?? "";
  }

  get isMock(): boolean {
    return !this.apiKey;
  }

  async getForTicker(ticker: string, limit = 10): Promise<NewsItem[]> {
    return this.cache.wrap(`news:${ticker}`, TICKER_NEWS_TTL_SECONDS, async () => {
      const raw = this.apiKey ? await this.fetchTickerNews(ticker) : this.mockTickerNews(ticker);
      return this.process(raw, [ticker]).slice(0, limit);
    });
  }

  async getMarketNews(limit = 20): Promise<NewsItem[]> {
    return this.cache.wrap("news:market", MARKET_NEWS_TTL_SECONDS, async () => {
      const raw = this.apiKey ? await this.fetchGeneralNews() : this.mockMarketNews();
      return this.process(raw, []).slice(0, limit);
    });
  }

  /** Aggregated signal used by the scoring engine's News Score. */
  async getSignal(ticker: string): Promise<NewsSignalInput> {
    const items = await this.getForTicker(ticker, 15);
    if (items.length === 0) {
      return { avgSentiment: 0, importantPositiveCount: 0, importantNegativeCount: 0, totalRelevant: 0 };
    }
    const sentimentValue = (s: NewsItem["sentiment"]) => (s === "positive" ? 1 : s === "negative" ? -1 : 0);
    const avgSentiment = items.reduce((acc, i) => acc + sentimentValue(i.sentiment), 0) / items.length;
    const important = items.filter((i) => i.importance >= 60);
    return {
      avgSentiment,
      importantPositiveCount: important.filter((i) => i.sentiment === "positive").length,
      importantNegativeCount: important.filter((i) => i.sentiment === "negative").length,
      totalRelevant: items.length,
    };
  }

  private process(raw: FinnhubNewsArticle[], tickerHint: string[]): NewsItem[] {
    const scored: NewsItem[] = raw.map((a) => {
      const { sentiment, importance } = analyzeSentiment(`${a.headline} ${a.summary}`);
      const tickers = tickerHint.length ? tickerHint : this.extractTickers(`${a.headline} ${a.summary}`);
      return {
        id: `${a.source}-${a.datetime}-${a.headline.slice(0, 20)}`,
        tickers,
        headline: a.headline,
        summary: a.summary,
        source: a.source,
        url: a.url,
        publishedAt: new Date(a.datetime * 1000).toISOString(),
        sentiment,
        importance,
        impactNote: buildImpactNote(sentiment, importance),
      };
    });
    return dedupeByHeadline(scored).sort((a, b) => b.importance - a.importance);
  }

  private extractTickers(text: string): string[] {
    const found: string[] = [];
    const upper = text.toUpperCase();
    for (const word of upper.split(/[^A-Z.]+/)) {
      if (word.length >= 2 && isInUniverse(word) && !found.includes(word)) {
        found.push(word);
      }
    }
    return found;
  }

  private async fetchTickerNews(ticker: string): Promise<FinnhubNewsArticle[]> {
    try {
      const to = new Date();
      const from = new Date(to.getTime() - 14 * 86_400_000);
      const qs = new URLSearchParams({
        symbol: ticker,
        from: from.toISOString().slice(0, 10),
        to: to.toISOString().slice(0, 10),
        token: this.apiKey,
      });
      const res = await fetch(`${BASE_URL}/company-news?${qs}`);
      if (!res.ok) throw new Error(`Finnhub company-news respondió ${res.status}`);
      return (await res.json()) as FinnhubNewsArticle[];
    } catch (err) {
      this.logger.warn(`Fallback a noticias mock para ${ticker}: ${(err as Error).message}`);
      return this.mockTickerNews(ticker);
    }
  }

  private async fetchGeneralNews(): Promise<FinnhubNewsArticle[]> {
    try {
      const qs = new URLSearchParams({ category: "general", token: this.apiKey });
      const res = await fetch(`${BASE_URL}/news?${qs}`);
      if (!res.ok) throw new Error(`Finnhub news respondió ${res.status}`);
      return (await res.json()) as FinnhubNewsArticle[];
    } catch (err) {
      this.logger.warn(`Fallback a noticias de mercado mock: ${(err as Error).message}`);
      return this.mockMarketNews();
    }
  }

  private mockTickerNews(ticker: string): FinnhubNewsArticle[] {
    const company = getCompany(ticker);
    const name = company?.name ?? ticker;
    const now = Math.floor(Date.now() / 1000);
    return [
      {
        headline: `${name} bate las estimaciones de beneficio del trimestre`,
        summary: `${name} reportó un beneficio por acción por encima del consenso de analistas, impulsado por un crecimiento sólido de ingresos.`,
        source: "StockIQ Mock Wire",
        url: "https://example.com/mock-news-1",
        datetime: now - 3600 * 6,
      },
      {
        headline: `Analistas mantienen su recomendación sobre ${name} tras la presentación de resultados`,
        summary: `Varias casas de análisis han mantenido su calificación sobre ${name}, citando la evolución de márgenes y guidance.`,
        source: "StockIQ Mock Wire",
        url: "https://example.com/mock-news-2",
        datetime: now - 3600 * 30,
      },
    ];
  }

  private mockMarketNews(): FinnhubNewsArticle[] {
    const now = Math.floor(Date.now() / 1000);
    return [
      {
        headline: "Los principales índices cierran mixtos ante la espera de datos de inflación",
        summary: "Los mercados globales se movieron en un rango estrecho mientras los inversores esperan el próximo dato de inflación.",
        source: "StockIQ Mock Wire",
        url: "https://example.com/mock-market-1",
        datetime: now - 3600 * 2,
      },
      {
        headline: "La temporada de resultados trimestrales arranca con resultados dispares en tecnología",
        summary: "Las grandes tecnológicas han presentado resultados mixtos, con algunas superando expectativas y otras decepcionando en guidance.",
        source: "StockIQ Mock Wire",
        url: "https://example.com/mock-market-2",
        datetime: now - 3600 * 9,
      },
    ];
  }
}

function buildImpactNote(sentiment: NewsItem["sentiment"], importance: number): string {
  if (importance < 45) return "Impacto limitado esperado en el precio a corto plazo.";
  if (sentiment === "positive") return "Podría generar presión compradora si el mercado no lo tenía descontado.";
  if (sentiment === "negative") return "Podría generar presión vendedora si el mercado no lo tenía descontado.";
  return "Noticia relevante pero de impacto direccional incierto.";
}
