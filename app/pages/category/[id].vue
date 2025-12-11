<script setup lang="ts">
import type { Product } from '~/types/product'
import Papa from 'papaparse'

const route = useRoute<'category-id'>()
const productsStore = useProductsStore()

definePageMeta({
  layout: 'home',
})

// Proper SSR/SSG with caching and hydration
const { data: productsData } = await useAsyncData('products', async () => {
  const response = await $fetch<string>('/products.csv', { responseType: 'text' })
  const result = Papa.parse<Product>(response, {
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

// Filter products by category
const categoryProducts = computed(() => {
  return productsStore.products.filter(p => p.category === route.params.id)
})
</script>

<template>
  <div>
    <div i-twemoji:waving-hand text-4xl inline-block animate-shake-x animate-duration-5000 />
    <h3 text-2xl font-500>
      Hi,
    </h3>
    <div text-xl>
      Welcome to the {{ route.params.id }} category page!
    </div>

    <div mt-6>
      <h2 text-xl mb-4>
        Products in {{ route.params.id }}
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
          <div v-else-if="categoryProducts.length === 0" text-gray>
            No products found in this category.
          </div>
          <div v-else grid="~ cols-1 md:cols-2 lg:cols-3" gap-4>
            <ProductCard
              v-for="(product, index) in categoryProducts"
              :key="`${product.name}-${index}`"
              :product="product"
            />
          </div>
        </main>
      </div>
    </div>

    <div>
      <NuxtLink
        class="text-sm btn m-3"
        to="/"
      >
        Back
      </NuxtLink>
    </div>
  </div>
</template>
