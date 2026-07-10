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
       AiService -> OrchestratorService -> Agentes especializados -> Claude
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

En vez de un único prompt gigante, el informe de cada empresa se construye con
agentes especializados que solo ven la porción de datos relevante y devuelven una
salida JSON estructurada (forzada vía tool-use de Claude, nunca texto libre):

- **Agente Fundamental** (`agents/fundamental.agent.ts`) -- solo fundamentales.
- **Agente de Noticias** (`agents/news.agent.ts`) -- solo titulares/resúmenes reales.
- **Agente de Riesgo** (`agents/risk.agent.ts`) -- apalancamiento, beta, scores de
  riesgo ya calculados.
- **Agente Técnico / Resultados / Macro** -- *stubs* (`agents/stub.agent.ts`) listos
  para implementarse en fase 2 con la misma interfaz `Agent<Input, Output>`.

Un **orquestador** (`orchestrator.service.ts`) ejecuta los tres agentes reales en
paralelo y hace una llamada final a Claude que combina sus salidas en un informe
único y coherente (`AiReport`): resumen de negocio, cómo gana dinero, situación
financiera, valoración, fortalezas, debilidades, riesgos, catalizadores,
resumen de noticias, resultados pasados y expectativas del mercado -- más un
`aiConfidenceScore`.

**Sin `ANTHROPIC_API_KEY` configurada**, el orquestador genera un informe de
ejemplo, construido a partir de los datos reales/mock disponibles y **siempre
etiquetado `isMock: true`**, tanto en el JSON como visualmente en la app (nunca se
presenta como análisis real). Los informes se cachean 12h para controlar coste y
latencia; el usuario puede forzar regeneración.

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
| Paper Trading | 🚧 scaffold -- esquema Prisma listo, `501` |
| Alertas | 🚧 scaffold -- esquema Prisma listo, `501` |
| Chat IA | 🚧 pantalla "Próximamente" en la app |
| Auth | ✅ funcional (JWT, requiere Postgres) |

Los módulos 🚧 tienen su controlador, carpeta y comentario `TODO` en el código
(`apps/api/src/{calendar,backtesting,paper-trading,alerts}`) explicando
exactamente el contrato de API y el modelo de datos ya definido en
`prisma/schema.prisma`, para que implementarlos no requiera rediseñar nada.

## 9. Infraestructura y resiliencia

- **Sin bloquear el arranque por infraestructura ausente**: `PrismaService` no
  conecta activamente al iniciar -- Postgres solo hace falta para las rutas que
  de verdad lo usan (auth, futuras watchlists/paper-trading/alertas). El resto de
  la app (empresas, scores, scanner, IA, noticias) funciona sin base de datos.
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

## 10. Autenticación

JWT propio (`@nestjs/jwt` + `passport-jwt`), contraseñas con bcrypt. Sin vendor
lock-in; migrar a OAuth (Google/Apple) en fase 2 es añadir una `Strategy` más,
no rehacer el módulo.

## 11. Diseño de la app móvil

- **Expo Router** (navegación file-based) + tabs inferiores (Inicio, Scanner,
  Cartera, Chat IA, Ajustes) pensadas para uso a una mano.
- **NativeWind** (Tailwind para RN) con paleta y tokens propios inspirados en
  Apple/Linear/Bloomberg/TradingView, con modo claro/oscuro real
  (`tailwind.config.js` + `useColorScheme` de NativeWind).
- **TanStack Query** para todo el estado de servidor (caché, refetch); **Zustand**
  solo para sesión/tema.
- **react-native-wagmi-charts** para el gráfico de precio interactivo (gesto de
  crosshair).
- Componentes de diseño reutilizables en `apps/mobile/src/components`
  (`Card`, `ScoreBadge`, `SectionHeader`, `ComingSoon`, `PriceChart`...).

## 12. Roadmap (fase 2 y siguientes)

1. **Calendario**: resultados/dividendos/splits reales desde el proveedor de
   datos + tabla de eventos curados manualmente.
2. **Backtesting**: motor que recalcula `scoring-engine` sobre fundamentales
   históricos, con métricas (CAGR, Sharpe, Sortino, drawdown, win rate, profit
   factor) y avisos de sobreajuste (pocas operaciones, universo demasiado
   concentrado, rango de fechas demasiado corto).
3. **Paper Trading**: órdenes simuladas contra `PaperPortfolio`/`PaperOrder`
   (esquema ya en `schema.prisma`), ejecutadas a precio de mercado del
   `MarketDataService`.
4. **Alertas**: evaluación periódica (cron/BullMQ) de `Alert.conditionJson`
   contra scores/precios frescos + notificaciones push (Expo Notifications).
5. **Chat IA**: nuevo agente conversacional que reutiliza el mismo patrón de
   agentes (`Agent<Input, Output>`) pero con memoria de conversación y acceso a
   herramientas para consultar `market-data`/`scoring`/`news` bajo demanda.
6. **Agentes Técnico, de Resultados y Macro**: sustituir los stubs por
   implementaciones reales siguiendo el patrón de `fundamental.agent.ts`.
7. **Redis + BullMQ**: sustituir el `CacheService` en memoria por Redis y añadir
   un job nocturno que precalcule scores/fundamentales de todo el universo, en
   vez de calentar la caché bajo demanda.
8. **Scores comparados contra medianas sectoriales** en vez de rangos fijos.
9. **Despliegue**: Postgres/Redis gestionados (Neon/Supabase + Upstash), API en
   un contenedor (Railway/Fly.io/Render), build de Android con EAS.
