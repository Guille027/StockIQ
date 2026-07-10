export type AlertCondition =
  | { kind: "score_above"; category: string; threshold: number }
  | { kind: "price_drop_pct"; percent: number; windowDays: number }
  | { kind: "earnings_reported" }
  | { kind: "valuation_change_pct"; percent: number }
  | { kind: "important_news"; minImportance: number };

export interface Alert {
  id: string;
  userId: string;
  ticker: string;
  condition: AlertCondition;
  active: boolean;
  createdAt: string;
  lastTriggeredAt?: string;
}
