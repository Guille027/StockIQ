import type { Lesson } from "@stockiq/shared-types";

export const lesson: Lesson = {
  id: "n1-l3",
  levelId: "nivel-1",
  order: 3,
  title: "Capitalización bursátil",
  description: "Cuánto vale una empresa entera en bolsa -- y por qué el precio de una acción, solo, no dice nada.",
  estimatedMinutes: 5,
  blocks: [
    {
      type: "concept",
      emoji: "🏷️",
      title: "El precio de la empresa entera",
      body:
        "La **capitalización bursátil** (market cap) es el valor de TODAS las acciones juntas: precio por acción × número de acciones.\n\n" +
        "Es lo que costaría, en teoría, comprar la empresa completa a precios de hoy.",
    },
    {
      type: "concept",
      emoji: "🍰",
      title: "El error clásico del principiante",
      body:
        "\"Esta acción cuesta $5, está baratísima; esa otra cuesta $500, carísima.\" **Error**: el precio por acción depende de en cuántos trozos esté cortada la tarta.\n\n" +
        "Una empresa de $50.000M cortada en 10.000M de acciones cuesta $5 por acción. Otra de $50.000M en 100M de acciones cuesta $500. **Valen exactamente lo mismo.**",
    },
    {
      type: "liveStat",
      ticker: "MSFT",
      stat: "marketCap",
      caption: "Capitalización actual de Microsoft. Este número — no el precio por acción — es el tamaño real de la empresa en bolsa.",
    },
    {
      type: "liveStat",
      ticker: "MSFT",
      stat: "price",
      caption: "Y este es el precio de UNA acción de Microsoft. Por sí solo, sin saber cuántas acciones existen, este número no te dice si la empresa es grande o pequeña, cara o barata.",
    },
    {
      type: "concept",
      emoji: "📏",
      title: "Tallas: large, mid, small",
      body:
        "**Large cap** (>$10.000M): gigantes establecidos — más estables, crecimiento más lento. **Mid cap** ($2.000-10.000M): en crecimiento, más volátiles. **Small cap** (<$2.000M): jóvenes o nicho — mayor potencial y mayor mortalidad.\n\n" +
        "El universo de esta app es deliberadamente large cap: para aprender, mejor empresas líquidas, cubiertas y con información abundante.",
    },
    {
      type: "quiz",
      question: "La acción A cuesta $3 y la acción B cuesta $900. ¿Cuál pertenece a la empresa más grande?",
      options: [
        "La A: hay más acciones disponibles",
        "La B: precio más alto = empresa más grande",
        "Imposible saberlo sin conocer el número de acciones de cada una",
        "Son iguales",
      ],
      correctIndex: 2,
      explanation:
        "El precio por acción solo es una fracción arbitraria: tamaño = precio × número de acciones. Berkshire Hathaway cotiza a cientos de miles de dólares por acción y hay empresas enormes cotizando a un dígito. Compara capitalizaciones, nunca precios sueltos.",
    },
    {
      type: "trueFalse",
      statement: "Una acción que cotiza a $2 es una ganga porque puede subir mucho más fácilmente que una de $200.",
      answer: false,
      explanation:
        "Falso, y es una trampa mental muy común. Que suba de $2 a $4 (100%) exige exactamente lo mismo que de $200 a $400: que el valor total de la empresa se duplique. El precio bajo por acción no facilita nada — solo indica en cuántos trozos se cortó la tarta.",
    },
    {
      type: "quiz",
      question: "¿Por qué el universo de StockIQ solo incluye grandes empresas (large caps)?",
      options: [
        "Porque las pequeñas nunca son buenas inversiones",
        "Porque para aprender conviene empezar con empresas líquidas, muy analizadas y con información pública abundante",
        "Porque las grandes siempre suben",
        "Por limitaciones técnicas",
      ],
      correctIndex: 1,
      explanation:
        "Las small caps pueden ser inversiones excelentes, pero para formarte es mejor un terreno con más luz: datos abundantes, cobertura de analistas, liquidez y menos manipulación. Cuando tu criterio esté entrenado, podrás explorar cualquier tamaño con tus propias herramientas.",
    },
  ],
};
