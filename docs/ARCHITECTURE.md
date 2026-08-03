# StockIQ — Arquitectura

StockIQ es una **plataforma educativa de inversión**: enseña a cualquier persona,
incluso sin conocimientos previos, a aprender a invertir paso a paso hasta ser
capaz de analizar empresas y tomar sus propias decisiones. "Duolingo +
TradingView + paper trading".

**El objetivo NO es dar señales de compra. El objetivo es crear inversores que
sepan pensar por sí mismos.** Toda decisión de diseño se somete a esa regla: si
una característica ayuda a aprender a pensar como inversor, entra; si solo
sirve para decir qué comprar o vender, se elimina (así desapareció el antiguo
top-10 "Mejor puntuación IA" del Home).

## 1. Los cinco pilares del producto

1. **Roadmap de aprendizaje por niveles** (Nivel 0-6): lecciones cortas,
   visuales e interactivas con mini-quizzes. Contenido estático curado en
   español, versionado en el repo (`packages/curriculum`) — nunca generado por
   IA. Niveles 0 y 1 completos (12 lecciones); 2-6 definidos y bloqueados
   ("Próximamente").
2. **Paper trading inteligente**: ninguna orden se ejecuta sin un plan previo
   (por qué compras, qué esperas, qué riesgo ves, dónde sales, % de cartera) +
   estado emocional de un tap (calma/FOMO/miedo/euforia/duda/aburrimiento/
   venganza). Todo se guarda.
3. **Diario del inversor**: cada operación genera automáticamente una entrada
   con el plan, la emoción y el resultado; el usuario añade después su
   reflexión, errores y aprendizajes (+XP).
4. **IA entrenadora** (coach): tras cada venta, Gemini analiza el PROCESO
   contra el propio plan del usuario — nunca juzga, nunca recomienda, termina
   siempre con una pregunta socrática. Cache permanente: máx. 1 llamada por
   operación + 1 revisión de periodo al día.
5. **XP y rangos**: la experiencia se gana SOLO por aprender (lecciones,
   planes, reflexiones, disciplina) — estructuralmente imposible ganar XP por
   beneficios. 10 rangos: Curioso → Mentor. Rachas diarias.

Terminología: "Nivel 0-6" = currículo; "Rango" = progresión XP (dos ejes
distintos a propósito).

## 2. Arquitectura del monorepo

```
apps/
  mobile/   Expo + React Native (Android-first)
  api/      NestJS (Fastify) -- toda la lógica de servidor
packages/
  shared-types/    Contratos TS compartidos
  universe/        Universo de inversión (~145 large caps, fuente de verdad)
  scoring-engine/  Motor de puntuación puro y testeado
  curriculum/      Lecciones estáticas en español (Niveles 0-6)
```

`packages/curriculum` lo importa **solo la API**: las claves de respuesta de
los quizzes nunca viajan en el bundle móvil; la corrección es server-side
(`POST /learning/lessons/:id/complete`).

## 3. Módulos del backend (`apps/api/src`)

| Módulo | Qué hace |
|---|---|
| `profile` | `XpService.award(kind, refId, dedupeKey)` — punto único e **idempotente** de XP (ledger `XpEvent` con `dedupeKey` único; re-otorgar es no-op). Rachas diarias. `GET /profile`. |
| `learning` | `GET /learning/roadmap` (niveles + progreso + bloqueos), `GET /learning/lessons/:id` (bloques `liveStat` enriquecidos con datos reales cacheados; si el provider falla la lección se sirve igual), `POST .../complete` (corrección + XP). |
| `journal` | Diario: listado/detalle (entrada + TradePlan + CoachFeedback), `PATCH /journal/:id/reflection` (+XP una vez), notas libres. |
| `coach` | `runCoachAgent` (mismo patrón `Agent(client, input)` que los agentes de informes), mock fallback sin API key, cache permanente `CoachFeedback (scope, refId)`. `POST/GET /coach/trades/:orderId` (solo ventas), `POST /coach/review` (máx 1/día). |
| `paper-trading` | `placeOrder` exige `plan` + `emotion` (400 sin ellos); crea `TradePlan` + `JournalEntry`; en ventas calcula `realizedPnl/Pct` contra coste medio; devuelve `{ portfolio, orderId, xpAwarded }`. Posiciones derivadas del historial (coste medio), nunca duplicadas. |
| `market-data` | Providers: Finnhub (fundamentales), Twelve Data (histórico), Yahoo (índices), mock automático sin keys. `FinnhubThrottle` global ~1 req/s. |
| `scoring` | 9 scores explicables 0-100 (`packages/scoring-engine`, puro). Reencuadrado como herramienta de análisis/práctica. |
| `home` | Visión de mercado para Explorar: índices, noticias, resumen diario IA **educativo** (prohibido presentar empresas como oportunidades). Sin top-scores. Patrón no-bloqueante `CacheService.getOrTrigger` intacto. |
| `scanner`, `companies`, `news`, `ai` | Herramientas de análisis, sin cambios de contrato (el informe IA da +10 XP/día por "analizar una empresa", cap 3/día). |
| `calendar`, `backtesting`, `alerts` | Scaffold 501 (fase 3). |
| `auth` | Implementado pero sin usar — app de un solo usuario, sin login. |

