import type { Lesson } from "@stockiq/shared-types";

export const lesson: Lesson = {
  id: "n1-l2",
  levelId: "nivel-1",
  order: 2,
  title: "Volumen",
  description: "Cuántas acciones cambiaron de manos. El dato que confirma (o desmiente) lo que el precio aparenta.",
  estimatedMinutes: 5,
  blocks: [
    {
      type: "concept",
      emoji: "📢",
      title: "El precio dice qué, el volumen dice cuánta convicción",
      body:
        "El **volumen** es el número de acciones negociadas en un periodo. Es el nivel de participación: cuánta gente respaldó con dinero ese movimiento.\n\n" +
        "Una subida con volumen alto = mucha gente comprando de verdad. La misma subida con volumen bajo = poca convicción, movimiento frágil.",
    },
    {
      type: "chartExample",
      caption: "Dos subidas idénticas en precio, muy distintas en respaldo",
      candles: [
        { label: "L", open: 100, close: 104, high: 105, low: 99, volume: 900 },
        { label: "M", open: 104, close: 108, high: 109, low: 103, volume: 1100 },
        { label: "X", open: 108, close: 112, high: 113, low: 107, volume: 1500 },
        { label: "J", open: 112, close: 116, high: 117, low: 111, volume: 400 },
        { label: "V", open: 116, close: 120, high: 121, low: 115, volume: 250 },
      ],
      annotations: [
        "L-X: la subida viene acompañada de volumen creciente — participación real",
        "J-V: el precio sigue subiendo pero cada vez con menos negociación",
        "La segunda parte del tramo es más frágil: menos manos la sostienen",
      ],
    },
    {
      type: "concept",
      emoji: "🔍",
      title: "Cuándo mirar el volumen",
      body:
        "**Rupturas**: si el precio supera una zona importante con volumen alto, el movimiento tiene respaldo. Sin volumen, sospecha.\n\n" +
        "**Días extremos**: un desplome con volumen gigante señala capitulación o noticia grave; el mismo desplome casi sin volumen puede ser solo falta de compradores un día tranquilo.",
    },
    {
      type: "concept",
      emoji: "⚠️",
      title: "También tiene trampas",
      body:
        "El volumen sube de forma natural en días de vencimientos, rebalanceos de índices o resultados — sin que signifique nada especial sobre la empresa.\n\n" +
        "Como todo en el análisis: es **una pieza de contexto**, no un semáforo. Se lee junto al precio, nunca en solitario.",
    },
    {
      type: "quiz",
      question: "Una acción rompe su máximo anual. ¿En qué escenario es más fiable el movimiento?",
      options: [
        "Con el volumen más bajo del mes: nadie lo vio venir",
        "Con volumen muy superior a la media: mucho dinero respaldó la ruptura",
        "El volumen no cambia la fiabilidad",
        "Con volumen exactamente igual a la media",
      ],
      correctIndex: 1,
      explanation:
        "Una ruptura con volumen alto significa que muchos participantes pusieron dinero real en ese nivel — hay convicción detrás. Las rupturas sin volumen se quedan sin gasolina con más frecuencia. No es garantía, pero sí un contexto mucho más sólido.",
    },
    {
      type: "trueFalse",
      statement: "Si el precio sube, da igual el volumen: subida es subida.",
      answer: false,
      explanation:
        "Falso. Dos subidas idénticas en precio pueden ser opuestas en solidez: una respaldada por participación masiva y otra sostenida por cuatro órdenes en un mercado vacío. El volumen es la diferencia entre una multitud empujando y una brisa moviendo una puerta entreabierta.",
    },
    {
      type: "quiz",
      question: "Un valor cae un 8% con un volumen 10 veces superior a su media. ¿Qué lectura es más razonable?",
      options: [
        "Es un día normal, las caídas siempre tienen volumen",
        "Algo relevante ha pasado o está pasando: muchísimo dinero decidió salir — toca investigar antes de opinar",
        "Es señal segura de compra: está barato",
        "Es señal segura de venta: va a quebrar",
      ],
      correctIndex: 1,
      explanation:
        "Volumen extremo = evento relevante (resultados, noticia, cambio de percepción masivo). Lo que NO te dice es qué hacer: ni 'compra la caída' ni 'huye' — te dice 'entérate de qué pasó antes de tocar nada'. Investigar antes de actuar es el hábito que este curso quiere grabarte.",
    },
  ],
};
