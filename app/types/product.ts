export interface Product {
  name: string
  manufacturer: string
  price: number
  description: string
  category: string
}

export interface ProductFilters {
  category: string | null
  minPrice: number | null
  maxPrice: number | null
  manufacturer: string | null
  searchQuery: string | null
}
