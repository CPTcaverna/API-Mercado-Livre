import { apiJson } from './api'
import type { PredictCategoryResponse } from '../types/category'
import type { CreateItemPayload, Item, UpdateItemPayload } from '../types/item'
import type { ItemListFilters } from '../types/item-filters'

export async function fetchItems(filters: ItemListFilters) {
  const params = new URLSearchParams()
  const term = filters.q.trim()
  if (term) params.set('q', term)
  if (filters.visibility !== 'active') {
    params.set('visibility', filters.visibility)
  }
  if (filters.status !== 'all') params.set('status', filters.status)
  if (filters.stock !== 'all') params.set('stock', filters.stock)
  if (filters.sort !== 'newest') params.set('sort', filters.sort)
  const qs = params.toString()
  const data = await apiJson<{ items: Item[] }>(`/items${qs ? `?${qs}` : ''}`)
  return data.items
}

export async function predictCategoryFromTitle(title: string, site = 'MLB') {
  const params = new URLSearchParams({ q: title.trim(), site })
  return apiJson<PredictCategoryResponse>(`/items/categories/predict?${params.toString()}`)
}

export async function fetchItem(id: string) {
  const data = await apiJson<{ item: Item }>(`/items/${id}`)
  return data.item
}

export async function createItem(payload: CreateItemPayload) {
  const data = await apiJson<{ item: Item }>('/items', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return data.item
}

export async function updateItem(id: string, payload: UpdateItemPayload) {
  const data = await apiJson<{ item: Item }>(`/items/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return data.item
}

export async function deactivateItem(id: string) {
  const data = await apiJson<{ item: Item }>(`/items/${id}`, {
    method: 'DELETE',
  })
  return data.item
}

export async function reactivateItem(id: string) {
  const data = await apiJson<{ item: Item }>(`/items/${id}/reactivate`, {
    method: 'POST',
  })
  return data.item
}

export async function deleteInactiveItem(id: string) {
  await apiJson<{ ok: boolean }>(`/items/${id}/permanent`, {
    method: 'DELETE',
  })
}

export type ImportFromMlResult = {
  created: number
  updated: number
  skipped: number
  failed: number
  totalOnMercadoLivre: number
  processed: number
  errors: string[]
}

export async function importItemsFromMercadoLivre() {
  return apiJson<ImportFromMlResult>('/items/import', { method: 'POST' })
}