### Reglas de XP (server-side, `XP_RULES` en shared-types)

| Acción | XP | Idempotencia |
|---|---|---|
| Lección (1ª vez) | 50 | `lesson:<id>` |
| Quiz perfecto en 1ª completación | +25 | `lessonperfect:<id>` |
| Repaso de lección | 10 | `review:<id>:<fecha>` |
| Plan pre-operación | 20 | `plan:<orderId>` |
| Feedback del coach | 30 | `coach:<orderId>` |
| Reflexión | 25 | `reflection:<entryId>` |
| Analizar empresa (informe IA) | 10 | `analysis:<ticker>:<fecha>` (cap 3/día) |
| Racha diaria | 15 | `streak:<fecha>` |

Rangos (`RANK_THRESHOLDS`): 0, 100, 250, 500, 900, 1400, 2100, 3000, 4100,
5500 XP acumulados → Curioso, Novato, Aprendiz, Observador, Estudiante,
Analista Jr., Analista, Estratega, Gestor, Mentor.

## 4. Modelo de datos (Prisma/Postgres)

`UserProfile` (singleton "default": xpTotal, rank, rachas, statsJson/skillsJson
reservados para fase 2) · `LessonProgress` (lessonId único, intentos, mejor
score) · `XpEvent` (ledger append-only, dedupeKey único) · `TradePlan` (1:1
con PaperOrder: las 4 preguntas + stop + % + emoción) · `JournalEntry`
(contentJson: snapshot del plan, resultado, reflexión) · `CoachFeedback`
(cache permanente por (scope, refId), isMock). `PaperOrder` ganó
`realizedPnl/realizedPnlPct` (solo ventas). Todo lo no escalar sigue siendo
String JSON-encoded (convención heredada de cuando la base era SQLite, que no
admitía Json/array -- se mantuvo tras migrar a Postgres por consistencia y
para no reescribir los mappers de servicio existentes), parseado tras
mappers de servicio (JSON malformado → log + default, nunca 500).

## 5. App móvil

**Diseño**: la identidad visual viene de un proyecto de Claude Design
("StockIQ visual identity" — colores, tipografía, iconografía y un
prototipo interactivo de Aprender/Práctica/Perfil + el asistente de nueva
operación), importado y traducido a código vía la herramienta `DesignSync`.
Nace de un pivote de diseño explícito: la primera pasada (tema claro por
defecto, Plus Jakarta Sans/Manrope/IBM Plex Mono) resultaba genérica; esta
segunda pasada adopta **modo oscuro como tema principal** (más serio, menos
"app de juego" — el claro sigue existiendo como alternativa, sincronizado al
sistema salvo que el usuario elija otro en Ajustes), y un motivo visual
recurrente: la **vela japonesa**, reutilizada en el icono de la pestaña
Aprender, en los indicadores de progreso y en los medallones del camino de
lecciones.

**Tabs** (3, no 5 — Explorar se movió a pantalla de stack, Diario se fusionó
dentro de Práctica): **Aprender** (camino de nodos circulares en zigzag,
banner con degradado por nivel, racha + XP) · **Práctica** (sub-pestañas
Carteras/Diario — el diario del inversor vive aquí, no en su propia pestaña;
un icono de brújula en la cabecera lleva a Explorar) · **Perfil** (tarjeta de
rango con degradado y texto en tinta oscura, barra XP, racha, revisión del
mentor, actividad; iconos de Explorar y Ajustes en la cabecera).

