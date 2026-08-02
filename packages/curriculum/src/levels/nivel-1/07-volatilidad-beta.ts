import type { Lesson } from "@stockiq/shared-types";

export const lesson: Lesson = {
  id: "n1-l7",
  levelId: "nivel-1",
  order: 7,
  title: "Volatilidad y beta",
  description: "'Se mueve mucho' no significa 'gana mucho'. Cómo medir cuánto se agita una acción y qué hacer con ese dato.",
  estimatedMinutes: 5,
  blocks: [
    {
      type: "concept",
      emoji: "🌊",
      title: "Volatilidad: el oleaje del precio",
      body:
        "La **volatilidad** mide cuánto varía el precio. Una acción que se mueve ±1% al día es tranquila; una que se mueve ±6% es una montaña rusa.\n\n" +
        "No es 'mala' en sí: es el peaje del mercado. El problema es llevar más volatilidad de la que tu estómago tolera — ahí llegan las ventas de pánico.",
    },
    {
      type: "chartExample",
      caption: "Dos activos con el MISMO resultado final y experiencias opuestas por el camino",
      line: [100, 103, 101, 105, 104, 107, 106, 109, 108, 111, 110],
      annotations: [
        "Activo tranquilo: de 100 a 110 con vaivenes suaves — fácil de mantener",
        "Un activo volátil pudo hacer el mismo viaje pasando por 80 y por 125",
        "Mismo destino, muy distinta probabilidad de que vendieras asustado en el peor momento",
      ],
    },
    {
      type: "concept",
      emoji: "📡",
      title: "Beta: volatilidad respecto al mercado",
      body:
        "La **beta** compara los movimientos de una acción con los de su índice. Beta 1 = se mueve como el mercado. Beta 1,5 = amplifica (mercado +1% → acción +1,5%, y lo mismo cayendo). Beta 0,5 = amortigua.\n\n" +
        "Una cartera llena de betas altas es una cartera que sufrirá el doble en las caídas. Conocer tu beta agregada es conocer tu exposición real.",
    },
    {
      type: "liveStat",
      ticker: "KO",
      stat: "beta",
      caption: "Beta actual de Coca-Cola: los negocios defensivos (consumo básico) suelen amortiguar los vaivenes del mercado — la gente sigue comprando refrescos en las crisis.",
    },
    {
      type: "concept",
      emoji: "🧠",
      title: "El dato es sobre TI",
      body:
        "La utilidad más honesta de la volatilidad no es predecir — es **autoconocimiento**: ¿aguantarías ver tu cartera un -30% sin vender? ¿Y un -50%?\n\n" +
        "Quien se conoce elige activos y tamaños que puede sostener. En el simulador de esta app, tu selector de emociones registrará exactamente cómo reaccionas a los vaivenes. Esos datos valdrán oro.",
    },
    {
      type: "quiz",
      question: "El mercado cae un 2%. Una acción con beta 1,5, ¿qué caída aproximada cabría esperar?",
      options: ["0,5%", "1,5%", "2%", "3%"],
      correctIndex: 3,
      explanation:
        "Beta 1,5 amplifica los movimientos del mercado por 1,5: caída esperada ≈ 2% × 1,5 = 3%. Es una relación estadística aproximada, no una ley física — pero como orden de magnitud te dice cuánto te agitará una cartera llena de betas altas.",
    },
    {
      type: "trueFalse",
      statement: "Una acción muy volátil ofrece necesariamente más rentabilidad a largo plazo.",
      answer: false,
      explanation:
        "Falso. La volatilidad mide agitación, no calidad ni retorno. Hay acciones volatilísimas que destruyen valor durante décadas y negocios tranquilos que capitalizan año tras año. 'Se mueve mucho' solo garantiza una cosa: que el viaje será difícil de aguantar.",
    },
    {
      type: "quiz",
      question: "¿Cuál es el uso más valioso de conocer la volatilidad de tus posiciones?",
      options: [
        "Predecir cuándo va a subir cada acción",
        "Presumir de aguantar emociones fuertes",
        "Dimensionar posiciones que puedas mantener sin vender por pánico en una caída",
        "Ninguno, es un dato irrelevante",
      ],
      correctIndex: 2,
      explanation:
        "El inversor que dimensiona según su tolerancia real sobrevive a las caídas sin vender abajo — que es donde se destruyen la mayoría de patrimonios particulares. La volatilidad no te dice qué comprar: te dice CUÁNTO puedes llevar de cada cosa sin perder la cabeza.",
    },
  ],
};
