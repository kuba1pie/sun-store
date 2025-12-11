## Sun Store

Minimal e-commerce frontend on Nuxt (SSR/SSG) with CSV product data, URL-synced filters, and pagination.

### Stack

- Nuxt 4 (Vue 3, TypeScript)
- Pinia: [app/composables/products.ts](app/composables/products.ts)
- Papaparse (CSV parsing in API), ofetch for fetching
- UnoCSS, VueUse, PWA (Nuxt modules)

### Product data flow

- Source: `public/products.csv`
- API: `/api/products` parses CSV (60s cache)
- Store: `useProductsStore` holds products, filters, pagination, derived lists
- Pages: `useAsyncData` (SSR/SSG) + client hydration

### Filters & pagination (URL-sync)

- Filters: category, manufacturer, price min/max, text search
- Pagination: sizes 9/18/27, prev/next
- URL sync: `page`, `limit`, `category`, `manufacturer`, `minPrice`, `maxPrice`, `q`
- Reset to page 1 when filters or results change
- Sync logic extracted to composable: [app/composables/useProductFiltersSync.ts](app/composables/useProductFiltersSync.ts)

### SEO / SSR / e-commerce

- SSR/SSG renders product data (HTML ready for bots)
- Addressable filters in URL improve crawl and sharing
- Pagination in URL avoids client-only state duplication on hydration
- PWA/meta in `nuxt.config.ts`; consider per-page `useSeoMeta`, schema.org (Product/Offer, ItemList), and sitemap entry in robots.txt

### UX

- Responsive card grid + filters sidebar
- Loading/error states from Pinia
- Pagination and filters preserved in URL for revisitability

### Development

- Install: `pnpm install`
- Dev: `pnpm dev`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Generate static: `pnpm generate`
