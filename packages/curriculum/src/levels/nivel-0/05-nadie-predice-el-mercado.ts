import type { Lesson } from "@stockiq/shared-types";

export const lesson: Lesson = {
  id: "n0-l5",
  levelId: "nivel-0",
  order: 5,
  title: "Nadie predice el mercado",
  description: "Por qué esta app nunca te dirá qué comprar -- y qué haremos en su lugar.",
  estimatedMinutes: 5,
  blocks: [
    {
      type: "concept",
      emoji: "🔮",
      title: "La industria de las predicciones",
      body:
        "Cada día, miles de analistas, gurús y algoritmos publican predicciones sobre el mercado. Si alguien acertara de forma consistente, sería la persona más rica del mundo en pocos años.\n\n" +
        "Nadie lo es. Ni los profesionales con equipos enormes aciertan de forma sostenida el rumbo del mercado a corto plazo.",
    },
    {
      type: "concept",
      emoji: "🎲",
      title: "Por qué es tan difícil",
      body:
        "El precio de hoy ya incorpora todo lo que el mercado sabe. Para predecir el de mañana necesitarías saber **qué sorpresas** traerá el futuro — y las sorpresas, por definición, no se pueden conocer antes.\n\n" +
        "Quien acertó una vez suele haber tenido suerte. Con millones de personas opinando, siempre habrá alguien que 'acertó' — como siempre hay alguien que gana la lotería.",
    },
    {
      type: "concept",
      emoji: "⚙️",
      title: "Proceso > pronóstico",
      body:
        "La buena noticia: **no necesitas predecir para invertir bien**. Necesitas un proceso: entender lo que compras, pagar precios razonables, dimensionar el riesgo y controlar tus emociones.\n\n" +
        "Un buen proceso repetido cientos de veces produce buenos resultados en conjunto, aunque cada operación individual sea incierta.",
    },
    {
      type: "concept",
      emoji: "🧭",
      title: "El trato que te propone esta app",
      body:
        "Por eso StockIQ **nunca** te dirá \"compra esto\" o \"vende ahora\". Sus herramientas de análisis te muestran datos y te enseñan a interpretarlos, pero **las conclusiones son siempre tuyas**.\n\n" +
        "El objetivo es que dentro de un tiempo no necesites que nadie — ni esta app, ni un gurú, ni un vecino — te diga qué hacer con tu dinero.",
    },
    {
      type: "quiz",
      question: "Un analista famoso acertó la caída de 2020 y ahora predice otra. ¿Qué valor tiene su predicción?",
      options: [
        "Mucho: ya demostró que sabe predecir",
        "Poco: con miles de personas prediciendo constantemente, alguien siempre acierta por azar",
        "Total: los expertos no se equivocan dos veces",
        "Depende de cuántos seguidores tenga",
      ],
      correctIndex: 1,
      explanation:
        "Es el sesgo del superviviente: solo oímos hablar de quien acertó, no de los miles que fallaron. Acertar una vez no demuestra capacidad de repetirlo. La evidencia dice que nadie predice el mercado de forma consistente — por eso tu proceso importa más que cualquier pronóstico.",
    },
    {
      type: "trueFalse",
      statement: "Para ganar dinero invirtiendo necesito saber qué hará el mercado los próximos meses.",
      answer: false,
      explanation:
        "Falso, y es la idea más liberadora de todo el curso: los buenos inversores no predicen — se preparan. Compran buenos negocios a precios razonables, dimensionan el riesgo para sobrevivir a cualquier escenario, y dejan que el tiempo trabaje. El proceso es su ventaja, no la bola de cristal.",
    },
    {
      type: "quiz",
      question: "¿Por qué StockIQ no da señales de compra/venta?",
      options: [
        "Porque es ilegal darlas",
        "Porque la versión gratuita no las incluye",
        "Porque su objetivo es que aprendas a decidir por ti mismo, y las señales enseñan a depender, no a pensar",
        "Porque todavía no está terminada",
      ],
      correctIndex: 2,
      explanation:
        "Exacto. Seguir señales de otros no te hace mejor inversor — te hace dependiente de que el señalero acierte (y nadie acierta consistentemente). Cada función de esta app está diseñada para entrenar tu criterio: ese es el único activo que nadie podrá quitarte.",
    },
  ],
};
