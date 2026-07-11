# StockIQ — Arquitectura

StockIQ es una app de análisis de acciones para inversores particulares. Combina datos
fundamentales, precio, noticias y un motor de IA multiagente para ayudar a evaluar
~130 grandes empresas cotizadas -- nunca para predecir el futuro ni recomendar
"compra/vende". Todo razonamiento se apoya en datos verificables y se expresa en
términos de probabilidad y riesgo.

## 1. Universo de inversión

El universo está fijado en código en [`packages/universe`](../packages/universe/src/index.ts):
~130 empresas grandes y líquidas (S&P 100, solapamiento Nasdaq-100, Dow Jones, y
grandes compañías europeas como ASML, SAP, LVMH o Novo Nordisk). **Nunca** ETFs,
criptomonedas, forex, materias primas, opciones, CFDs, futuros ni penny stocks.

Toda ruta de la API que expone datos de una empresa (`market-data`, `scoring`,
`scanner`, `ai`) valida el ticker contra `isInUniverse()` antes de hacer nada más.
Esta es la garantía técnica de que la app nunca "se sale" de su universo declarado.

## 2. Arquitectura del monorepo

```
apps/
  mobile/   Expo + React Native (Android-first, PWA-like fluidez)
  api/      NestJS (Fastify) -- toda la lógica de servidor
packages/
  shared-types/    Contratos TS compartidos entre api y mobile
  universe/        Universo de inversión (fuente de verdad)
  scoring-engine/  Motor de puntuación puro y testeado
```

Cada subsistema pedido (frontend, backend, BD, auth, motor IA, análisis,
backtesting, paper trading, notificaciones) vive en su propio módulo NestJS con
una responsabilidad clara -- ver sección 8 para el estado de cada uno.

### Por qué esta pila

- **React Native + Expo**: experiencia nativa real en Android (y iOS/web sin coste
  extra), con Expo Go para probar en el móvil físico sin builds nativos.
- **NestJS + Fastify**: arquitectura modular con inyección de dependencias -- encaja
  con la necesidad de separar claramente cada subsistema y escalar a miles de
  usuarios.
- **PostgreSQL + Prisma**: persistencia tipada de usuarios, watchlists, paper
  trading, alertas y backtests.
- **Motor de puntuación como paquete puro**: `scoring-engine` no depende de Nest ni
  de red -- son funciones puras testeadas con Vitest, reutilizables también por el
  futuro motor de backtesting (que necesita recalcular scores en el pasado).

## 3. Flujo de datos de un perfil de empresa

```
Mobile (app/company/[ticker].tsx)
  -> GET /companies/:ticker
       MarketDataService (caché) -> MarketDataProvider (Finnhub | Mock)
       ScoringService (caché) -> scoring-engine.computeAllScores()
       NewsService (caché) -> sentimiento + dedup
  -> POST /companies/:ticker/ai-report (bajo demanda, no automático)
       AiService -> OrchestratorService -> Agentes especializados -> Gemini
```

Todo pasa por `CacheService` (TTL en memoria en fase 1, ver sección 9) para no
machacar el rate limit gratuito de Finnhub ni generar informes IA en cada
petición.

## 4. Sistema de puntuación (`packages/scoring-engine`)

Cada empresa recibe 9 puntuaciones independientes (0-100), todas explicables:

| Score | Qué mide | Mayor es mejor |
|---|---|---|
| Fundamental | Roll-up ponderado de Quality+Growth+Value+Financial Health | Sí |
| Growth | Crecimiento de ingresos y BPA (YoY y CAGR 3a) | Sí |
| Quality | ROE, ROIC, márgenes | Sí |
| Momentum | Tendencia de precio 1M/3M/6M/12M + posición en rango 52 semanas | Sí |
| Value | PER, PEG, P/S, EV/EBITDA frente a rangos de referencia | Sí |
| Risk | Beta, deuda neta/EBITDA, ratio corriente, colchón de margen | Sí (mayor = **menor** riesgo) |
| News | Sentimiento agregado de noticias recientes relevantes | Sí |
| Financial Health | Caja/deuda, FCF yield, apalancamiento, liquidez | Sí |
| AI Confidence | Completitud de datos (fase 1) / confianza real de los agentes (fase 2 en adelante) | Sí |

`Global Score` = media ponderada de Fundamental (40%), Momentum (15%), Risk (15%),
News (15%), AI Confidence (15%).

Cada categoría devuelve un `ScoreBreakdown` con una lista de `factors`: valor
crudo, cuánto contribuyó al score, el rango de referencia usado y una frase
explicando el porqué. Nunca se expone un número sin su justificación -- ver
[`packages/scoring-engine/src`](../packages/scoring-engine/src).

