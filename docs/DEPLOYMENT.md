# Desplegar StockIQ 24/7 (gratis)

Esta guía deja la API corriendo permanentemente en internet, sin depender de
que tu PC esté encendido. Usa dos servicios gratuitos, sin tarjeta:

- **[Neon](https://neon.tech)** -- Postgres gestionado (sustituye al archivo
  SQLite local).
- **[Render](https://render.com)** -- hosting del backend NestJS.

**Importante sobre el plan gratuito de Render**: si nadie usa la API durante
~15 minutos, el servidor "se duerme". La primera petición después de eso
tarda 30-60s en responder mientras despierta; el resto del tiempo va normal.
Es la contrapartida de que sea gratis y no requiera tarjeta. Si algún día
quieres que esté siempre caliente sin esa espera, basta con cambiar el plan
de Render de "Free" a "Starter" (~$7/mes) -- nada más en esta guía cambia.

## 1. Sube el repo a GitHub

Render despliega conectándose a un repositorio de GitHub.

1. Ve a [github.com/new](https://github.com/new), crea un repositorio vacío
   (sin README, sin .gitignore -- ya los tienes). Puede ser privado.
2. Copia la URL que te da GitHub (algo como
   `https://github.com/tu-usuario/stockiq.git`).
3. En tu terminal, dentro de la carpeta del proyecto:

   ```bash
   git remote add origin https://github.com/tu-usuario/stockiq.git
   git push -u origin master
   ```

## 2. Crea la base de datos en Neon

1. Regístrate en [neon.tech](https://neon.tech) (con GitHub o email, sin
   tarjeta).
2. Crea un proyecto nuevo (cualquier nombre y región te vale).
3. En el panel del proyecto, copia el **Connection string** -- el que incluye
   `?sslmode=require` al final. Guárdalo, lo necesitas en el paso siguiente
   y también para tu `.env` local.

## 3. Despliega en Render

1. Regístrate en [render.com](https://render.com) (con GitHub, sin tarjeta
   para el plan gratuito).
2. Pulsa **New +** -> **Blueprint**.
3. Conecta tu repositorio de GitHub. Render detecta automáticamente el
   archivo `render.yaml` de la raíz del proyecto y propone crear el servicio
   `stockiq-api` ya configurado (build, arranque, variables).
4. Antes de confirmar, rellena las variables marcadas como "secretas" (las
   que en `render.yaml` no traen un valor):
   - `DATABASE_URL` -- pega el connection string de Neon del paso 2.
   - `FINNHUB_API_KEY`, `TWELVEDATA_API_KEY`, `GEMINI_API_KEY` -- las mismas
     que ya tengas en tu `.env` local (ver `README.md` para dónde conseguirlas
     si aún no las tienes).
   - `JWT_SECRET` se genera solo, no hace falta tocarlo.
5. Pulsa **Apply** / **Create**. El primer build tarda unos minutos (instala
   dependencias, compila, y crea las tablas en Neon con `prisma db push`).
6. Cuando termine, Render te da una URL pública (normalmente
   `https://stockiq-api-XXXX.onrender.com` -- Render añade un sufijo si el
   nombre exacto ya está cogido, como pasó al desplegar esta instancia).
   Compruébala abriendo `/health` en el navegador -- si responde
   `{"status":"ok",...}`, está viva.

## 4. Apunta la app móvil a la API desplegada

`apps/mobile/app.json` (`extra.apiBaseUrl`) ya apunta a la URL real de esta
instancia desplegada. Si alguna vez recreas el servicio en Render y te da una
URL distinta, actualiza `apps/mobile/app.json`:

```json
"extra": {
  "apiBaseUrl": "https://TU-URL-REAL.onrender.com"
}
```

A partir de ahora, cuando abras la app con `pnpm dev:mobile` **sin** definir
`EXPO_PUBLIC_API_URL`, usará automáticamente la API desplegada -- funciona
desde cualquier red, con tu PC apagado. Sigue pudiendo apuntar a tu backend
local cuando estés desarrollando, definiendo `EXPO_PUBLIC_API_URL` como
siempre (ver `README.md`).

## 5. Desarrollo local a partir de ahora

Tu `.env` local necesita el mismo `DATABASE_URL` de Neon (la misma base de
datos sirve para desarrollo y producción -- es una app de un solo usuario, no
hay motivo para mantener dos). Actualiza tu `.env`:

```bash
DATABASE_URL="postgresql://...el-mismo-connection-string-de-neon...?sslmode=require"
```

Y ejecuta `pnpm db:push` una vez si aún no lo has hecho tras cambiar la URL.

## Actualizar la API desplegada

Cada vez que hagas `git push` a la rama conectada, Render vuelve a desplegar
solo. No hace falta ningún paso manual adicional.
