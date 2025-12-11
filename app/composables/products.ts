import type { Product, ProductFilters } from '~/types/product'
import { $fetch } from 'ofetch'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

export const useProductsStore = defineStore('products', () => {
  const products = ref<Product[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const pageSizeOptions = [9, 18, 27] as const
  const pageSize = ref<number>(pageSizeOptions[0])
  const currentPage = ref(1)

  const filters = ref<ProductFilters>({
    category: null,
    minPrice: null,
    maxPrice: null,
    manufacturer: null,
    searchQuery: null,
  })

  // Computed: filtered products
  const filteredProducts = computed(() => {
    return products.value.filter((product: Product) => {
      // Category filter
      if (filters.value.category && product.category !== filters.value.category) {
        return false
      }

      // Manufacturer filter
      if (filters.value.manufacturer && product.manufacturer !== filters.value.manufacturer) {
        return false
      }

      // Price range filter
      if (filters.value.minPrice !== undefined && filters.value.minPrice !== null && product.price < filters.value.minPrice) {
        return false
      }
      if (filters.value.maxPrice !== undefined && filters.value.maxPrice !== null && product.price > filters.value.maxPrice) {
        return false
      }

      // Search query (name, manufacturer, or description)
      if (filters.value.searchQuery) {
        const query = filters.value.searchQuery.toLowerCase()
        const searchableText = `${product.name} ${product.manufacturer} ${product.description}`.toLowerCase()
        if (!searchableText.includes(query)) {
          return false
        }
      }

      return true
    })
  })

  const totalPages = computed(() => {
    const total = Math.ceil(filteredProducts.value.length / pageSize.value) || 1
    return Math.max(total, 1)
  })

  const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredProducts.value.slice(start, start + pageSize.value)
  })

  const categories = computed(() => {
    const uniqueCategories = new Set(products.value.map(p => p.category))
    return Array.from(uniqueCategories).sort()
  })

  const manufacturers = computed(() => {
    const uniqueManufacturers = new Set(products.value.map(p => p.manufacturer))
    return Array.from(uniqueManufacturers).sort()
  })

  const priceRange = computed(() => {
    if (products.value.length === 0) {
      return { min: 0, max: 0 }
    }
    const prices = products.value.map(p => p.price)
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    }
  })

  function setProducts(payload: Product[]) {
    products.value = payload
  }

  function setPageSize(size: (typeof pageSizeOptions)[number]) {
    if (!pageSizeOptions.includes(size))
      return
    pageSize.value = size
  }

  function setPage(page: number) {
    currentPage.value = Math.min(Math.max(1, page), totalPages.value)
  }

  watch([filteredProducts, pageSize], () => {
    currentPage.value = 1
  })

  async function fetchProducts() {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch<Product[]>('/api/products')
      products.value = data
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load products'
      console.error('Error loading products:', e)
    }
    finally {
      loading.value = false
    }
  }

  return {
    products,
    loading,
    error,
    filters,
    categories,
    manufacturers,
    priceRange,
    filteredProducts,
    paginatedProducts,
    totalPages,
    pageSize,
    pageSizeOptions,
    currentPage,
    setProducts,
    setPageSize,
    setPage,
    fetchProducts,
  }
})

export type ReturnTypeStore = ReturnType<typeof useProductsStore>