Todos los umbrales (ej. "PER 8-60", "ROE 0%-40%") son heurísticas fijas
documentadas en el código, pensadas para grandes caps -- no son medias
sectoriales dinámicas todavía (mejora natural de fase 2: comparar contra la
mediana del sector en vez de un rango fijo).

## 5. Motor de IA multiagente (`apps/api/src/ai`)

El motor de IA está detrás de una interfaz propia, `AiClient`
(`ai-client.interface.ts`) -- mismo patrón de "provider abstraction" que
`MarketDataProvider`. **Google Gemini es el motor por defecto**
(`gemini.client.ts`, plan gratuito real de [ai.google.dev](https://ai.google.dev),
sin tarjeta), usando su función de salida JSON estructurada nativa
(`responseSchema` + `responseMimeType: application/json`) en vez del truco de
tool-use que usan otros modelos. `anthropic.client.ts` (Claude, de pago)
queda como alternativa opcional detrás de la misma interfaz -- se activa
automáticamente si defines `ANTHROPIC_API_KEY` y dejas `GEMINI_API_KEY`
vacía (ver `ai.module.ts`).

En vez de un único prompt gigante, el informe de cada empresa se construye con
agentes especializados que solo ven la porción de datos relevante y devuelven una
salida JSON estructurada:

- **Agente Fundamental** (`agents/fundamental.agent.ts`) -- solo fundamentales.
- **Agente de Noticias** (`agents/news.agent.ts`) -- solo titulares/resúmenes reales.
- **Agente de Riesgo** (`agents/risk.agent.ts`) -- apalancamiento, beta, scores de
  riesgo ya calculados.
- **Agente Técnico / Resultados / Macro** -- *stubs* (`agents/stub.agent.ts`) listos
  para implementarse en fase 2 con la misma interfaz `Agent<Input, Output>`.

Un **orquestador** (`orchestrator.service.ts`) ejecuta los tres agentes reales en
paralelo y hace una llamada final al `AiClient` configurado que combina sus
salidas en un informe único y coherente (`AiReport`): resumen de negocio, cómo
gana dinero, situación financiera, valoración, fortalezas, debilidades,
riesgos, catalizadores, resumen de noticias, resultados pasados y expectativas
del mercado -- más un `aiConfidenceScore`.

**Sin `GEMINI_API_KEY` ni `ANTHROPIC_API_KEY` configuradas**, el orquestador
genera un informe de ejemplo, construido a partir de los datos reales/mock
disponibles y **siempre etiquetado `isMock: true`**, tanto en el JSON como
visualmente en la app (nunca se presenta como análisis real). Los informes se
cachean 12h para controlar coste y latencia; el usuario puede forzar
regeneración.

## 6. Scanner (`apps/api/src/scanner`)

Recorre el universo completo (vía `ScoringService.getUniverseSnapshot()`, cacheado
6h) aplicando los filtros pedidos (PER máx, ROE mín, ROIC mín, crecimiento,
margen operativo, cap. mínima, sector, insider buying, noticias positivas, score
global mínimo) y devuelve, por cada resultado, **qué filtros concretos cumplió**
(`matchedFilters`), no solo un número.

`upcomingEarningsWithinDays` está en el contrato pero no filtra todavía --
depende del módulo de calendario (fase 2).

## 7. Noticias (`apps/api/src/news`)

- Ingesta desde Finnhub (`/company-news`, `/news?category=general`) o, sin API
  key, un generador mock claramente etiquetado.
- **Deduplicación**: similitud de Jaccard sobre el titular normalizado (umbral
  0.6) -- fusiona titulares casi idénticos de distintas fuentes.
- **Sentimiento e importancia**: heurística basada en listas de palabras clave
  (fase 1). Mejora natural de fase 2: clasificador entrenado o paso por Claude
  para los titulares más relevantes.
- El **News Score** del motor de puntuación consume la señal agregada de este
  módulo (`NewsService.getSignal`).

## 8. Estado de cada subsistema pedido

| Subsistema | Estado fase 1 |
|---|---|
| Pantalla principal (Home) | ✅ funcional (`GET /home`) |
| Perfil de empresa completo | ✅ funcional |
| IA analista (informe completo) | ✅ funcional (3 agentes reales + orquestador) |
| Sistema de puntuación | ✅ funcional, 9 scores explicables |
| Scanner | ✅ funcional (sin filtro de resultados próximos todavía) |
| Noticias | ✅ funcional (dedup + sentimiento heurístico) |
| Calendario | 🚧 scaffold -- esquema y contrato definidos, `501` |
| Backtesting | 🚧 scaffold -- esquema y contrato definidos, `501` |
| Paper Trading | ✅ funcional (fase 2, ver sección 13) -- comprar/vender, varias carteras, resetear |
| Alertas | 🚧 scaffold -- esquema Prisma listo, `501` |
| Chat IA | 🚧 pantalla "Próximamente" en la app |
| Auth | ⏸️ backend implementado pero **sin usar** -- la app está pensada para un único usuario, sin login (ver sección 10) |

Los módulos 🚧 tienen su controlador, carpeta y comentario `TODO` en el código
(`apps/api/src/{calendar,backtesting,paper-trading,alerts}`) explicando
exactamente el contrato de API y el modelo de datos ya definido en
`prisma/schema.prisma`, para que implementarlos no requiera rediseñar nada.

## 9. Infraestructura y resiliencia

- **Base de datos = SQLite, un archivo local** (`apps/api/prisma/dev.db`,
  creado con `pnpm db:push`). Sin Docker, sin Postgres, sin cuenta en la
  nube -- se cambió de Postgres a SQLite precisamente porque la app es de
  un solo usuario (sección 10) y no había motivo real para pedir
  infraestructura externa. `PrismaService` no conecta activamente al
  iniciar -- las rutas que no tocan base de datos (empresas, scores,
  scanner, IA, noticias) funcionan igual aunque el archivo `.db` no exista
  todavía; solo paper trading (y auth, si se reactivase) la necesitan.
- **Caché en memoria** (`CacheService`) con la misma interfaz que tendría una
  implementación Redis -- cambiar a Redis en producción es sustituir un archivo,
  no rediseñar los servicios que lo consumen.
- **Providers de datos abstraídos** (`MarketDataProvider`): `FinnhubProvider` y
  `MockMarketDataProvider` implementan la misma interfaz; el mock se activa
  automáticamente si no hay `FINNHUB_API_KEY`, incluso campo a campo (si Finnhub
  falla o no cubre un dato en el plan gratuito, se rellena con mock en vez de
  romper la pantalla).
- **`FinnhubThrottle`** (`common/finnhub`): cola compartida que serializa
  *todas* las llamadas a Finnhub -- de `market-data` y de `news` por igual,
  porque comparten el mismo límite de 60 req/min por API key -- a ~1
  petición/segundo. Sin esto, una pantalla que dispara muchas peticiones a la
  vez (p. ej. `GET /companies` recorriendo las ~145 empresas) recibe `429` y
  cae a datos mock aunque la key sea válida. Con la cola, tarda más (la
  primera carga fría del universo completo puede llevar varios minutos) pero
  siempre devuelve datos reales cuando hay key -- y todo queda cacheado 6h.
- **Límites reales del plan gratuito de Finnhub**: `stock/metric` no expone
  Free Cash Flow, deuda total ni caja en cifra absoluta (solo ratios o
  valores por acción) -- `freeCashFlow`, `totalDebt` y `netDebtToEbitda`
  quedan `undefined` (mostrados como "n/d") en vez de inventarse a partir de
  un campo que no significa lo mismo. `cash` sí se deriva de un cálculo
  legítimo (caja por acción × acciones en circulación, ambos datos reales).
  Además, el endpoint de velas históricas (`/stock/candle`) ya **no** está
  disponible en el plan gratuito de Finnhub para ningún ticker (devuelve
  403) -- por eso existe `TwelveDataPriceProvider`.
- **`TwelveDataPriceProvider`** (`market-data/providers/twelvedata-price-provider.ts`):
  proveedor independiente solo para el histórico de precios del gráfico,
  vía [Twelve Data](https://twelvedata.com/pricing) (gratis, 800
  peticiones/día, sin tarjeta). Se probó Stooq primero pero ahora exige un
  desafío JavaScript anti-bot que lo hace inviable desde un backend. Si
  `TWELVEDATA_API_KEY` no está configurada, `MarketDataService` cae al
  histórico del proveedor principal (mock si no hay `FINNHUB_API_KEY`, o el
  de Finnhub -- que a día de hoy siempre cae a mock por el punto anterior).
- **`YahooIndicesProvider`** (`market-data/providers/yahoo-indices-provider.ts`):
  cotización de los índices principales (S&P 500, Nasdaq 100, Dow Jones,
  Euro Stoxx 50) vía el endpoint de gráficos no oficial de Yahoo Finance --
  sin API key, sin cuenta, sin coste (el mismo endpoint detrás de la
  librería `yfinance`). No necesita ninguna variable de entorno: se intenta
  siempre primero, y solo si falla (endpoint no documentado, podría cambiar
  o bloquearse sin aviso) `MarketDataService` cae a los índices mock del
  proveedor principal.

## 10. Autenticación

**Deshabilitada en la app móvil a propósito**: StockIQ está pensada para un
único usuario (tú), así que no tiene sentido pedir login. `app/index.tsx`
redirige directo a `(tabs)` sin pasar por ninguna pantalla de acceso, y
ninguna pantalla llama a `/auth/*`.

El backend conserva el módulo `auth` (JWT propio vía `@nestjs/jwt` +
`passport-jwt`, contraseñas con bcrypt) por si en el futuro hace falta
sincronizar entre varios dispositivos o compartir la app -- no se elimina
porque no molesta (no bloquea el arranque) y activarlo sería añadir de nuevo
las pantallas de login que ya existían, no rediseñar el backend. `User` ya
no tiene relación con `PaperPortfolio` en el esquema -- las carteras de
paper trading no pertenecen a nadie en particular, son "las tuyas".

## 11. Diseño de la app móvil

- **Expo Router** (navegación file-based) + tabs inferiores (Inicio, Scanner,
  Cartera, Chat IA, Ajustes) pensadas para uso a una mano.
- **NativeWind** (Tailwind para RN) con paleta y tokens propios inspirados en
  Apple/Linear/Bloomberg/TradingView, con modo claro/oscuro real
  (`tailwind.config.js` + `useColorScheme` de NativeWind).
- **TanStack Query** para todo el estado de servidor (caché, refetch). Sin
  Zustand ni store de sesión -- no hay login (ver sección 10).
- **react-native-wagmi-charts** para el gráfico de precio interactivo (gesto de
  crosshair).
- Componentes de diseño reutilizables en `apps/mobile/src/components`
  (`Card`, `ScoreBadge`, `SectionHeader`, `ComingSoon`, `PriceChart`...).
- **Expo SDK 54** (no la última disponible en npm a propósito): la app de
  **Expo Go** publicada en Play Store va detrás de la última SDK publicada,
  y solo carga proyectos de la SDK que ella misma soporta -- comprueba la
  versión que indica tu Expo Go (perfil -> "SDK Version") antes de subir de
  SDK. Dos cosas rompieron probando en dispositivo real y quedan resueltas,
  pero pueden reaparecer si se toca esto sin cuidado:
  - `react-native-reanimated` v4 requiere `react-native-worklets` como
    **peer dependency** explícita -- pnpm no la instala sola al ser peer, y
    sin ella el babel plugin (`react-native-worklets/plugin`, que
    `babel-preset-expo` intenta cargar automáticamente al detectar
    Reanimated) falla, y en tiempo de ejecución revienta con
    `Exception in HostFunction: TurboModule method "installTurboModule"...`.
    Están fijadas versiones exactas (no rangos `^`/`~`) para
    `react-native-reanimated` y `react-native-worklets` en
    `apps/mobile/package.json` porque Expo Go trae compilado un binario
    nativo concreto por SDK -- una versión JS más nueva que ese binario
    (aunque semánticamente "compatible") puede desincronizar la firma de
    los TurboModules y provocar el mismo crash.
  - Tras cualquier cambio de SDK, ejecuta `npx expo install --fix` dentro de
    `apps/mobile` para realinear todas las versiones a la vez, en vez de
    tocar `package.json` a mano.

## 12. Roadmap (fase 2 y siguientes)

### Resuelto (2026-07-11): Home ya no bloquea en frío

`GET /home` calculaba el score de **las ~145 empresas del universo entero**
de forma síncrona solo para poder mostrar el top 10, lo que en frío (Finnhub
real + `FinnhubThrottle` ~1 petición/seg) tardaba varios minutos y dejaba el
spinner del móvil colgado. Arreglado con tres piezas:

- `CacheService.wrap` ahora deduplica llamadas concurrentes a la misma key
  (single-flight) en vez de disparar el cálculo varias veces en paralelo.
- Nuevo `CacheService.getOrTrigger(key, ttl, fn)`: devuelve el valor cacheado
  si existe, si no dispara `fn` en segundo plano (compartiendo el mismo
  in-flight que `wrap`) y devuelve `undefined` al momento -- nunca bloquea.
- `ScoringService` implementa `OnModuleInit` y calienta `scores:universe` nada
  más arrancar el servidor; `getUniverseSnapshotIfReady()` (usado por
  `HomeService`) usa `getOrTrigger` y nunca bloquea, mientras que
  `getUniverseSnapshot()` (usado por el scanner) sigue bloqueando a propósito
  (acción explícita del usuario, se espera una respuesta real).
- `HomeResponse` añade `topAiScoresReady: boolean`; el móvil
  (`useHome` en `src/api/hooks.ts`) hace polling cada 15s mientras sea
  `false` y la pantalla de Inicio muestra "Calculando puntuaciones..." en vez
  de quedarse colgada.

Verificado en vivo: `GET /home` responde en ~2.5s justo tras arrancar (antes
no respondía ni en 30s), con `topAiScoresReady: false` y `topAiScores: []`;
sigue respondiendo rápido (~0.3s) mientras el cálculo de fondo continúa, sin
duplicar llamadas a Finnhub.

### Implementado (2026-07-11): Paper Trading

Primer módulo de fase 2 (`apps/api/src/paper-trading`). Varias carteras,
comprar/vender (validado contra el universo permitido y contra caja/posición
disponible), historial de órdenes, resetear y eliminar. Órdenes ejecutan al
precio actual de `MarketDataService` (real o mock, lo que use el resto de la
app). Las posiciones se derivan del historial de órdenes (método de coste
medio) en vez de guardarse por duplicado, para tener una única fuente de
verdad. Esto fue lo que motivó el cambio de Postgres a SQLite (sección 9):
paper trading necesita persistencia real (sobrevivir a reinicios), y pedir
Docker/Neon solo para esto no encajaba con una app de un usuario. Pantallas
móviles: `app/(tabs)/watchlist.tsx` (lista de carteras) y
`app/portfolio/[id].tsx` (detalle, formulario de compra/venta, posiciones,
historial). Verificado en vivo end-to-end, incluida persistencia tras
reiniciar el servidor.

**Mejoras tras feedback del usuario** (mismo día): el formulario de
compra/venta pedía el ticker de memoria, poco realista si no te sabes las
siglas de las ~145 empresas. Se añadió:
- `GET /companies/search?q=` (`companies.controller.ts`, declarado antes de
  `:ticker` para que la ruta no lo capture como parámetro): busca sobre la
  lista estática del universo, sin llamar a `MarketDataService` -- instantáneo
  incluso en frío. Ranking: ticker exacto > ticker empieza por la búsqueda >
  alguna palabra del nombre empieza por la búsqueda > coincidencia parcial.
  Escribir "L" ya muestra Eli Lilly (LLY) entre los primeros resultados.
- El formulario móvil ahora es un autocompletado: al escribir aparecen
  sugerencias (ticker + nombre) para tocar y seleccionar, en vez de un campo
  de texto libre.
- `PlaceOrderDto`/`PaperTradingService.placeOrder` aceptan `quantity` **o**
  `amount` (importe en dólares, nunca ambos a la vez -- validado con un 400
  si no es así). Un importe se resuelve a una cantidad de acciones
  (posiblemente fraccionaria, redondeada a 6 decimales) al precio actual:
  "quiero comprar $2500 de Apple" ya no requiere calcular a mano cuántas
  acciones son.

1. **Calendario**: resultados/dividendos/splits reales desde el proveedor de
   datos + tabla de eventos curados manualmente.
2. **Backtesting**: motor que recalcula `scoring-engine` sobre fundamentales
   históricos, con métricas (CAGR, Sharpe, Sortino, drawdown, win rate, profit
   factor) y avisos de sobreajuste (pocas operaciones, universo demasiado
   concentrado, rango de fechas demasiado corto).
3. **Alertas**: evaluación periódica (cron/BullMQ) de `Alert.conditionJson`
   contra scores/precios frescos + notificaciones push (Expo Notifications).
4. **Chat IA**: nuevo agente conversacional que reutiliza el mismo patrón de
   agentes (`Agent<Input, Output>`) pero con memoria de conversación y acceso a
   herramientas para consultar `market-data`/`scoring`/`news` bajo demanda.
5. **Agentes Técnico, de Resultados y Macro**: sustituir los stubs por
   implementaciones reales siguiendo el patrón de `fundamental.agent.ts`.
6. **Redis + BullMQ**: sustituir el `CacheService` en memoria por Redis y añadir
   un job nocturno que precalcule scores/fundamentales de todo el universo, en
   vez de calentar la caché bajo demanda.
7. **Scores comparados contra medianas sectoriales** en vez de rangos fijos.
8. **Despliegue**: API en un contenedor con volumen persistente para el
   archivo SQLite (Railway/Fly.io/Render), build de Android con EAS. Si
   algún día hace falta multi-dispositivo de verdad, ahí sí tendría sentido
   volver a Postgres gestionado (Neon/Supabase) y reactivar auth.
