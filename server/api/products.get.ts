import type { Product } from '~/types/product'
import { promises as fs } from 'node:fs'
import { resolve } from 'node:path'
import { defineEventHandler } from 'h3'
import Papa from 'papaparse'

const CACHE_TTL_MS = 60_000
let cachedProducts: Product[] | null = null
let cachedAt = 0

export default defineEventHandler(async () => {
  const now = Date.now()
  if (cachedProducts && now - cachedAt < CACHE_TTL_MS)
    return cachedProducts

  const csvPath = resolve(process.cwd(), 'public', 'products.csv')
  const csvText = await fs.readFile(csvPath, 'utf-8')

  const result = Papa.parse<Product>(csvText, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  })

  if (result.errors?.length)
    console.warn('CSV parse errors:', result.errors)

  cachedProducts = result.data as Product[]
  cachedAt = now
  return cachedProducts
})
