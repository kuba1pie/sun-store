<script setup lang="ts">
import type { ProductFilters } from '../types/product'

const props = defineProps<{
  categories: string[]
  manufacturers: string[]
  priceRange: { min: number, max: number }
  modelValue: ProductFilters
}>()

const emit = defineEmits<{
  'update:modelValue': [value: typeof props.modelValue]
}>()

const localFilters = ref({ ...props.modelValue })

watch(() => props.modelValue, (newValue) => {
  localFilters.value = { ...newValue }
}, { deep: true })

function updateFilters() {
  emit('update:modelValue', { ...localFilters.value })
}

function resetFilters() {
  localFilters.value = {
    category: '',
    manufacturer: '',
    minPrice: props.priceRange.min,
    maxPrice: props.priceRange.max,
    searchQuery: '',
  }
  updateFilters()
}
</script>

<template>
  <div class="p-4 rounded-lg bg-white shadow-md dark:bg-gray-800">
    <h2 class="text-xl font-bold mb-4">
      Filters
    </h2>

    <!-- Search -->
    <div class="mb-4">
      <label class="text-sm text-gray-700 font-medium mb-2 block dark:text-gray-300">Search</label>
      <input
        v-model="localFilters.searchQuery"
        type="text"
        placeholder="Search by name, manufacturer, or description..."
        class="text-gray-900 px-3 py-2 border border-gray-300 rounded-md bg-white w-full dark:text-gray-100 focus:outline-none dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
        @input="updateFilters"
      >
    </div>

    <!-- Category Filter -->
    <div class="mb-4">
      <label class="text-sm text-gray-700 font-medium mb-2 block dark:text-gray-300">Category</label>
      <select v-model="localFilters.category" class="text-gray-900 px-3 py-2 border border-gray-300 rounded-md bg-white w-full dark:text-gray-100 focus:outline-none dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500" @change="updateFilters">
        <option value="">
          All Categories
        </option>
        <option v-for="category in categories" :key="category" :value="category">
          {{ category }}
        </option>
      </select>
    </div>

    <!-- Manufacturer Filter -->
    <div class="mb-4">
      <label class="text-sm text-gray-700 font-medium mb-2 block dark:text-gray-300">Manufacturer</label>
      <select v-model="localFilters.manufacturer" class="text-gray-900 px-3 py-2 border border-gray-300 rounded-md bg-white w-full dark:text-gray-100 focus:outline-none dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500" @change="updateFilters">
        <option value="">
          All Manufacturers
        </option>
        <option v-for="manufacturer in manufacturers" :key="manufacturer" :value="manufacturer">
          {{ manufacturer }}
        </option>
      </select>
    </div>

    <!-- Price Range Filter -->
    <div class="mb-4">
      <label class="text-sm text-gray-700 font-medium mb-2 block dark:text-gray-300">Price Range</label>
      <div class="flex items-center">
        <input
          v-model.number="localFilters.minPrice"
          type="number"
          :min="priceRange.min"
          :max="priceRange.max"
          class="text-gray-900 px-3 py-2 border border-gray-300 rounded-md bg-white flex-1 w-full dark:text-gray-100 focus:outline-none dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
          placeholder="Min"
          @input="updateFilters"
        >
        <span class="px-2">-</span>
        <input
          v-model.number="localFilters.maxPrice"
          type="number"
          :min="priceRange.min"
          :max="priceRange.max"
          class="text-gray-900 px-3 py-2 border border-gray-300 rounded-md bg-white flex-1 w-full dark:text-gray-100 focus:outline-none dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
          placeholder="Max"
          @input="updateFilters"
        >
      </div>
      <div class="text-sm text-gray-600 mt-1 dark:text-gray-400">
        ${{ priceRange.min }} - ${{ priceRange.max }}
      </div>
    </div>

    <!-- Reset Button -->
    <button class="text-white font-medium px-4 py-2 rounded-md bg-blue-600 w-full transition-colors hover:bg-blue-700" @click="resetFilters">
      Reset Filters
    </button>
  </div>
</template>
