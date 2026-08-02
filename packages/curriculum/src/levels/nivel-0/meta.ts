import type { Lesson } from "@stockiq/shared-types";
import { lesson as l1 } from "./01-ahorrar-no-es-invertir";
import { lesson as l2 } from "./02-que-es-una-accion";
import { lesson as l3 } from "./03-que-es-la-bolsa";
import { lesson as l4 } from "./04-riesgo-horizonte-diversificacion";
import { lesson as l5 } from "./05-nadie-predice-el-mercado";

export const meta = {
  id: "nivel-0",
  order: 0,
  title: "¿Qué es invertir?",
  description: "La base de todo: qué significa invertir, qué es una acción y por qué nadie puede predecir el mercado.",
  icon: "🌱",
};

export const lessons: Lesson[] = [l1, l2, l3, l4, l5];
