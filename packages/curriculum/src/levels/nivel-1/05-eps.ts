import type { Lesson } from "@stockiq/shared-types";

export const lesson: Lesson = {
  id: "n1-l5",
  levelId: "nivel-1",
  order: 5,
  title: "EPS: beneficio por acción",
  description: "Cuánto gana la empresa por cada acción que posees. El ladrillo con el que se construye casi todo lo demás.",
  estimatedMinutes: 5,
  blocks: [
    {
      type: "concept",
      emoji: "🧮",
      title: "El beneficio, repartido entre acciones",
      body:
        "El **EPS** (Earnings Per Share, beneficio por acción) = beneficio neto anual ÷ número de acciones.\n\n" +
        "Si una empresa gana $10.000M y tiene 5.000M de acciones, su EPS es $2. Como accionista, cada acción tuya 'generó' $2 de beneficio ese año — se repartan o no.",
    },
    {
      type: "liveStat",
      ticker: "AAPL",
      stat: "eps",
      caption: "EPS actual de Apple: el beneficio que corresponde a cada acción individual. Compáralo mentalmente con el precio de esa misma acción y entenderás por qué la siguiente lección (el PER) existe.",
    },
    {
      type: "concept",
      emoji: "📈",
      title: "Lo que importa es su trayectoria",
      body:
        "Un EPS suelto dice poco. Lo revelador es su **evolución**: un EPS que crece año tras año señala un negocio que gana cada vez más por acción.\n\n" +
        "Ojo al truco: el EPS también sube si la empresa **recompra acciones** (menos denominador). No es malo — pero conviene saber si el crecimiento viene del negocio o de la aritmética.",
    },
    {
      type: "concept",
      emoji: "🧪",
      title: "Beneficio contable ≠ caja",
      body:
        "El EPS sale del beneficio **contable**, que admite ajustes y maquillaje temporal (provisiones, extraordinarios, cambios de criterio).\n\n" +
        "Por eso los analistas serios lo cruzan con el **flujo de caja** (lección de Nivel 3): la caja es mucho más difícil de maquillar. Si el beneficio crece pero la caja no aparece, desconfía.",
    },
    {
      type: "quiz",
      question: "Una empresa gana $2.000M este año y tiene 1.000M de acciones. ¿Cuál es su EPS?",
      options: ["$0,50", "$2", "$20", "$2.000"],
      correctIndex: 1,
      explanation:
        "EPS = beneficio ÷ acciones = 2.000M ÷ 1.000M = $2 por acción. Este número por sí solo no dice si la empresa es cara o barata — para eso hay que compararlo con el precio, que es exactamente lo que hace el PER (siguiente lección).",
    },
    {
      type: "quiz",
      question: "El EPS de una empresa sube un 10%, pero su beneficio total no ha crecido nada. ¿Cómo es posible?",
      options: [
        "Es un error contable, es imposible",
        "Recompró acciones: el mismo beneficio se reparte entre menos acciones",
        "Subió el precio de la acción",
        "Pagó más dividendos",
      ],
      correctIndex: 1,
      explanation:
        "Al recomprar y amortizar acciones, el denominador baja y el EPS sube sin que el negocio gane un dólar más. Las recompras pueden crear valor real para el accionista, pero es clave distinguir crecimiento del negocio de aritmética financiera — son historias distintas.",
    },
    {
      type: "trueFalse",
      statement: "Si el EPS crece cada año, el negocio necesariamente va cada vez mejor.",
      answer: false,
      explanation:
        "Falso. El EPS puede crecer por recompras, por extraordinarios o por ajustes contables mientras el negocio subyacente se estanca. La foto completa exige mirar también ingresos, márgenes y flujo de caja — todo eso llega en el Nivel 3.",
    },
  ],
};
