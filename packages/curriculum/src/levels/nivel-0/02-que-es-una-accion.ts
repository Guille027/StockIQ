import type { Lesson } from "@stockiq/shared-types";

export const lesson: Lesson = {
  id: "n0-l2",
  levelId: "nivel-0",
  order: 2,
  title: "¿Qué es una acción?",
  description: "Comprar una acción es comprar un trozo de verdad de una empresa. Aquí entiendes qué significa eso.",
  estimatedMinutes: 5,
  blocks: [
    {
      type: "concept",
      emoji: "🍕",
      title: "Una empresa cortada en porciones",
      body:
        "Imagina una pizzería que vale 100.000 €. Su dueña necesita dinero para crecer, así que corta la propiedad en **1.000 porciones iguales** y vende una parte.\n\n" +
        "Cada porción vale 100 € y se llama **acción**. Quien compra una, es dueño del 0,1% de la pizzería. De verdad. Con derecho a parte de los beneficios.",
    },
    {
      type: "concept",
      emoji: "🏢",
      title: "Esto no es una metáfora",
      body:
        "Cuando compras una acción de Apple, eres **copropietario de Apple**: de sus fábricas, sus patentes, su marca y sus beneficios futuros.\n\n" +
        "No estás \"apostando a que el precio sube\". Estás comprando una parte de un negocio real. Esta diferencia de mentalidad separa al inversor del especulador.",
    },
    {
      type: "liveStat",
      ticker: "AAPL",
      stat: "price",
      caption: "Esto cuesta ahora mismo UNA acción de Apple — el precio real, en vivo. Ser dueño de un trozo de una de las mayores empresas del mundo está a un clic.",
    },
    {
      type: "concept",
      emoji: "💰",
      title: "¿Y cómo ganas dinero?",
      body:
        "De dos formas. **1)** Si la empresa va bien y vale más, tu acción vale más (podrás venderla más cara). **2)** Algunas empresas reparten parte del beneficio en efectivo cada trimestre: los **dividendos**.\n\n" +
        "Y también puedes perder: si el negocio empeora, tu porción vale menos. Por eso importa entender **qué** compras.",
    },
    {
      type: "concept",
      emoji: "⚖️",
      title: "El precio se mueve, el negocio también",
      body:
        "El precio de una acción cambia cada segundo porque miles de personas compran y venden a la vez, cada una con sus motivos y emociones.\n\n" +
        "A corto plazo, el precio refleja **estados de ánimo**. A largo plazo, tiende a reflejar **cómo va el negocio de verdad**. Aprender a distinguir las dos cosas es gran parte de este curso.",
    },
    {
      type: "quiz",
      question: "Compras 10 acciones de una empresa que tiene 1.000 acciones en total. ¿Qué has comprado exactamente?",
      options: [
        "Un vale que sube o baja de precio, como un cupón",
        "El 1% de la propiedad real de la empresa",
        "Un préstamo que la empresa te devolverá",
        "El derecho a trabajar en la empresa",
      ],
      correctIndex: 1,
      explanation:
        "10 de 1.000 acciones = 1% de la empresa. Eres copropietario: te corresponde esa fracción del negocio y de sus beneficios. Un préstamo a la empresa sería un bono, no una acción — esa es otra clase de activo.",
    },
    {
      type: "trueFalse",
      statement: "Si el precio de una acción cae un 20% en una semana, el negocio de la empresa vale necesariamente un 20% menos.",
      answer: false,
      explanation:
        "Falso. A corto plazo el precio refleja emociones, noticias y flujos de compra/venta — el negocio subyacente (fábricas, clientes, beneficios) rara vez cambia tan rápido. A veces el precio cae sin que el negocio haya cambiado... y a veces la caída sí avisa de un problema real. Distinguirlo es lo que aprenderás aquí.",
    },
    {
      type: "quiz",
      question: "¿Cuáles son las dos formas de ganar dinero siendo accionista?",
      options: [
        "Salario de la empresa y bonus anual",
        "Revalorización de la acción y dividendos",
        "Intereses fijos y comisiones",
        "Solo una: vender más caro de lo que compraste",
      ],
      correctIndex: 1,
      explanation:
        "Si el negocio prospera, tu acción puede valer más (revalorización), y muchas empresas reparten además parte del beneficio en efectivo (dividendos). Ninguna de las dos está garantizada — por eso invertir exige criterio, no fe.",
    },
  ],
};