**Stack**: `lesson/[id]` (player bloque a bloque: concepto → quiz con
explicación inmediata → pantalla de score + XP), `order/new` (wizard modal de
4 pasos: orden → plan → emoción → confirmar; aviso suave si FOMO/euforia/
venganza; aviso de concentración si >20% de cartera), `journal/[id]` (detalle
+ reflexión + feedback del coach), `explore` (índices, búsqueda, screener,
noticias — movida desde tab), `company/[ticker]` y `portfolio/[id]` (con
`Disclaimer`), `scanner`, `settings`. Chat IA eliminado (el coach lo
sustituye contextualmente).

**Paleta** (tailwind.config.js, mismo patrón `bg-X dark:bg-XDark` de siempre
-- `X` = valor en modo claro, `XDark` = valor en modo oscuro, aunque el
oscuro sea ahora el tema "principal" en cuanto a diseño): índigo primario
#6a56e0 / #8b7cf6, ámbar (`accent`) #b9822f / #e8c77a reservado
*exclusivamente* a XP/racha/logros, teal apagado para positivo #3f7d64 /
#6fae94, terracota para negativo #a85a3f / #c9846a, fondo tipo papel claro
#f7f5f1 / oscuro #101019. Esquinas de "ficha" (8/14/20px) en vez de burbuja.

**Tipografía**, tres trabajos distintos: **Space Grotesk** (títulos,
`font-display`/`font-display-semibold`), **Inter** (cuerpo, parcheado como
fuente por defecto de todo `<Text>` vía `src/theme/text-defaults.ts`),
**JetBrains Mono** (reservada a cifras: precios, XP, %, scores —
`font-mono`/`font-mono-bold`). Fuentes cargadas con `@expo-google-fonts/*`
en `src/theme/fonts.ts`.

**Componentes**: `CandleExample`/`LineExample` (gráficos didácticos con
react-native-svg, datos ficticios de las lecciones), `CoachFeedbackCard`,
`Disclaimer`, `XpBar` (Reanimated, se rellena con `withTiming` + contador en
paralelo; variante `onBrand` en tinta oscura para la tarjeta de rango),
`StreakFlame` (llama con respiración continua, `withRepeat`, admite un
`color` de override para fundirse con el banner de Aprender),
`LessonPathNode` (medallón circular por estado — hecho/actual/disponible/
bloqueado — con degradado vía `expo-linear-gradient`, anillo de pulso
Reanimated en el nodo "actual"), `PressableScale` (spring de presión para
cualquier tarjeta tocable), `Confetti` (celebración en la pantalla de score,
solo Reanimated — **nunca Lottie**, que exige un módulo nativo incompatible
con Expo Go). Tab bar con fondo cuadrado redondeado por pestaña (color propio
por pestaña, no uno compartido) en vez de píldora. Onboarding de 4 pantallas
(`app/onboarding.tsx`, flag en `expo-secure-store`) que lleva directo a la
primera lección en el primer lanzamiento.

- **Expo SDK 54** (fijada — Expo Go de Play Store solo carga la SDK que
  soporta; comprueba en Expo Go → perfil → "SDK Version" antes de subir).
  `react-native-reanimated` 4.1.1 + `react-native-worklets` 0.5.1 con
  versiones EXACTAS (binario nativo de Expo Go por SDK; una JS más nueva
  desincroniza TurboModules y crashea). Tras cualquier cambio de SDK:
  `npx expo install --fix` dentro de `apps/mobile`. **Cero módulos nativos
  nuevos** — todo el pivote educativo usa JS puro + react-native-svg.

## 6. Infraestructura

- **Postgres gestionado (Neon, gratis, sin tarjeta)** — sustituyó al archivo
  SQLite local para que la API pueda desplegarse 24/7 sin perder datos en
  cada reinicio del contenedor (ver `docs/DEPLOYMENT.md`). Misma base de
  datos para desarrollo local y producción: es una app de un solo usuario,
  no hay motivo para mantener dos. `PrismaService` no conecta al arrancar:
  las rutas sin BD funcionan aunque `DATABASE_URL` falte o las tablas no
  existan todavía (`pnpm db:push` las crea).
