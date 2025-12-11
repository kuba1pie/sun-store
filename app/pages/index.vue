<script setup lang="ts">
import type { Product } from '~/types/product'
import { useProductsStore } from '~/composables/products'

definePageMeta({
  layout: 'home',
})

const online = useOnline()
const productsStore = useProductsStore()

function handlePageSizeChange(event: Event) {
  const value = Number((event.target as HTMLSelectElement).value) as (typeof productsStore.pageSizeOptions)[number]
  productsStore.setPageSize(value)
}

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
  <!-- eslint-disable unocss/order -->
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
          <div class="flex gap-4 items-center justify-between mb-4">
            <div class="flex gap-2 items-center text-sm">
              <span>Show</span>
              <select
                class="select select-sm text-blue-600 border-blue-600"
                :value="productsStore.pageSize"
                @change="handlePageSizeChange"
              >
                <option
                  v-for="size in productsStore.pageSizeOptions"
                  :key="size"
                  :value="size"
                >
                  {{ size }}
                </option>
              </select>
              <span>per page</span>
            </div>

            <div class="flex gap-2 items-center text-sm">
              <button
                class="btn btn-xs bg-blue-600 hover:bg-blue-700 text-white"
                :disabled="productsStore.currentPage <= 1"
                @click="productsStore.setPage(productsStore.currentPage - 1)"
              >
                Prev
              </button>
              <span>
                Page {{ productsStore.currentPage }} / {{ productsStore.totalPages }}
              </span>
              <button
                class="btn btn-xs bg-blue-600 hover:bg-blue-700 text-white"
                :disabled="productsStore.currentPage >= productsStore.totalPages"
                @click="productsStore.setPage(productsStore.currentPage + 1)"
              >
                Next
              </button>
            </div>
          </div>

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
