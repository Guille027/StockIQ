import type { Lesson } from "@stockiq/shared-types";

export const lesson: Lesson = {
  id: "n0-l4",
  levelId: "nivel-0",
  order: 4,
  title: "Riesgo, horizonte y diversificación",
  description: "El trípode del principiante: cuánto puedes perder, cuánto tiempo tienes y no jugártelo todo a una carta.",
  estimatedMinutes: 6,
  blocks: [
    {
      type: "concept",
      emoji: "🎢",
      title: "El riesgo no es un enemigo",
      body:
        "Riesgo es la posibilidad de que el resultado sea distinto (peor) del que esperabas. En bolsa se manifiesta como **volatilidad**: los precios suben y bajan, a veces con violencia.\n\n" +
        "Sin riesgo no hay rentabilidad posible por encima de la inflación. La cuestión nunca es evitarlo, sino **tomarlo en la dosis que puedas soportar** sin vender presa del pánico.",
    },
    {
      type: "concept",
      emoji: "⏳",
      title: "El horizonte lo cambia todo",
      body:
        "Históricamente, las bolsas han tenido años terribles (-30% o peor) y aun así décadas buenas. Cuanto más largo tu horizonte, más probabilidades de que los buenos años compensen los malos.\n\n" +
        "Regla práctica: **el dinero que necesitas en menos de 3-5 años no debería estar en bolsa**. La bolsa castiga a quien tiene prisa.",
    },
    {
      type: "chartExample",
      caption: "El mismo viaje visto de cerca y de lejos: un año con sustos puede formar parte de una década buena",
      line: [100, 112, 95, 121, 108, 87, 116, 134, 122, 149, 163],
      annotations: [
        "Cada bajada del gráfico fue un momento en el que muchos vendieron con pérdidas",
        "Quien miraba la línea completa, y no el susto del mes, tomó mejores decisiones",
      ],
    },
    {
      type: "concept",
      emoji: "🧺",
      title: "Diversificar: no todos los huevos en la misma cesta",
      body:
        "Si toda tu cartera es una sola empresa, un solo error (tuyo o de la empresa) puede costarte años de ahorro. Repartir entre **varias empresas, sectores y geografías** hace que ningún fallo individual te hunda.\n\n" +
        "Ojo: comprar 5 tecnológicas de EE.UU. no es diversificar — es la misma apuesta cinco veces.",
    },
    {
      type: "concept",
      emoji: "🛡️",
      title: "Tu regla de supervivencia",
      body:
        "Antes de cada inversión, pregúntate: **¿cuánto puedo perder aquí y seguir durmiendo bien?**\n\n" +
        "En el simulador de esta app practicarás definiendo ese límite ANTES de cada operación. Cuando llegues al mercado real, ya será un hábito.",
    },
    {
      type: "quiz",
      question: "Tienes 10.000 € que necesitarás dentro de un año para la entrada de un piso. ¿Qué haces?",
      options: [
        "Invertirlo todo en bolsa: un año da para mucho",
        "Invertir la mitad, por si acaso",
        "No invertirlo en bolsa: el plazo es demasiado corto",
        "Invertirlo en una sola empresa muy segura",
      ],
      correctIndex: 2,
      explanation:
        "Con horizonte de 1 año, la probabilidad de pillar un mal año es demasiado alta y no habría tiempo de recuperarse. La bolsa recompensa la paciencia y castiga la prisa. Dinero con fecha de uso cercana = fuera de bolsa, aunque 'parezca' que sube.",
    },
    {
      type: "trueFalse",
      statement: "Tener acciones de 5 grandes tecnológicas americanas es una cartera bien diversificada.",
      answer: false,
      explanation:
        "Falso. Esas empresas comparten sector, país, y muchos de los mismos riesgos (regulación, ciclo tecnológico, tipos de interés). Cuando una cae por un motivo sectorial, suelen caer todas. Diversificar de verdad implica repartir entre sectores y geografías distintas.",
    },
    {
      type: "quiz",
      question: "¿Cuál es la relación correcta entre riesgo y rentabilidad?",
      options: [
        "A más riesgo, más rentabilidad garantizada",
        "Sin aceptar algo de riesgo no hay rentabilidad real posible, pero el riesgo nunca garantiza nada",
        "El riesgo se puede eliminar por completo diversificando",
        "Riesgo y rentabilidad no tienen relación",
      ],
      correctIndex: 1,
      explanation:
        "El riesgo es el precio de la rentabilidad posible — pero es un precio, no un boleto premiado. Asumir mucho riesgo también puede simplemente hacerte perder mucho. La diversificación reduce el riesgo específico de cada empresa, pero nunca elimina el riesgo de mercado.",
    },
  ],
};