- **Despliegue del backend en Render** (`render.yaml` en la raíz, plan
  gratuito): conecta el repo de GitHub, redespliega solo en cada `git push`.
  Contrapartida del plan gratuito: el servidor "duerme" tras ~15 min sin
  tráfico y la siguiente petición tarda 30-60s en despertar. La app móvil
  (`apps/mobile/app.json` → `extra.apiBaseUrl`) apunta por defecto a la URL
  desplegada, así que funciona desde cualquier red sin depender del PC del
  usuario.
- **CacheService** en memoria (interfaz Redis-compatible): `wrap` single-flight
  y `getOrTrigger` no-bloqueante (el warm-up de scores del universo sigue
  intacto).
- **FinnhubThrottle** global (~1 req/s, límite compartido de 60 req/min).
- **AiClient** (`AI_CLIENT`, exportado por `AiModule`): Gemini por defecto
  (gratis), Anthropic opt-in, mock etiquetado sin keys. El coach reutiliza
  esta abstracción tal cual.
- **Cuota Gemini**: bajo demanda + cache permanente ⇒ el gasto de IA bajó
  respecto a la versión anterior (informes 12h cache, coach 1/trade para
  siempre, revisión 1/día, resumen diario 6h cache).

## 7. Roadmap

### Hecho (2026-08-03): pivote educativo completo (M1-M6)

Esquema y tipos nuevos, ProfileModule/XpService idempotente, paquete
curriculum con Niveles 0-1 completos (12 lecciones), LearningModule,
reestructura móvil entera (tabs/paleta/player/perfil), paper trading
inteligente (wizard 4 pasos + diario + P&L realizado), coach IA con Gemini
real verificado, y este documento. Todo verificado por API en vivo; pendiente
el paseo completo en el móvil físico del usuario vía Expo Go.

### Hecho (2026-08-03): primer sistema visual + despliegue 24/7

Primer rediseño íntegro de la app móvil (paleta cálida clara, tipografía
Jakarta/Manrope/Plex Mono, gamificación animada con Reanimated, tab bar con
píldora, onboarding de 4 pantallas). Migración de SQLite a Postgres
gestionado (Neon) y despliegue del backend en Render (`render.yaml`,
`docs/DEPLOYMENT.md`) para que la API esté disponible 24/7 sin depender del
PC del usuario.

### Hecho (2026-08-04): segundo sistema visual (Claude Design) + reestructura de navegación

El primer rediseño seguía sintiéndose genérico. Se importó un proyecto de
Claude Design ("StockIQ visual identity" — colores, tipografía, iconografía,
prototipo interactivo) vía la herramienta `DesignSync` y se implementó por
completo -- ver sección 5 para la paleta/tipografía/componentes finales.
Cambios de fondo, no solo de piel: **modo oscuro pasa a ser el tema
principal** (el claro sigue disponible), motivo de vela japonesa como hilo
conductor visual, y **reestructura de navegación** de 5 a 3 pestañas
(Aprender/Práctica/Perfil) — Diario se fusiona como sub-pestaña dentro de
Práctica, Explorar se mueve a pantalla de stack con acceso desde Práctica y
Perfil. La pantalla Aprender pasa de una lista de tarjetas a un camino de
nodos circulares en zigzag al estilo Duolingo, con medallones de degradado
por nivel (3 acentos de color rotando: teal/índigo/oro) y anillo de pulso
Reanimated en la lección "actual".

### Fase 2 (el esquema ya lo anticipa)

1. **Misiones** (tabla `Mission` aditiva; `XpEvent.kind` y
   `JournalEntry.kind` son strings abiertos).
2. **Simulaciones de escenarios históricos** ("Año 2020, la bolsa cae 30%,
   ¿qué haces?") — `JournalEntry.kind="scenario"`, `CoachFeedback
   scope="scenario"`.
3. **Estadísticas inteligentes** (win rate, profit factor, expectancy,
   drawdown, cumplimiento del plan, impulsividad...) — semilla ya guardada:
   `realizedPnl` por venta + `TradePlan` + emociones. Slot `UserProfile.statsJson`.
4. **Radar de habilidades** (`UserProfile.skillsJson`): análisis técnico,
   gestión del riesgo, psicología, análisis fundamental, disciplina.
5. **Niveles 2-6 del currículo** (metas ya definidas en
   `packages/curriculum/src/levels/locked-levels.ts`); bloque `spotPattern`
   reservado en el modelo de lección para "señala el patrón en este gráfico".
6. Redis + BullMQ, medianas sectoriales, plan de pago en Render si el
   arranque en frío del plan gratuito llega a molestar.
