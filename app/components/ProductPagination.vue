<script setup lang="ts">
type PageSizeOption = number

const props = defineProps<{
  pageSizeOptions: readonly PageSizeOption[]
  pageSize: PageSizeOption
  currentPage: number
  totalPages: number
  loading?: boolean
}>()

const emit = defineEmits<{ 'update:page-size': [value: PageSizeOption], 'update:page': [value: number] }>()

function handlePageSizeChange(event: Event) {
  const value = Number((event.target as HTMLSelectElement).value) as PageSizeOption
  emit('update:page-size', value)
}

function goToPrev() {
  emit('update:page', Math.max(1, props.currentPage - 1))
}

function goToNext() {
  emit('update:page', Math.min(props.totalPages, props.currentPage + 1))
}
</script>

<template>
  <!-- eslint-disable unocss/order -->
  <div class="mb-4 flex items-center justify-between gap-4">
    <div class="flex items-center gap-2 text-sm">
      <span>Show</span>
      <select
        class="select select-sm text-blue-600 border-blue-600"
        :value="pageSize"
        :disabled="loading"
        @change="handlePageSizeChange"
      >
        <option
          v-for="size in pageSizeOptions"
          :key="size"
          :value="size"
        >
          {{ size }}
        </option>
      </select>
      <span>per page</span>
    </div>

    <div class="flex items-center gap-2 text-sm">
      <button
        class="btn btn-xs bg-blue-600 hover:bg-blue-700 text-white"
        :disabled="loading || currentPage <= 1"
        @click="goToPrev"
      >
        Prev
      </button>
      <span>
        Page {{ currentPage }} / {{ totalPages }}
      </span>
      <button
        class="btn btn-xs bg-blue-600 hover:bg-blue-700 text-white"
        :disabled="loading || currentPage >= totalPages"
        @click="goToNext"
      >
        Next
      </button>
    </div>
  </div>
</template>
