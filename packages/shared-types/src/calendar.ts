export type CalendarEventType =
  | "earnings"
  | "dividend"
  | "split"
  | "ceo_change"
  | "investor_day"
  | "other";

export interface CalendarEvent {
  id: string;
  ticker: string;
  type: CalendarEventType;
  date: string;
  title: string;
  details?: string;
}
