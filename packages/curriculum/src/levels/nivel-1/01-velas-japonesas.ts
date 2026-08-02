import type { Lesson } from "@stockiq/shared-types";

export const lesson: Lesson = {
  id: "n1-l1",
  levelId: "nivel-1",
  order: 1,
  title: "Velas japonesas",
  description: "El idioma visual de los gráficos: qué cuenta cada vela sobre la batalla entre compradores y vendedores.",
  estimatedMinutes: 6,
  blocks: [
    {
      type: "concept",
      emoji: "🕯️",
      title: "Cuatro datos en un dibujo",
      body:
        "Cada vela resume un periodo (un día, una hora...) con cuatro precios: **apertura**, **cierre**, **máximo** y **mínimo**.\n\n" +
        "El rectángulo (el **cuerpo**) va de la apertura al cierre. Las líneas finas de arriba y abajo (las **mechas**) marcan hasta dónde llegó el precio en su punto más alto y más bajo.",
    },
    {
      type: "chartExample",
      caption: "Una vela alcista (cierra por encima de donde abrió) y una bajista (cierra por debajo)",
      candles: [
        { label: "Alcista", open: 100, close: 108, high: 110, low: 98 },
        { label: "Bajista", open: 108, close: 101, high: 109, low: 99 },
      ],
      annotations: [
        "Alcista: abrió en 100, cerró en 108 — los compradores ganaron el día",
        "Bajista: abrió en 108, cerró en 101 — dominaron los vendedores",
        "Las mechas muestran los extremos que se tocaron pero no se sostuvieron",
      ],
    },
    {
      type: "concept",
      emoji: "⚔️",
      title: "Cada vela es una batalla",
      body:
        "Un cuerpo grande alcista dice que los compradores dominaron con claridad. Un cuerpo pequeño con mechas largas dice que hubo pelea intensa y nadie ganó.\n\n" +
        "Una mecha superior larga significa que el precio subió mucho... y fue **rechazado**: alguien vendió fuerte ahí arriba.",
    },
    {
      type: "chartExample",
      caption: "Cinco días de historia: subida con fuerza, duda, y rechazo en los máximos",
      candles: [
        { label: "D1", open: 100, close: 107, high: 108, low: 99 },
        { label: "D2", open: 107, close: 113, high: 114, low: 106 },
        { label: "D3", open: 113, close: 114, high: 121, low: 112 },
        { label: "D4", open: 114, close: 108, high: 115, low: 107 },
        { label: "D5", open: 108, close: 104, high: 109, low: 102 },
      ],
      annotations: [
        "D1-D2: cuerpos grandes alcistas, compradores al mando",
        "D3: mecha superior enorme — se tocó 121 pero se cerró en 114: rechazo",
        "D4-D5: los vendedores toman el control tras el rechazo",
      ],
    },
    {
      type: "concept",
      emoji: "🚫",
      title: "Lo que las velas NO son",
      body:
        "Una vela no predice nada por sí sola. \"Patrones mágicos\" con nombres exóticos no son señales infalibles — son **descripciones de lo que ya pasó**.\n\n" +
        "Su valor real: leer rápidamente dónde hubo presión de compra, de venta, o indecisión. Contexto, no bola de cristal.",
    },
    {
      type: "quiz",
      question: "Una vela abre en 50, cierra en 58, con máximo en 59 y mínimo en 49. ¿Qué pasó ese día?",
      options: [
        "Dominaron los vendedores",
        "Dominaron los compradores: el precio cerró muy por encima de la apertura",
        "Hubo empate total",
        "No se puede saber sin el volumen",
      ],
      correctIndex: 1,
      explanation:
        "Cuerpo alcista grande (de 50 a 58) con mechas pequeñas: los compradores empujaron el precio con decisión y lo sostuvieron hasta el cierre. El volumen añade matices, pero la lectura básica de la vela es clara.",
    },
    {
      type: "quiz",
      question: "Una vela tiene una mecha superior muy larga y cierra cerca de donde abrió. ¿Qué te cuenta?",
      options: [
        "Los compradores dominaron todo el día",
        "El precio intentó subir pero fue rechazado: alguien vendió con fuerza en los máximos",
        "Nada, las mechas son ruido aleatorio",
        "La empresa publicó buenos resultados",
      ],
      correctIndex: 1,
      explanation:
        "La mecha larga superior marca terreno que se conquistó y se perdió: el precio llegó alto pero los vendedores lo devolvieron abajo antes del cierre. Es información sobre presión vendedora en esa zona — no una predicción, pero sí una pista de dónde hay oferta.",
    },
    {
      type: "trueFalse",
      statement: "Ciertos patrones de velas, bien memorizados, predicen el futuro del precio con fiabilidad.",
      answer: false,
      explanation:
        "Falso. Los patrones describen la psicología del pasado reciente (quién empujó y quién cedió), y eso es útil como contexto. Pero ningún patrón tiene poder predictivo fiable por sí solo — si lo tuviera, dejaría de funcionar en cuanto todos lo usaran. Úsalos para leer, no para adivinar.",
    },
  ],
};
