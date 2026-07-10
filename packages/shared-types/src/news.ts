export type NewsSentiment = "positive" | "neutral" | "negative";

export interface NewsItem {
  id: string;
  tickers: string[];
  headline: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment: NewsSentiment;
  /** 0-100, how important/market-moving this is judged to be */
  importance: number;
  /** Explanation of likely impact, grounded in the article content */
  impactNote?: string;
  /** Set when this item was identified as a duplicate/near-duplicate of another and merged */
  dedupedFromCount?: number;
}
