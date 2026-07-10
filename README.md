# StockIQ

App de análisis de acciones con IA, pensada para un único usuario (sin login).
Analiza ~130 grandes empresas cotizadas (S&P 100, Nasdaq-100, Dow Jones y
grandes compañías europeas) -- nunca ETFs, cripto, forex, opciones ni penny
stocks.

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
```

## Requisitos

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Un móvil Android con la app **Expo Go** instalada (Play Store), en la misma
  red WiFi que tu PC -- o el emulador de Android Studio

No hace falta Docker ni base de datos: la app está pensada para un único
usuario, sin login ni registro -- todo funciona sin cuenta.

## Puesta en marcha

```bash
pnpm install
cp .env.example .env
```

**La app funciona de punta a punta sin ninguna API key** -- usa datos e informes
de ejemplo (mock), claramente etiquetados en la interfaz. Para datos e IA reales:

1. **Datos de mercado (gratis)**: crea una cuenta en https://finnhub.io/register
   y copia tu API key a `FINNHUB_API_KEY` en `.env`.
2. **Gráfico de precio (gratis)**: el plan gratuito de Finnhub ya no incluye
   histórico de velas. Crea una cuenta gratis (sin tarjeta, ~10s) en
   https://twelvedata.com/pricing y copia tu key a `TWELVEDATA_API_KEY` en
   `.env` para que el gráfico deje de ser de ejemplo.
3. **IA (gratis)**: crea una key gratuita (sin tarjeta) en
   [Google AI Studio](https://ai.google.dev) -> "Get API key", y cópiala a
   `GEMINI_API_KEY` en `.env`. (Claude/Anthropic también funciona como
   alternativa de pago vía `ANTHROPIC_API_KEY`, si algún día lo prefieres.)

### Arrancar el backend

```bash
pnpm dev:api
```

Corre en `http://localhost:3000`. Documentación interactiva (Swagger) en
`http://localhost:3000/docs`.

### Arrancar la app móvil

```bash
pnpm dev:mobile
```

Esto abre el bundler de Expo con un código QR.

- **En tu móvil Android**: abre la app **Expo Go**, escanea el QR (debes estar
  en la misma red WiFi que el PC). También puedes conectar el móvil por USB y
  usar `adb reverse tcp:8081 tcp:8081` si prefieres no depender del WiFi.
- **Importante**: la app móvil necesita saber dónde está tu backend. Por
  defecto usa `http://localhost:3000`, que **no funciona desde un móvil físico**
  (localhost ahí es el propio teléfono). Averigua la IP local de tu PC con
  `ipconfig` (busca "Dirección IPv4", algo como `192.168.1.42`) y arranca así:

  ```bash
  # PowerShell
  $env:EXPO_PUBLIC_API_URL = "http://192.168.1.42:3000"
  pnpm dev:mobile
  ```

  (En el emulador de Android Studio, `http://localhost:3000` sí funciona tal cual
  gracias al reenvío de puertos del propio emulador.)

## Scripts útiles

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Backend + app móvil a la vez |
| `pnpm dev:api` / `pnpm dev:mobile` | Solo uno de los dos |
| `pnpm test` | Tests de todos los paquetes (scoring-engine, etc.) |
| `pnpm build` | Compila packages + backend |
| `pnpm db:up` / `pnpm db:down` | Postgres + Redis locales (requiere Docker) |

## Qué está implementado

Home, perfil de empresa completo (fundamentales, gráfico, scores explicables,
informe IA, competidores), scanner con filtros, y noticias con deduplicación y
sentimiento -- todo funcional de extremo a extremo. Backtesting, paper trading,
alertas, calendario y chat IA están **scaffolded** (esquema de datos y
contrato de API ya definidos, pantalla "Próximamente" en la app) para
implementarse en la siguiente fase sin rehacer nada. Detalle completo en
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md#8-estado-de-cada-subsistema-pedido).
