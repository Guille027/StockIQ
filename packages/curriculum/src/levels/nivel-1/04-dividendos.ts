import type { Lesson } from "@stockiq/shared-types";

export const lesson: Lesson = {
  id: "n1-l4",
  levelId: "nivel-1",
  order: 4,
  title: "Dividendos",
  description: "La parte del beneficio que la empresa te paga en efectivo -- y por qué 'más dividendo' no siempre es mejor.",
  estimatedMinutes: 5,
  blocks: [
    {
      type: "concept",
      emoji: "💵",
      title: "Tu parte del beneficio, en efectivo",
      body:
        "Cuando una empresa gana dinero puede **reinvertirlo** (crecer, recomprar acciones, pagar deuda) o **repartirlo** entre sus dueños. Ese reparto periódico en efectivo es el **dividendo**.\n\n" +
        "Si tienes 100 acciones y la empresa paga $0,50 por acción al trimestre, cobras $50 cada tres meses. Por ser dueño, sin vender nada.",
    },
    {
      type: "concept",
      emoji: "📐",
      title: "La yield: dividendo en porcentaje",
      body:
        "La **rentabilidad por dividendo** (dividend yield) = dividendo anual ÷ precio de la acción. Si paga $2 al año y cotiza a $100, la yield es 2%.\n\n" +
        "Cuidado: como el precio está en el denominador, **la yield sube cuando el precio cae**. Una yield altísima puede ser una señal de peligro, no de generosidad.",
    },
    {
      type: "liveStat",
      ticker: "KO",
      stat: "dividendYield",
      caption: "Rentabilidad por dividendo actual de Coca-Cola, una de las empresas que más años lleva pagando y subiendo su dividendo de forma consecutiva.",
    },
    {
      type: "concept",
      emoji: "⚖️",
      title: "El payout: ¿es sostenible?",
      body:
        "El **payout ratio** es qué porcentaje del beneficio se va en dividendos. Un payout del 40% deja margen para crecer y aguantar años malos; uno del 95% es una cuerda tensa: cualquier tropiezo del negocio obliga a recortar.\n\n" +
        "Un dividendo alto con payout insostenible es un dividendo con fecha de caducidad.",
    },
    {
      type: "concept",
      emoji: "🌱",
      title: "Sin dividendo también se gana",
      body:
        "Muchas grandes empresas (Amazon, Berkshire) no pagan dividendo: reinvierten todo porque creen que así crean más valor por acción.\n\n" +
        "Ni pagar es 'ser buena' ni no pagar es 'ser mala': la pregunta correcta es **¿qué hace la empresa con el beneficio, y ese uso crea valor?**",
    },
    {
      type: "quiz",
      question: "Una acción caía en bolsa mes tras mes y ahora su yield es del 12%. ¿Cuál es la lectura más prudente?",
      options: [
        "Compra inmediata: 12% anual asegurado",
        "Sospecha: la yield disparada suele reflejar un precio desplomado, y el mercado puede estar anticipando un recorte del dividendo",
        "La yield no tiene relación con el precio",
        "Es imposible que una yield sea del 12%",
      ],
      correctIndex: 1,
      explanation:
        "Yield = dividendo ÷ precio: cuando el precio se desploma, la yield 'mejora' automáticamente... hasta que la empresa recorta el dividendo porque el negocio va mal. Las 'trampas de dividendo' atrapan a quien mira solo el porcentaje sin preguntarse por qué está tan alto.",
    },
    {
      type: "trueFalse",
      statement: "Una empresa que no paga dividendo no genera ningún retorno a sus accionistas.",
      answer: false,
      explanation:
        "Falso. Si la empresa reinvierte el beneficio en crecer (o recompra acciones), el valor de cada acción puede aumentar — retorno vía revalorización en lugar de efectivo. Amazon no pagó dividendos en décadas y multiplicó el patrimonio de sus accionistas.",
    },
    {
      type: "quiz",
      question: "Empresa con payout del 95% y beneficios estancados. ¿Qué le puede pasar a su dividendo?",
      options: [
        "Nada, los dividendos son obligatorios por ley",
        "Está en riesgo: sin crecimiento y repartiendo casi todo, cualquier bache fuerza un recorte",
        "Subirá automáticamente cada año",
        "El payout no afecta al dividendo",
      ],
      correctIndex: 1,
      explanation:
        "Repartir el 95% del beneficio no deja colchón: si el beneficio cae un 20%, el dividendo ya no se cubre y hay que recortarlo (o endeudarse para pagarlo, aún peor). El payout es el dato que convierte 'qué paga' en 'podrá seguir pagándolo'.",
    },
  ],
};
