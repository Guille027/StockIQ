# StockIQ

Plataforma educativa de inversión, pensada para un único usuario (sin login).
**Duolingo + TradingView + paper trading**: lecciones interactivas por niveles,
un simulador que exige un plan antes de cada operación, un diario del inversor
y una IA entrenadora que analiza tu proceso — nunca tus resultados.

**StockIQ no da señales de compra/venta.** Su objetivo es que aprendas a
analizar empresas y a tomar tus propias decisiones. Las herramientas de
análisis (perfil de empresa con 9 scores explicables, screener, noticias)
existen para practicar, no para recomendarte nada.

Universo: ~145 grandes empresas cotizadas (S&P 100, Nasdaq-100, Dow Jones y
grandes europeas) — nunca ETFs, cripto, forex, opciones ni penny stocks.

Ver [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) para el diseño completo.

## Estructura

```
apps/
  mobile/   App Android/iOS (Expo + React Native)
  api/      Backend (NestJS)
packages/
  shared-types/    Tipos compartidos
  universe/        Universo de empresas permitidas
  scoring-engine/  Motor de puntuación (con tests)
  curriculum/      Lecciones (Niveles 0-6, español, estáticas)
```

## Requisitos

- Node.js 22.13+ (requerido por pnpm 11.11.0, que usa el módulo interno `node:sqlite`)
- pnpm (`npm install -g pnpm`)
- Un móvil Android con la app **Expo Go** instalada (Play Store), en la misma
  red WiFi que tu PC — o el emulador de Android Studio

El progreso (XP, lecciones, diario, paper trading) se guarda en una base de
datos Postgres gratuita (Neon) — ver "Puesta en marcha". La API también puede
desplegarse gratis 24/7 sin depender de tu PC: ver
[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Puesta en marcha

```bash
pnpm install
cp .env.example .env
```

**La app funciona de punta a punta sin ninguna API key** — usa datos e
informes de ejemplo (mock), claramente etiquetados. Para datos e IA reales:

1. **Datos de mercado (gratis)**: https://finnhub.io/register →
   `FINNHUB_API_KEY` en `.env`.
2. **Gráfico de precio (gratis)**: https://twelvedata.com/pricing →
   `TWELVEDATA_API_KEY`.
3. **IA entrenadora (gratis)**: [Google AI Studio](https://ai.google.dev) →
   "Get API key" → `GEMINI_API_KEY`. Sin ella, el coach y el resumen diario
   muestran contenido de ejemplo etiquetado. (Claude/Anthropic funciona como
   alternativa de pago vía `ANTHROPIC_API_KEY`.)

4. **Base de datos (gratis)**: crea un proyecto en
   [neon.tech](https://neon.tech) (sin tarjeta) y copia su "Connection
   string" a `DATABASE_URL` en `.env`.

**Crea las tablas una vez** (progreso, XP, diario, paper trading):

```bash
pnpm db:push
```

### Arrancar el backend

```bash
pnpm dev:api
```

Corre en `http://localhost:3000`. Swagger en `http://localhost:3000/docs`.

### Arrancar la app móvil

```bash
pnpm dev:mobile
```

- **En tu móvil Android**: abre **Expo Go** y escanea el QR (misma WiFi que el
  PC). Si el QR falla: "Entrar URL manualmente" → `exp://<IP-de-tu-PC>:8081`.
- **Si Expo Go dice "incompatible SDK version"**: comprueba en Expo Go →
  perfil → "SDK Version" que coincide con `"expo"` de
  `apps/mobile/package.json` (actualmente SDK 54). Ver la nota sobre
  Reanimated/worklets en `docs/ARCHITECTURE.md` antes de tocar versiones.
- **Importante**: desde un móvil físico, `localhost` no funciona. Si estás
  usando el backend local (`pnpm dev:api`), averigua la IP de tu PC con
  `ipconfig` y arranca así:

  ```bash
  # PowerShell
  $env:EXPO_PUBLIC_API_URL = "http://192.168.1.42:3000"
  pnpm dev:mobile
  ```

  Si ya tienes la API desplegada ([`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)),
  no hace falta ninguna variable: `apps/mobile/app.json` ya apunta a la URL
  pública por defecto, y la app funciona desde cualquier red.

## Scripts útiles

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Backend + app móvil a la vez |
| `pnpm dev:api` / `pnpm dev:mobile` | Solo uno de los dos |
| `pnpm test` | Tests de todos los paquetes |
| `pnpm build` | Compila packages + backend |
| `pnpm db:push` | Crea/actualiza las tablas en Postgres (Neon) |

## Qué está implementado

- **Aprender**: Niveles 0 ("¿Qué es invertir?", 5 lecciones) y 1 ("El lenguaje
  del mercado", 7 lecciones) completos, con quizzes corregidos en servidor,
  datos reales dentro de las lecciones y XP. Niveles 2-6 definidos y
  bloqueados.
- **Práctica**: paper trading con plan pre-operación obligatorio (por qué,
  expectativa, riesgo, salida, stop, % de cartera) + estado emocional; P&L
  realizado en cada venta.
- **Diario**: entrada automática por operación, reflexiones con errores y
  aprendizajes, notas libres.
- **IA entrenadora**: feedback por operación cerrada y revisión de periodo,
  con Gemini (gratis) y fallback de ejemplo sin key.
- **Perfil**: XP, 10 rangos, rachas diarias, actividad.
- **Explorar**: índices reales, búsqueda, screener, noticias con sentimiento,
  perfil de empresa completo con 9 scores explicables e informe IA — todo
  reencuadrado como herramientas de práctica, sin recomendaciones.

Fase 2 (misiones, simulaciones históricas, estadísticas avanzadas, radar de
habilidades, Niveles 2-6): ver el roadmap en
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md#7-roadmap).
