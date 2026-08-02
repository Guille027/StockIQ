import type { Lesson } from "@stockiq/shared-types";

export const lesson: Lesson = {
  id: "n1-l6",
  levelId: "nivel-1",
  order: 6,
  title: "PER: ¿caro o barato?",
  description: "Cuántos años de beneficio estás pagando por la empresa. La métrica de valoración más citada -- y la más malinterpretada.",
  estimatedMinutes: 6,
  blocks: [
    {
      type: "concept",
      emoji: "🏷️",
      title: "Años de beneficio en el precio",
      body:
        "El **PER** (Price/Earnings Ratio) = precio de la acción ÷ EPS. Si la acción cuesta $100 y el EPS es $5, el PER es 20: estás pagando **20 años del beneficio actual**.\n\n" +
        "Es la forma más rápida de conectar el precio con la realidad del negocio: ¿cuánto beneficio compra cada dólar que pago?",
    },
    {
      type: "liveStat",
      ticker: "KO",
      stat: "per",
      caption: "PER actual de Coca-Cola: negocio maduro, estable y previsible.",
    },
    {
      type: "liveStat",
      ticker: "NVDA",
      stat: "per",
      caption: "PER actual de Nvidia. Si es mucho más alto que el de Coca-Cola no significa que sea 'peor compra': el mercado paga más por cada dólar de beneficio actual cuando espera que ese beneficio crezca mucho más rápido.",
    },
    {
      type: "concept",
      emoji: "🔭",
      title: "Un PER alto es una expectativa",
      body:
        "PER 40 significa que el mercado espera que el beneficio **crezca considerablemente** — pagas hoy por los beneficios de mañana. PER 8 significa expectativas bajas: estancamiento, riesgo o sector castigado.\n\n" +
        "Por eso el PER solo tiene sentido **comparado**: contra el histórico de la propia empresa, contra su sector, y contra su crecimiento esperado.",
    },
    {
      type: "concept",
      emoji: "🪤",
      title: "La trampa del PER bajo",
      body:
        "\"PER 6, ¡regalada!\" A veces sí... y a veces el mercado sabe algo: beneficio a punto de caer, sector en declive, deuda asfixiante. Es la **trampa de valor**: barata hoy, más barata mañana.\n\n" +
        "Y el reverso: un PER alto no siempre es burbuja — si el beneficio se duplica en tres años, el PER de compra se queda en la mitad. Ninguna cifra suelta sustituye a entender el negocio.",
    },
    {
      type: "quiz",
      question: "Una acción cotiza a $60 y su EPS es $3. ¿Cuál es su PER?",
      options: ["3", "20", "60", "180"],
      correctIndex: 1,
      explanation:
        "PER = 60 ÷ 3 = 20. Pagas 20 años del beneficio actual. Que eso sea caro o barato depende de cuánto crezca ese beneficio: si se duplica en pocos años, el PER efectivo que pagaste se reduce a la mitad; si se estanca, esos 20 años son literales.",
    },
    {
      type: "quiz",
      question: "La empresa A tiene PER 35 y la B, del mismo sector, PER 10. ¿Cuál es la conclusión correcta?",
      options: [
        "A está carísima, B es la buena compra",
        "El mercado espera mucho más crecimiento de A que de B; cuál conviene exige analizar si esas expectativas son realistas",
        "B está a punto de quebrar",
        "El PER no permite comparar empresas",
      ],
      correctIndex: 1,
      explanation:
        "El PER es una foto de expectativas, no un veredicto. A puede justificar su 35 creciendo al 25% anual, y B puede ser una trampa de valor o una oportunidad ignorada. El PER te dice QUÉ pregunta hacer ('¿son realistas estas expectativas?'), no la respuesta.",
    },
    {
      type: "trueFalse",
      statement: "Comprar sistemáticamente las acciones con el PER más bajo del mercado es una estrategia segura.",
      answer: false,
      explanation:
        "Falso. Los PER más bajos del mercado suelen concentrar los negocios con problemas más serios: beneficios en declive, deuda alta, sectores moribundos. Algunas serán gangas reales — separarlas de las trampas exige el análisis fundamental que aprenderás en el Nivel 3.",
    },
  ],
};
