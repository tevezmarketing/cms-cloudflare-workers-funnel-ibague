# Guía de desarrollo — EmDash · tevezmarketing.digital

> Fork operativo de EmDash adaptado para infraestructura CMS de **tevezmarketing.digital** — Ibagué, Colombia.  
> Este documento reemplaza la guía de contribución upstream. Si buscas contribuir al proyecto original, ve a [emdash-cms/emdash](https://github.com/emdash-cms/emdash).

---

## Antes de empezar

Este monorepo tiene **dos modos de operación**. Elige el que corresponde a tu situación:

| Modo | Cuándo usarlo | Costo |
|---|---|---|
| **Node.js + SQLite** | Desarrollo local, sitios propios, demos de clientes | Gratis |
| **Cloudflare Workers + D1** | Producción con clientes, escala global, plugins seguros | $5/mes cuenta CF |

**Si apenas estás empezando: usa el modo Node.js.** No necesitas cuenta Cloudflare ni tarjeta de crédito para tener el CMS completo funcionando.

---

## Requisitos

- **Node.js** 22 o superior
- **pnpm** 10 o superior — instalar con `corepack enable`
- **Git**

---

## Instalación inicial

```bash
git clone https://github.com/tevezmarketing/cms-cloudflare-workers-funnel-ibague.git
cd cms-cloudflare-workers-funnel-ibague
pnpm install
pnpm build
```

El `pnpm build` es obligatorio la primera vez. Compila todos los paquetes del monorepo antes de poder correr cualquier demo o template.

---

## Modo 1 — Node.js + SQLite (sin costo)

Este es el punto de partida. Corre el CMS completo localmente sin necesitar nada de Cloudflare.

```bash
pnpm --filter emdash-demo seed   # carga contenido de ejemplo
pnpm --filter emdash-demo dev    # inicia el servidor en localhost:4321
```

Abre el panel de administración en:

```
http://localhost:4321/_emdash/admin
```

En modo desarrollo la autenticación por passkey se salta automáticamente. Si aparece la pantalla de login, accede directamente con:

```
http://localhost:4321/_emdash/api/setup/dev-bypass?redirect=/_emdash/admin
```

### Para publicar en modo Node.js sin pagar Cloudflare

Puedes desplegar este modo en servidores con tier gratuito. Las opciones más simples:

- **Railway** — soporta Node.js, despliega desde GitHub automáticamente, tier gratuito disponible
- **Render** — similar a Railway, buena integración con monorepos
- **Fly.io** — más control, tier gratuito con límites generosos

En cualquiera de estos el SQLite se reemplaza por la base de datos del proveedor. Para producción real con clientes se recomienda migrar a Cloudflare D1 cuando el proyecto lo justifique.

---

## Modo 2 — Cloudflare Workers + D1 (producción)

Requiere cuenta Cloudflare Workers Paid ($5/mes). **Una sola cuenta sirve para múltiples sitios de clientes** — el costo no es por sitio.

```bash
# 1. Crear la base de datos D1
cd demos/cloudflare
pnpm db:create

# 2. Copiar el database_id que aparece en consola y pegarlo en wrangler.jsonc:
# "database_id": "TU_ID_AQUI"

# 3. Iniciar el servidor de desarrollo
pnpm dev
```

Panel de administración en `http://localhost:4321/_emdash/admin`.

Las migraciones de base de datos corren automáticamente al primer request — no hay paso manual.

### Para desplegar a producción

```bash
pnpm build
pnpm deploy
```

Cloudflare asigna automáticamente una URL `*.workers.dev`. Puedes conectar tu dominio propio desde el dashboard de Cloudflare sin costo adicional.

---

## Construir un sitio de cliente dentro del monorepo

La forma más rápida de empezar un sitio nuevo es usar los templates incluidos:

```bash
# Copiar el template que más se ajuste al proyecto
cp -r templates/blog demos/nombre-cliente
cp -r templates/marketing demos/nombre-cliente   # para landing pages / funnels
cp -r templates/portfolio demos/nombre-cliente   # para portafolios y agencias
```

Luego edita `demos/nombre-cliente/package.json` y cambia el campo `name` a algo único, por ejemplo `cliente-ibague-2026`.

```bash
pnpm install   # registra el nuevo workspace
pnpm --filter cliente-ibague-2026 dev
```

El sitio usa links `workspace:*` al código local — cualquier cambio en `packages/core` se refleja inmediatamente.

### Templates disponibles

| Template | Ideal para | Filter name |
|---|---|---|
| Blog | Sitios de contenido, SEO editorial | `@emdash-cms/template-blog` |
| Marketing | Landing pages, funnels de conversión | `@emdash-cms/template-marketing` |
| Portfolio | Agencias, freelancers, casos de estudio | `@emdash-cms/template-portfolio` |

Para correr un template directamente:

```bash
# Primera vez: configurar base de datos y seed
pnpm --filter @emdash-cms/template-marketing bootstrap

# Iniciar desarrollo
pnpm --filter @emdash-cms/template-marketing dev
```

Para empezar desde cero con una base de datos limpia:

```bash
rm templates/marketing/data.db
pnpm --filter @emdash-cms/template-marketing bootstrap
```

---

## Flujo de trabajo en desarrollo

### Watch mode — dos terminales

Cuando estás modificando el código base junto con un sitio cliente:

```bash
# Terminal 1 — recompila packages/core al guardar cambios
pnpm --filter emdash dev

# Terminal 2 — corre el sitio del cliente
pnpm --filter nombre-cliente dev
```

Los cambios en `packages/core/src/` se propagan automáticamente al sitio en desarrollo.

### Verificaciones antes de hacer commit

```bash
pnpm typecheck         # verificación TypeScript en todos los paquetes
pnpm typecheck:demos   # verificación TypeScript en demos y sites de clientes
pnpm --silent lint:quick   # linting rápido (< 1 segundo) — correr frecuentemente
pnpm --silent lint:json    # linting completo con tipos (~10s) — correr antes de commit
pnpm format            # formatear automáticamente con oxfmt
```

El typecheck y el lint deben pasar. No hacer commit con errores conocidos.

### Tests

```bash
pnpm test                           # todos los tests
pnpm --filter emdash test           # solo el core
pnpm --filter emdash test --watch   # modo watch para desarrollo activo
pnpm test:e2e                       # Playwright end-to-end (requiere demo corriendo)
```

Los tests usan SQLite en memoria — base de datos fresca por cada test, sin mocks.

---

## Arquitectura clave — lo que necesitas entender

- **El esquema vive en la base de datos**, no en el código. Las tablas `_emdash_collections` y `_emdash_fields` son la fuente de verdad. No hardcodees tipos de contenido.
- **Tablas SQL reales** por colección (`ec_posts`, `ec_products`), no EAV. El contenido es consultable directamente con SQL estándar.
- **Kysely para todas las queries**. Nunca interpolar strings en SQL — ver `AGENTS.md` para las reglas completas.
- **Capa de handlers** (`api/handlers/*.ts`) contiene la lógica de negocio. Los archivos de rutas son wrappers delgados.
- **Cadena de middleware**: inicialización del runtime → verificación de setup → autenticación → contexto del request.

---

## Agregar una migración de base de datos

1. Crear `packages/core/src/database/migrations/NNN_descripcion.ts` con número de secuencia con ceros a la izquierda.
2. Exportar funciones `up(db)` y `down(db)`.
3. **Registrarla** en `packages/core/src/database/migrations/runner.ts` — las migraciones se importan estáticamente, no se autodescubren (compatibilidad con el bundler de Workers).

---

## Agregar una ruta de API

1. Crear el archivo en `packages/core/src/astro/routes/api/`.
2. Iniciar con `export const prerender = false;`.
3. Usar `apiError()`, `handleError()`, `parseBody()` desde `#api/`.
4. Verificar autorización con `requirePerm()` en todas las rutas que modifican estado.
5. Registrar la ruta en `packages/core/src/astro/integration/routes.ts`.

---

## Limitaciones conocidas — no intentar resolver sin necesidad

Estas son brechas documentadas del proyecto. No agregar código para resolverlas a menos que sea crítico para un proyecto de cliente:

- **Rate limiting ausente** — no hay protección contra fuerza bruta en endpoints de autenticación. Mitigación temporal: activar Cloudflare proxy (plan gratuito) delante del sitio.
- **Sin autenticación por contraseña** — solo passkeys, magic links y OAuth. Es una decisión de diseño del upstream.
- **Almacenamiento de medios en Cloudflare pendiente** — R2 para uploads de archivos está en el roadmap. En modo Node.js los archivos se guardan en filesystem local.
- **Marketplace de plugins** — la arquitectura existe pero la instalación en runtime es post-beta.

---

## Estructura del repositorio

```
cms-cloudflare-workers-funnel-ibague/
├── packages/
│   ├── core/              # paquete principal — integración Astro, APIs, admin UI, CLI
│   ├── auth/              # autenticación — passkeys, OAuth, magic links
│   ├── admin/             # SPA de administración en React
│   ├── cloudflare/        # adaptador Cloudflare (D1, R2, Worker Loader, plugin sandbox)
│   ├── create-emdash/     # scaffolder npm create emdash
│   ├── gutenberg-to-portable-text/  # conversor de bloques WordPress → Portable Text
│   └── plugins/           # plugins oficiales (SEO, formularios, embeds, audit-log...)
├── demos/
│   ├── simple/            # demo principal — Node.js + SQLite (sin Cloudflare)
│   ├── cloudflare/        # demo Cloudflare Workers con D1
│   ├── plugins-demo/      # entorno de prueba para desarrollo de plugins
│   └── postgres/          # variante PostgreSQL
├── templates/             # templates de inicio (blog, marketing, portfolio + variantes CF)
├── docs/                  # sitio de documentación (Starlight)
├── skills/                # skills de desarrollo asistido por IA
└── e2e/                   # fixtures de tests Playwright
```

El paquete principal es **`packages/core`**. La mayoría del trabajo ocurre ahí.

---

## Sincronización de templates y demos

Los templates y demos se mantienen en sincronía con scripts:

```bash
# Sincronizar template blog → demo simple (sincronización completa)
bash scripts/sync-blog-demos.sh

# Sincronizar variantes Cloudflare (mantiene archivos de config específicos del runtime)
bash scripts/sync-cloudflare-templates.sh
```

Correr el script correspondiente después de editar archivos compartidos entre templates.

---

## Recursos

- `AGENTS.md` — arquitectura detallada y patrones de código para desarrollo asistido por IA
- `TEMPLATES.md` — documentación de los templates disponibles
- [Documentación upstream](https://docs.emdashcms.com) — referencia de API y guías del proyecto original
- [tevezmarketing.digital](https://tevezmarketing.digital) — implementación productiva de referencia
