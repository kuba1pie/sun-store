import type { ReturnTypeStore } from '~/composables/products'

const managedKeys = ['page', 'limit', 'category', 'manufacturer', 'minPrice', 'maxPrice', 'q'] as const

type ManagedKey = (typeof managedKeys)[number]
type QueryRecord = Record<string, string>

function toNumber(value: unknown): number | null {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function normalizeQuery(query: QueryRecord) {
  return Object.keys(query).sort().reduce<QueryRecord>((acc, key) => {
    acc[key] = query[key]!
    return acc
  }, {})
}

function sameQuery(a: QueryRecord, b: QueryRecord) {
  return JSON.stringify(normalizeQuery(a)) === JSON.stringify(normalizeQuery(b))
}

export function useProductFiltersSync(store: ReturnTypeStore) {
  const route = useRoute()
  const router = useRouter()

  const applyQueryToState = () => {
    const q = route.query

    const pageFromQuery = toNumber(q.page)
    if (pageFromQuery && pageFromQuery > 0)
      store.setPage(pageFromQuery)

    const limitFromQuery = toNumber(q.limit)
    if (limitFromQuery && store.pageSizeOptions.includes(limitFromQuery as typeof store.pageSizeOptions[number]))
      store.setPageSize(limitFromQuery as typeof store.pageSizeOptions[number])

    store.filters.category = typeof q.category === 'string' ? q.category : null
    store.filters.manufacturer = typeof q.manufacturer === 'string' ? q.manufacturer : null
    store.filters.minPrice = toNumber(q.minPrice)
    store.filters.maxPrice = toNumber(q.maxPrice)
    store.filters.searchQuery = typeof q.q === 'string' ? q.q : null
  }

  const buildManagedQuery = (): QueryRecord => {
    const query: QueryRecord = {
      page: String(store.currentPage),
      limit: String(store.pageSize),
    }

    if (store.filters.category)
      query.category = store.filters.category
    if (store.filters.manufacturer)
      query.manufacturer = store.filters.manufacturer
    if (store.filters.minPrice !== null && store.filters.minPrice !== undefined)
      query.minPrice = String(store.filters.minPrice)
    if (store.filters.maxPrice !== null && store.filters.maxPrice !== undefined)
      query.maxPrice = String(store.filters.maxPrice)
    if (store.filters.searchQuery)
      query.q = store.filters.searchQuery

    return query
  }

  const syncToQuery = () => {
    const managed = buildManagedQuery()

    const preservedEntries = Object.entries(route.query)
      .filter(([key]) => !managedKeys.includes(key as ManagedKey))
      .filter(([, value]) => !Array.isArray(value)) as Array<[string, string]>

    const preserved = preservedEntries.reduce<QueryRecord>((acc, [key, value]) => {
      acc[key] = value
      return acc
    }, {})

    const nextQuery: QueryRecord = { ...preserved, ...managed }

    const currentQuery = Object.entries(route.query)
      .filter(([, value]) => !Array.isArray(value))
      .reduce<QueryRecord>((acc, [key, value]) => {
        acc[key] = value as string
        return acc
      }, {})

    if (sameQuery(currentQuery, nextQuery))
      return

    router.replace({ query: nextQuery })
  }

  watch(
    () => route.query,
    () => {
      applyQueryToState()
    },
    { immediate: true, deep: true },
  )

  watch(
    () => [store.filters, store.currentPage, store.pageSize],
    () => {
      syncToQuery()
    },
    { deep: true },
  )

  const handlePageSizeChange = (size: number) => {
    const matchedSize = store.pageSizeOptions.find(option => option === size)
    if (!matchedSize)
      return

    store.setPageSize(matchedSize)
    store.setPage(1)
  }

  const handlePageChange = (page: number) => {
    store.setPage(page)
  }

  return {
    handlePageSizeChange,
    handlePageChange,
  }
}
