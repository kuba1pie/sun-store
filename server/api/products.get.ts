import { promises as fs } from 'fs'
import { resolve } from 'path'
import { defineEventHandler } from 'h3'
import Papa from 'papaparse'
import type { Product } from '~/types/product'

export default defineEventHandler(async () => {
  const csvPath = resolve(process.cwd(), 'public', 'products.csv')
  const csvText = await fs.readFile(csvPath, 'utf-8')

  const result = Papa.parse<Product>(csvText, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  })

  if (result.errors?.length) {
    console.warn('CSV parse errors:', result.errors)
  }

  return result.data as Product[]
})
