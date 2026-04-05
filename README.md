# EmDash — CMS Headless de Nueva Generación para Agencias y Desarrolladores

> **tevezmarketing.digital** — Plataforma CMS empresarial construida sobre tecnología serverless moderna. EmDash es la alternativa profesional a WordPress: TypeScript nativo, plugins sandboxeados y arquitectura Jamstack lista para producción.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/emdash-cms/templates/tree/main/blog-cloudflare)
[![npm](https://img.shields.io/npm/v/emdash)](https://npmjs.com/package/emdash)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)](https://www.typescriptlang.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)](https://workers.cloudflare.com/)

---

## ¿Qué es EmDash?

EmDash es un **CMS headless full-stack** construido sobre [Astro](https://astro.build/) y [Cloudflare Workers](https://workers.cloudflare.com/). Está diseñado para agencias digitales, desarrolladores y equipos de marketing que necesitan un sistema de gestión de contenidos de alto rendimiento, seguro y extensible — sin las limitaciones técnicas y de seguridad de WordPress.

En **tevezmarketing.digital** utilizamos EmDash como base de nuestra infraestructura de contenidos para ofrecer sitios web ultrarrápidos, escalables y optimizados para SEO técnico.

### Casos de uso principales

- **Agencias de marketing digital** que gestionan múltiples sitios de clientes
- **Equipos de contenido** que necesitan flujos editoriales estructurados
- **Desarrolladores** que construyen sitios Jamstack con CMS visual
- **Empresas** que migran desde WordPress sin perder contenido ni SEO

---

## Instalación rápida

> **Requisito previo:** EmDash utiliza Dynamic Workers para ejecutar plugins en sandboxes seguros. Esta funcionalidad requiere una cuenta Cloudflare de pago (desde $5/mes). Puedes desactivar los plugins comentando el bloque `worker_loaders` en tu `wrangler.jsonc`.

```bash
npm create emdash@latest
```

O despliega directamente en tu cuenta Cloudflare en un clic:

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/emdash-cms/templates/tree/main/blog-cloudflare)

---

## Por qué EmDash supera a WordPress en 2024

WordPress fue diseñado para una web distinta. Hoy, ejecutar WordPress implica gestionar PHP junto a JavaScript, apilar capas de caché para conseguir rendimiento aceptable y aceptar que el [96% de las vulnerabilidades de seguridad de WordPress provienen de plugins](https://patchstack.com/whitepaper/state-of-wordpress-security-in-2024/).

EmDash resuelve estos problemas desde la arquitectura:

| Característica | WordPress | EmDash |
|---|---|---|
| Lenguaje | PHP + JS | TypeScript nativo |
| Plugins | Acceso total al servidor | Sandboxeados (Worker isolates) |
| Almacenamiento de contenido | HTML serializado | Portable Text (JSON estructurado) |
| Rendimiento | Requiere caché | Edge-first, serverless |
| Seguridad de plugins | Sin aislamiento | Manifiesto de capacidades declarado |
| Integración con IA | No nativa | MCP Server incluido |
| Escalabilidad | Vertical (servidor) | Global (Cloudflare Edge) |

---

## Características técnicas destacadas

### Plugins sandboxeados — Seguridad sin compromiso

WordPress otorga a cada plugin acceso completo a la base de datos, el sistema de archivos y los datos de usuario. Un único plugin vulnerable puede comprometer todo el sitio.

EmDash ejecuta los plugins en [Worker sandboxes](https://developers.cloudflare.com/workers/runtime-apis/bindings/worker-loader/) aislados mediante Dynamic Worker Loaders. Cada plugin declara exactamente qué capacidades necesita — y solo puede hacer eso:

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

WordPress almacena el contenido enriquecido como HTML con metadatos embebidos en comentarios, vinculando el contenido a su representación DOM.

EmDash usa [Portable Text](https://www.portabletext.org/), un formato JSON estructurado que desacopla el contenido de la presentación. El mismo contenido puede renderizarse como página web, app móvil, email o respuesta de API — sin parsear HTML.

### Arquitectura serverless lista para el Edge

```typescript
// astro.config.mjs
import emdash from "emdash/astro";
import { d1 } from "emdash/db";

export default defineConfig({
  integrations: [emdash({ database: d1() })],
});
```

### TypeScript de extremo a extremo

Los tipos se generan desde el esquema vivo de la base de datos — no desde código hardcodeado:

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

---

## Templates de inicio profesionales

EmDash incluye tres templates listos para producción:

### Blog profesional
Sidebar con widgets, búsqueda full-text y RSS. Incluye categorías, etiquetas, comentarios y modo oscuro/claro.

### Landing page de marketing
Página de conversión con hero, grid de características, precios, FAQ y formulario de contacto. Optimizada para conversión y SEO on-page.

### Portfolio creativo
Grid de proyectos con filtrado por etiquetas, páginas de caso de estudio y RSS. Ideal para agencias y freelancers.

---

## Integración nativa con Inteligencia Artificial

EmDash es el primer CMS diseñado con IA como ciudadana de primera clase:

- **MCP Server integrado** — Conecta Claude, ChatGPT y otros asistentes directamente a tu sitio
- **CLI para agentes** — Gestión programática de contenido y esquemas
- **Skills para desarrollo** — Archivos de habilidades para desarrollo asistido de plugins y temas

---

## Compatibilidad de plataformas

EmDash funciona en Cloudflare y en cualquier servidor Node.js. Sin PHP, sin tier de hosting separado.

| Capa | Cloudflare (recomendado) | Alternativas compatibles |
|---|---|---|
| Base de datos | D1 | SQLite, Turso/libSQL, PostgreSQL |
| Almacenamiento | R2 | AWS S3, S3-compatible, filesystem local |
| Sesiones | KV | Redis, basado en archivos |
| Plugins | Worker isolates (sandboxed) | In-process (modo seguro) |

---

## Migración desde WordPress

EmDash incluye un **asistente de migración WordPress** que importa posts, páginas, medios y taxonomías desde:

- Exportaciones WXR
- WordPress REST API
- WordPress.com

Los skills de IA ayudan a portar plugins y temas existentes.

---

## Funcionalidades completas del CMS

**Gestión de contenido** — Posts, páginas, tipos de contenido personalizados. Edición de texto enriquecido con TipTap y almacenamiento Portable Text. Revisiones, borradores, publicación programada, búsqueda full-text (FTS5) y edición visual inline.

**Panel de administración** — Panel completo con constructor visual de esquemas, biblioteca multimedia (subidas drag-drop con URLs firmadas), menús de navegación, taxonomías, widgets e importador de WordPress.

**Autenticación empresarial** — Passkeys (WebAuthn) como método principal, con OAuth y magic links como alternativa. Control de acceso basado en roles: Administrador, Editor, Autor, Colaborador.

**Sistema de plugins** — API `definePlugin()` con hooks de ciclo de vida, almacenamiento KV, configuración, páginas de admin, widgets de dashboard, tipos de bloques personalizados y rutas de API. Ejecución sandboxeada en Cloudflare.

---

## Estructura del repositorio

```
packages/
  core/           Integración Astro, APIs, admin UI, CLI
  auth/           Biblioteca de autenticación
  blocks/         Definiciones de bloques Portable Text
  cloudflare/     Adaptador Cloudflare (D1, R2, Worker Loader)
  plugins/        Plugins oficiales (formularios, embeds, SEO, audit-log…)
  create-emdash/  Scaffolding npm create emdash

templates/        Templates de inicio (blog, marketing, portfolio)
demos/            Sitios de desarrollo y ejemplos
docs/             Documentación (Starlight)
```

---

## Desarrollo y contribución

Este es un monorepo gestionado con pnpm.

```bash
git clone https://github.com/tevezmarketing/cms-cloudflare-workers-funnel-ibague.git && cd cms-cloudflare-workers-funnel-ibague
pnpm install
pnpm build
```

Demo local (Node.js + SQLite, sin cuenta Cloudflare):

```bash
pnpm --filter emdash-demo seed
pnpm --filter emdash-demo dev
```

Panel de administración: [http://localhost:4321/\_emdash/admin](http://localhost:4321/_emdash/admin)

```bash
pnpm test          # ejecutar todos los tests
pnpm typecheck     # verificación de tipos
pnpm lint:quick    # linting rápido (< 1s)
pnpm format        # formatear con oxfmt
```

Consulta [CONTRIBUTING.md](CONTRIBUTING.md) para la guía completa de contribución.

---

## Estado del proyecto

EmDash está en **beta preview**. Aceptamos contribuciones, feedback, plugins, temas e ideas de la comunidad.

```bash
npm create emdash@latest
```

Documentación completa, guías y referencia de API: [github.com/emdash-cms/emdash/docs](https://github.com/emdash-cms/emdash/tree/main/docs)

---

*EmDash es desarrollado y mantenido por el equipo de [tevezmarketing.digital](https://tevezmarketing.digital) — especialistas en arquitectura web moderna, marketing digital y soluciones CMS empresariales para Colombia y Latinoamérica.*
