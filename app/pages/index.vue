<script setup lang="ts">
import type { Product } from '~/types/product'
import Papa from 'papaparse'

definePageMeta({
  layout: 'home',
})

const online = useOnline()
const productsStore = useProductsStore()

// Proper SSR/SSG with caching and hydration
const { data: productsData } = await useAsyncData('products', async () => {
  const response = await $fetch('/products.csv', { responseType: 'text' })
  const result = Papa.parse<Product>(response as string, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  })
  return result.data as Product[]
})

// Initialize store with fetched data
if (productsData.value) {
  productsStore.products = productsData.value
}
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
          <div v-if="productsStore.loading">
            Loading products...
          </div>
          <div v-else-if="productsStore.error" text-red>
            {{ productsStore.error }}
          </div>
          <div v-else grid="~ cols-1 md:cols-2 lg:cols-3" gap-4>
            <ProductCard
              v-for="(product, index) in productsStore.filteredProducts"
              :key="`${product.name}-${index}`"
              :product="product"
            />
          </div>
        </main>
      </div>
    </div>
  </div>
</template>
