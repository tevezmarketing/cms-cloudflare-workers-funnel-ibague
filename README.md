# EmDash — CMS Headless para Agencias y Full Stack Marketers

> **[tevezmarketing.digital](https://tevezmarketing.digital)** — Ibagué, Tolima · Colombia · Latinoamérica  
> Infraestructura CMS empresarial construida sobre Cloudflare Workers, Astro y TypeScript nativo.  
> Fork productivo de [EmDash](https://emdashcms.com) adaptado para operación glocal: raíces locales, ejecución sin fronteras.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/emdash-cms/templates/tree/main/blog-cloudflare)
[![npm](https://img.shields.io/npm/v/emdash)](https://npmjs.com/package/emdash)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)](https://www.typescriptlang.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)](https://workers.cloudflare.com/)
[![Ibagué · Colombia](https://img.shields.io/badge/Ibagu%C3%A9-Colombia-yellow)](https://tevezmarketing.digital)

---

## Quiénes somos y por qué este fork existe

**tevezmarketing.digital** es una operación de Full Stack Marketing con base en **Ibagué, Tolima, Colombia** y alcance regional en Latinoamérica. No somos una agencia tradicional: somos un equipo técnico que une arquitectura web moderna con estrategia de marketing digital — desde la infraestructura hasta la conversión.

Este repositorio es nuestra implementación productiva de **EmDash** — el CMS headless construido sobre Astro y Cloudflare Workers. Lo adoptamos porque resuelve los problemas reales que WordPress ya no puede resolver en 2026: seguridad de plugins, rendimiento edge-first, y arquitectura preparada para IA.

### Qué adaptamos del proyecto original

- **Integración SEO técnica profesional** — sitemaps dinámicos, schema.org estructurado, Open Graph y meta tags gestionados desde el CMS, no hardcodeados
- **Templates orientados a conversión** — landing pages, funnels y blogs optimizados para mercados hispanohablantes
- **Documentación en español** — para equipos de agencia y clientes latinoamericanos
- **Configuración Cloudflare lista para producción** — D1, R2, KV y Worker isolates configurados para despliegue inmediato

### Para quién es este stack

- **Agencias de marketing digital** en Colombia y Latinoamérica que gestionan múltiples sitios de clientes
- **Full Stack Marketers** que necesitan control técnico total sin depender de WordPress
- **Equipos de contenido** que requieren flujos editoriales estructurados con rendimiento real
- **Empresas** que migran desde WordPress buscando velocidad, seguridad y escalabilidad global

---

## Por qué EmDash sobre WordPress en 2026

WordPress fue diseñado para una web distinta. Hoy, ejecutar WordPress implica gestionar PHP junto a JavaScript, apilar capas de caché para conseguir rendimiento aceptable, y aceptar que el [96% de las vulnerabilidades de seguridad provienen de plugins](https://patchstack.com/whitepaper/state-of-wordpress-security-in-2024/).

EmDash resuelve estos problemas desde la arquitectura — no desde parches:

| Característica | WordPress | EmDash |
|---|---|---|
| Lenguaje | PHP + JS mezclados | TypeScript nativo end-to-end |
| Plugins | Acceso total al servidor | Sandboxeados (Worker isolates) |
| Almacenamiento de contenido | HTML serializado | Portable Text (JSON estructurado) |
| Rendimiento | Requiere caché multicapa | Edge-first, serverless, 0 cold starts |
| Seguridad de plugins | Sin aislamiento | Manifiesto de capacidades declarado |
| SEO técnico | Plugins de terceros | Integración nativa estructurada |
| Integración con IA | No nativa | MCP Server incluido |
| Escalabilidad | Vertical (un servidor) | Global (Cloudflare Edge, 300+ ciudades) |
| Hosting | Servidor dedicado o compartido | $5/mes en Cloudflare |

---

## SEO técnico integrado — diferencial de este fork

El SEO no es un plugin opcional en este stack. Está en la arquitectura desde el principio.

### Schema.org de entidad estructurada

Cada sitio desplegado con este fork incluye schema `Organization` o `Person` generado automáticamente desde la configuración del CMS:

```typescript
// emdash.config.ts
export default defineConfig({
  entity: {
    type: "Organization",
    name: "tevezmarketing.digital",
    url: "https://tevezmarketing.digital",
    address: {
      locality: "Ibagué",
      region: "Tolima",
      country: "CO",
    },
    sameAs: [
      "https://github.com/tevezmarketing",
      "https://npmjs.com/package/emdash",
    ],
  },
  seo: {
    sitemap: true,           // Sitemap dinámico con prioridades
    openGraph: true,         // OG tags automáticos por colección
    canonicals: true,        // URLs canónicas gestionadas
    structuredData: true,    // JSON-LD por tipo de contenido
  },
});
```

### Sitemaps dinámicos sin rebuilds

```typescript
// El sitemap se actualiza en tiempo real con cada publicación
// No requiere rebuild del sitio estático
GET /sitemap.xml        → sitemap índice
GET /sitemap-posts.xml  → posts con lastmod real
GET /sitemap-pages.xml  → páginas con frecuencia de cambio
```

### Core Web Vitals por defecto

Astro genera HTML estático. Cloudflare Workers sirve desde el edge más cercano al usuario. El resultado son métricas LCP < 1s y CLS = 0 sin configuración adicional — lo cual Google confirma directamente en rankings.

---

## Instalación rápida

> **Prerequisito:** Dynamic Worker Loaders para plugins sandboxeados requiere cuenta Cloudflare de pago (desde $5/mes). Para desarrollo local con Node.js + SQLite no se necesita cuenta.

```bash
npm create emdash@latest
```

O despliega directamente en Cloudflare:

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/emdash-cms/templates/tree/main/blog-cloudflare)

---

## Características técnicas del stack

### Plugins sandboxeados — seguridad sin compromiso

WordPress otorga a cada plugin acceso completo a la base de datos, el sistema de archivos y los datos de usuario. Un único plugin vulnerable compromete todo el sitio.

EmDash ejecuta plugins en [Worker sandboxes](https://developers.cloudflare.com/workers/runtime-apis/bindings/worker-loader/) aislados. Cada plugin declara exactamente qué capacidades necesita:

```typescript
export default () =>
  definePlugin({
    id: "notify-on-publish",
    capabilities: ["read:content", "email:send"],
    hooks: {
      "content:afterSave": async (event, ctx) => {
        if (event.content.status !== "published") return;
        await ctx.email.send({
          to: "editors@example.com",
          subject: `Nueva publicación: ${event.content.title}`,
        });
      },
    },
  });
```

### Contenido estructurado con Portable Text

WordPress almacena contenido enriquecido como HTML con metadatos en comentarios, acoplando contenido a representación DOM.

EmDash usa [Portable Text](https://www.portabletext.org/): JSON estructurado que desacopla el contenido de la presentación. El mismo contenido renderiza como página web, app móvil, email o respuesta de API — sin parsear HTML.

### TypeScript end-to-end con tipos desde el esquema vivo

Los tipos se generan desde la base de datos en tiempo real — no desde código hardcodeado:

```bash
npx emdash types
```

### Consulta de contenido sin rebuilds

```astro
---
import { getEmDashCollection } from "emdash";
const { entries: posts } = await getEmDashCollection("posts");
---

{posts.map((post) => <article>{post.data.title}</article>)}
```

### Integración nativa con IA

- **MCP Server integrado** — Conecta Claude, ChatGPT y otros asistentes directamente al CMS
- **CLI para agentes** — Gestión programática de contenido y esquemas
- **Skills de desarrollo** — Archivos de habilidades para asistencia en plugins y temas

---

## Templates listos para producción

### Blog profesional con SEO estructurado
Sidebar con widgets, búsqueda full-text, RSS y schema `BlogPosting` automático por artículo. Categorías, etiquetas, comentarios y modo oscuro/claro.

### Landing page de conversión
Hero, grid de características, precios, FAQ y formulario de contacto. Schema `WebPage` + `Offer` integrado. Optimizada para conversión y posicionamiento en búsquedas comerciales.

### Portfolio de agencia
Grid de proyectos con filtrado, páginas de caso de estudio y schema `CreativeWork`. Ideal para agencias y consultores que necesitan demostrar capacidad técnica verificable.

---

## Compatibilidad de plataformas

| Capa | Cloudflare (recomendado) | Alternativas compatibles |
|---|---|---|
| Base de datos | D1 | SQLite, Turso/libSQL, PostgreSQL |
| Almacenamiento | R2 | AWS S3, S3-compatible, filesystem local |
| Sesiones | KV | Redis, basado en archivos |
| Plugins | Worker isolates (sandboxed) | In-process (modo desarrollo) |

---

## Migración desde WordPress

Incluye asistente de migración que importa posts, páginas, medios y taxonomías desde:

- Exportaciones WXR (WordPress eXtended RSS)
- WordPress REST API
- WordPress.com

Los skills de IA ayudan a portar plugins y temas existentes al nuevo stack.

---

## Funcionalidades del CMS

**Gestión de contenido** — Posts, páginas, tipos personalizados. Editor TipTap con Portable Text. Revisiones, borradores, publicación programada, búsqueda full-text FTS5 y edición visual inline.

**Panel de administración** — Constructor visual de esquemas, biblioteca multimedia con drag-drop y URLs firmadas, menús de navegación, taxonomías, widgets e importador de WordPress.

**Autenticación empresarial** — Passkeys (WebAuthn) como método principal. OAuth y magic links como alternativa. Roles: Administrador, Editor, Autor, Colaborador.

**Sistema de plugins** — API `definePlugin()` con hooks de ciclo de vida, almacenamiento KV, páginas de admin, widgets de dashboard, bloques personalizados y rutas de API. Ejecución sandboxeada en Cloudflare.

---

## Estructura del repositorio

```
packages/
  core/           Integración Astro, APIs, admin UI, CLI
  auth/           Autenticación (passkeys, OAuth, magic links)
  blocks/         Definiciones de bloques Portable Text
  cloudflare/     Adaptador Cloudflare (D1, R2, Worker Loader)
  plugins/        Plugins oficiales (SEO, formularios, embeds, audit-log)
  create-emdash/  Scaffolding npm create emdash

templates/        Templates (blog, marketing, portfolio + variantes Cloudflare)
demos/            Entornos de desarrollo y ejemplos
docs/             Documentación (Starlight)
```

---

## Desarrollo local

Monorepo gestionado con pnpm:

```bash
git clone https://github.com/tevezmarketing/cms-cloudflare-workers-funnel-ibague.git
cd cms-cloudflare-workers-funnel-ibague
pnpm install
pnpm build
```

Demo local — Node.js + SQLite, sin cuenta Cloudflare:

```bash
pnpm --filter emdash-demo seed
pnpm --filter emdash-demo dev
```

Panel de administración: `http://localhost:4321/_emdash/admin`

```bash
pnpm test          # todos los tests
pnpm typecheck     # verificación de tipos
pnpm lint:quick    # linting rápido (< 1s)
pnpm format        # formatear con oxfmt
```

Consulta [CONTRIBUTING.md](CONTRIBUTING.md) para la guía completa.

---

## Estado del proyecto

EmDash upstream está en **beta preview**. Este fork está en uso productivo activo en proyectos de clientes de tevezmarketing.digital.

```bash
npm create emdash@latest
```

Documentación completa: [github.com/emdash-cms/emdash/docs](https://github.com/emdash-cms/emdash/tree/main/docs)

---

## Trabajar con nosotros

¿Tienes un proyecto que necesita infraestructura web moderna, SEO técnico real o migración desde WordPress?

**tevezmarketing.digital** opera desde Ibagué, Colombia con capacidad de ejecución remota para cualquier mercado hispanohablante.

- 🌐 [tevezmarketing.digital](https://tevezmarketing.digital)
- 💻 [github.com/tevezmarketing](https://github.com/tevezmarketing)
- 📦 [npmjs.com/package/emdash](https://npmjs.com/package/emdash)

---

*Fork desarrollado y mantenido por **[tevezmarketing.digital](https://tevezmarketing.digital)** — Full Stack Marketing desde Ibagué, Tolima, Colombia. Arquitectura web moderna, SEO técnico y soluciones CMS para agencias y empresas en Latinoamérica.*
