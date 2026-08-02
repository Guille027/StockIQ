import type { Lesson } from "@stockiq/shared-types";
import { lesson as l1 } from "./01-velas-japonesas";
import { lesson as l2 } from "./02-volumen";
import { lesson as l3 } from "./03-market-cap";
import { lesson as l4 } from "./04-dividendos";
import { lesson as l5 } from "./05-eps";
import { lesson as l6 } from "./06-per";
import { lesson as l7 } from "./07-volatilidad-beta";

export const meta = {
  id: "nivel-1",
  order: 1,
  title: "El lenguaje del mercado",
  description: "Velas, volumen, market cap, dividendos, PER, EPS y volatilidad -- las palabras con las que habla la bolsa.",
  icon: "🗣️",
};

export const lessons: Lesson[] = [l1, l2, l3, l4, l5, l6, l7];
