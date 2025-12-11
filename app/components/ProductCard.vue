<script setup lang="ts">
import type { Product } from '../types/product'

defineProps<{
  product: Product
}>()
</script>

<template>
  <div class="p-5 border border-gray-200 rounded-lg bg-white shadow-md transition-shadow dark:border-gray-700 dark:bg-gray-800 hover:shadow-lg">
    <div class="mb-3 pb-3 border-b border-gray-200 flex items-start justify-between dark:border-gray-700">
      <h3 class="text-lg text-gray-900 font-bold mr-2 flex-1 dark:text-gray-100">
        {{ product.name }}
      </h3>
      <div class="text-xl text-blue-600 font-bold dark:text-blue-400">
        ${{ product.price?.toFixed(2) ?? '0.00' }}
      </div>
    </div>

    <div class="mb-3 space-y-1">
      <div class="text-sm">
        <span class="text-gray-600 font-medium dark:text-gray-400">Manufacturer:</span>
        <span class="text-gray-900 ml-2 dark:text-gray-100">{{ product.manufacturer }}</span>
      </div>
      <div class="text-sm">
        <span class="text-gray-600 font-medium dark:text-gray-400">Category:</span>
        <span class="text-gray-900 ml-2 dark:text-gray-100">{{ product.category }}</span>
      </div>
    </div>

    <p class="text-sm text-gray-700 leading-relaxed dark:text-gray-300">
      {{ product.description }}
    </p>
  </div>
</template>
