<script setup lang="ts">
import type { Product } from '~/types/product'
import { useProductsStore } from '~/composables/products'

definePageMeta({
  layout: 'home',
})

const online = useOnline()
const productsStore = useProductsStore()

// SSR/SSG-safe fetch via server API; hydration-friendly
const { data: productsData, pending, error } = await useAsyncData<Product[]>('products', () => $fetch<Product[]>('/api/products'))

watchEffect(() => {
  if (productsData.value)
    productsStore.setProducts(productsData.value)
})

const isLoading = computed(() => pending.value || productsStore.loading)
const loadError = computed(() => productsStore.error || (error.value && (error.value as Error).message))
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
            @update:page-size="productsStore.setPageSize"
            @update:page="productsStore.setPage"
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
