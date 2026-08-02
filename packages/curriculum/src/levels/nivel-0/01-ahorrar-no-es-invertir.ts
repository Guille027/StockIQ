import type { Lesson } from "@stockiq/shared-types";

export const lesson: Lesson = {
  id: "n0-l1",
  levelId: "nivel-0",
  order: 1,
  title: "Ahorrar no es invertir",
  description: "Por qué el dinero quieto pierde valor, y qué cambia cuando lo pones a trabajar.",
  estimatedMinutes: 4,
  blocks: [
    {
      type: "concept",
      emoji: "🏦",
      title: "Tu dinero, quieto, se encoge",
      body:
        "Imagina que guardas **1.000 €** debajo del colchón durante 10 años. Seguirán siendo 1.000 €... sobre el papel.\n\n" +
        "El problema es que los precios suben cada año (eso se llama **inflación**). Lo que hoy cuesta 1.000 €, en 10 años puede costar 1.300 €. Tu billete es el mismo, pero compra menos.",
    },
    {
      type: "concept",
      emoji: "📉",
      title: "La inflación es silenciosa",
      body:
        "Con una inflación del **3% anual**, tu dinero pierde aproximadamente un tercio de su poder de compra en 12 años, sin que veas moverse ni un céntimo.\n\n" +
        "Ahorrar es imprescindible para emergencias. Pero como plan a largo plazo, **solo ahorrar es perder poco a poco**.",
    },
    {
      type: "chartExample",
      caption: "1.000 € guardados vs. lo que costará comprar lo mismo (inflación 3% anual)",
      line: [1000, 1030, 1061, 1093, 1126, 1159, 1194, 1230, 1267, 1305, 1344],
      annotations: ["El coste de la vida sube cada año", "Tus 1.000 € del colchón se quedan igual: cada año compran menos"],
    },
    {
      type: "concept",
      emoji: "🌱",
      title: "Invertir: poner el dinero a trabajar",
      body:
        "**Invertir** es usar tu dinero para comprar algo que puede generar valor con el tiempo: una parte de una empresa, por ejemplo.\n\n" +
        "A cambio de esa posibilidad de crecer, aceptas un riesgo: el valor puede bajar, sobre todo a corto plazo. La diferencia entre ahorrar e invertir es exactamente esa: **seguridad hoy a cambio de perder poder de compra, o riesgo controlado a cambio de la posibilidad de crecer**.",
    },
    {
      type: "concept",
      emoji: "🎯",
      title: "No se trata de hacerse rico rápido",
      body:
        "Invertir bien es **aburrido a propósito**: entender qué compras, por qué, y darle tiempo.\n\n" +
        "Cualquiera que te prometa resultados rápidos y seguros te está vendiendo humo. Esta app nunca hará eso: te va a enseñar a pensar, no a seguir señales.",
    },
    {
      type: "quiz",
      question: "Guardas 5.000 € en un cajón durante 15 años. ¿Qué pasa con ese dinero?",
      options: [
        "Nada, sigue valiendo exactamente lo mismo",
        "Sigue siendo la misma cifra, pero compra bastante menos",
        "Aumenta un poco por los intereses",
        "Pierde validez legal",
      ],
      correctIndex: 1,
      explanation:
        "La cifra no cambia, pero la inflación hace que los precios suban año tras año. Con un 3% anual, en 15 años esos 5.000 € comprarían aproximadamente lo que hoy compran 3.200 €. Ese es el coste invisible de dejar el dinero quieto.",
    },
    {
      type: "trueFalse",
      statement: "Ahorrar es inútil: hay que invertirlo todo.",
      answer: false,
      explanation:
        "Falso. Un colchón de emergencia (varios meses de gastos) en efectivo es la base de todo. Se invierte el dinero que no vas a necesitar a corto plazo. Ahorrar e invertir no compiten: se complementan.",
    },
    {
      type: "quiz",
      question: "¿Cuál es la diferencia esencial entre ahorrar e invertir?",
      options: [
        "Ahorrar es para pobres, invertir para ricos",
        "Invertir garantiza más dinero que ahorrar",
        "Ahorrar prioriza seguridad; invertir acepta riesgo a cambio de posible crecimiento",
        "No hay diferencia real, son sinónimos",
      ],
      correctIndex: 2,
      explanation:
        "Invertir nunca garantiza nada: acepta riesgo controlado a cambio de la posibilidad de crecer por encima de la inflación. Ahorrar te da seguridad inmediata, pero pierde poder de compra con los años. Un buen plan usa ambos.",
    },
  ],
};
