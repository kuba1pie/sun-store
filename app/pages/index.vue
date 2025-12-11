<script setup lang="ts">
import type { Product } from '~/types/product'
import { useProductsStore } from '~/composables/products'
import { useProductFiltersSync } from '~/composables/useProductFiltersSync'
import { appDescription, appName } from '~/constants'

definePageMeta({
  layout: 'home',
})

const online = useOnline()
const productsStore = useProductsStore()
const requestURL = useRequestURL()
const { handlePageChange, handlePageSizeChange } = useProductFiltersSync(productsStore)

// SSR/SSG-safe fetch via server API; hydration-friendly
const { data: productsData, pending, error } = await useAsyncData<Product[]>('products', () => $fetch<Product[]>('/api/products'))

watchEffect(() => {
  if (productsData.value)
    productsStore.setProducts(productsData.value)
})

const isLoading = computed(() => pending.value || productsStore.loading)
const loadError = computed(() => productsStore.error || (error.value && (error.value as Error).message))

function buildQueryString(page: number) {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('limit', String(productsStore.pageSize))

  if (productsStore.filters.category)
    params.set('category', productsStore.filters.category)
  if (productsStore.filters.manufacturer)
    params.set('manufacturer', productsStore.filters.manufacturer)
  if (productsStore.filters.minPrice !== null && productsStore.filters.minPrice !== undefined)
    params.set('minPrice', String(productsStore.filters.minPrice))
  if (productsStore.filters.maxPrice !== null && productsStore.filters.maxPrice !== undefined)
    params.set('maxPrice', String(productsStore.filters.maxPrice))
  if (productsStore.filters.searchQuery)
    params.set('q', productsStore.filters.searchQuery)

  return params.toString()
}

const canonical = computed(() => {
  const url = new URL(requestURL.toString())
  url.search = buildQueryString(productsStore.currentPage)
  return url.toString()
})

const prevLink = computed(() => {
  if (productsStore.currentPage <= 1)
    return null
  const url = new URL(requestURL.toString())
  url.search = buildQueryString(productsStore.currentPage - 1)
  return url.toString()
})

const nextLink = computed(() => {
  if (productsStore.currentPage >= productsStore.totalPages)
    return null
  const url = new URL(requestURL.toString())
  url.search = buildQueryString(productsStore.currentPage + 1)
  return url.toString()
})

const filterSummary = computed(() => {
  const parts: string[] = []
  if (productsStore.filters.category)
    parts.push(`Category: ${productsStore.filters.category}`)
  if (productsStore.filters.manufacturer)
    parts.push(`Brand: ${productsStore.filters.manufacturer}`)
  if (productsStore.filters.minPrice !== null && productsStore.filters.minPrice !== undefined)
    parts.push(`Min ${productsStore.filters.minPrice}`)
  if (productsStore.filters.maxPrice !== null && productsStore.filters.maxPrice !== undefined)
    parts.push(`Max ${productsStore.filters.maxPrice}`)
  if (productsStore.filters.searchQuery)
    parts.push(`Query: ${productsStore.filters.searchQuery}`)
  return parts.join(' · ')
})

const pageTitle = computed(() => {
  const base = filterSummary.value ? `${appName} – ${filterSummary.value}` : `${appName} – Products`
  return productsStore.totalPages > 1
    ? `${base} (Page ${productsStore.currentPage})`
    : base
})

const pageDescription = computed(() => {
  const base = filterSummary.value || 'Product catalog with filters and pagination'
  return `${base}. ${appDescription}`
})

useHead(() => ({
  title: pageTitle.value,
  meta: [
    { name: 'description', content: pageDescription.value },
    productsStore.currentPage > 10
      ? { name: 'robots', content: 'noindex,follow' }
      : undefined,
  ].filter(Boolean),
  link: [
    { rel: 'canonical', href: canonical.value },
    prevLink.value ? { rel: 'prev', href: prevLink.value } : undefined,
    nextLink.value ? { rel: 'next', href: nextLink.value } : undefined,
  ].filter(Boolean),
}))
</script>

<template>
  <div>
    <Logos mb-6 />
    <ClientOnly>
      <Suspense>
        <PageView v-if="online" />
        <div v-else text-gray:80>
          You're offline
        </div>
        <template #fallback>
          <div op50 italic>
            <span animate-pulse>Loading...</span>
          </div>
        </template>
      </Suspense>
      <template #fallback>
        <div op50>
          <span animate-pulse>...</span>
        </div>
      </template>
    </ClientOnly>
    <InputEntry />

    <div mt-6>
      <h2 text-xl mb-4>
        Products ({{ productsStore.filteredProducts.length }})
      </h2>
      <div class="gap-6 grid grid-cols-1 lg:grid-cols-[300px_1fr]">
        <aside class="lg:self-start lg:top-4 lg:sticky">
          <ProductFilters
            v-model="productsStore.filters"
            :categories="productsStore.categories"
            :manufacturers="productsStore.manufacturers"
            :price-range="productsStore.priceRange"
          />
        </aside>
        <main>
          <ProductPagination
            :page-size-options="productsStore.pageSizeOptions"
            :page-size="productsStore.pageSize"
            :current-page="productsStore.currentPage"
            :total-pages="productsStore.totalPages"
            :loading="isLoading"
            @update:page-size="handlePageSizeChange"
            @update:page="handlePageChange"
          />

          <div v-if="isLoading">
            Loading products...
          </div>
          <div v-else-if="loadError" text-red>
            {{ loadError }}
          </div>
          <div v-else grid="~ cols-1 md:cols-2 lg:cols-3" gap-4>
            <ProductCard
              v-for="(product, index) in productsStore.paginatedProducts"
              :key="`${product.name}-${index}`"
              :product="product"
            />
          </div>
        </main>
      </div>
    </div>
  </div>
</template>
