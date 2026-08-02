import type { Lesson } from "@stockiq/shared-types";

export const lesson: Lesson = {
  id: "n0-l3",
  levelId: "nivel-0",
  order: 3,
  title: "¿Qué es la bolsa? ¿Y un índice?",
  description: "El mercado no es un casino: es un lugar donde se encuentran compradores y vendedores. Los índices son su termómetro.",
  estimatedMinutes: 5,
  blocks: [
    {
      type: "concept",
      emoji: "🏛️",
      title: "Un mercado, literalmente",
      body:
        "La bolsa es un mercado como el de tu barrio, solo que en vez de fruta se compran y venden **participaciones de empresas**.\n\n" +
        "Cuando compras una acción, no se la compras a la empresa: se la compras a **otra persona** que la quiere vender. El precio es simplemente el punto donde comprador y vendedor se ponen de acuerdo.",
    },
    {
      type: "concept",
      emoji: "⚖️",
      title: "Oferta y demanda, nada más",
      body:
        "Si hay más gente queriendo comprar que vender, el precio sube hasta que alguien acepta vender. Si hay más vendedores, baja hasta que alguien acepta comprar.\n\n" +
        "Detrás de cada movimiento de precio no hay magia ni conspiración: hay **millones de decisiones humanas** (y de algoritmos programados por humanos).",
    },
    {
      type: "concept",
      emoji: "🌡️",
      title: "Los índices: el termómetro del mercado",
      body:
        "Un **índice** es una cesta de empresas cuya evolución se resume en un solo número. El **S&P 500** agrupa ~500 grandes empresas de EE.UU.; el **Nasdaq 100**, las mayores tecnológicas; el **Euro Stoxx 50**, las grandes de Europa.\n\n" +
        "Cuando oyes \"la bolsa ha subido hoy\", en realidad se refieren a que uno de estos índices ha subido.",
    },
    {
      type: "liveStat",
      ticker: "AAPL",
      stat: "marketCap",
      caption: "Capitalización actual de Apple, la empresa que más pesa en el S&P 500. En un índice ponderado por tamaño, las empresas grandes mueven el número mucho más que las pequeñas.",
    },
    {
      type: "concept",
      emoji: "📊",
      title: "Para qué te sirven los índices",
      body:
        "Primero, como **referencia**: si tus inversiones suben un 5% pero el índice subió un 15%, no lo hiciste tan bien como parece.\n\n" +
        "Segundo, como **contexto**: cuando el mercado entero cae, que tu acción caiga no dice nada especial de tu empresa. Aprender a separar \"mi empresa\" de \"el mercado\" es una habilidad clave que practicarás aquí.",
    },
    {
      type: "quiz",
      question: "Compras 10 acciones de Microsoft en la bolsa. ¿A quién le estás comprando?",
      options: [
        "A Microsoft directamente",
        "Al gobierno de EE.UU.",
        "A otro inversor que quiere venderlas",
        "Al banco que gestiona la bolsa",
      ],
      correctIndex: 2,
      explanation:
        "En el mercado secundario (la bolsa de cada día) las acciones cambian de manos entre inversores. Microsoft solo recibe dinero cuando emite acciones nuevas (por ejemplo en su salida a bolsa). Por eso el precio lo fija el acuerdo entre compradores y vendedores, no la empresa.",
    },
    {
      type: "trueFalse",
      statement: "Si el S&P 500 cae un 2% y mi acción cae un 2%, algo malo ha pasado específicamente en mi empresa.",
      answer: false,
      explanation:
        "Falso. Cuando el mercado entero cae, casi todo cae con él — es la marea, no tu barco. Lo informativo es cuando tu acción se mueve DISTINTO que su índice: eso sí merece investigación. Compara siempre contra el contexto.",
    },
    {
      type: "quiz",
      question: "¿Qué es el S&P 500?",
      options: [
        "Las 500 empresas más rentables del mundo",
        "Una cesta de ~500 grandes empresas de EE.UU. cuya evolución conjunta se resume en un número",
        "Un fondo de inversión del gobierno americano",
        "Las 500 empresas más baratas de la bolsa",
      ],
      correctIndex: 1,
      explanation:
        "Es un índice: una cesta representativa de grandes empresas estadounidenses, ponderada por tamaño. Ni son 'las mejores' ni 'las más rentables' — son las más grandes que cumplen ciertos criterios. Sirve como termómetro y como vara de medir.",
    },
  ],
};
