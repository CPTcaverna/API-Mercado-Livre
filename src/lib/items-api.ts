import { apiJson } from './api'
import type { CategoryAttributesResponse } from '../types/category-attribute'
import type { PredictCategoryResponse } from '../types/category'
import type { CreateItemPayload, Item, UpdateItemPayload } from '../types/item'
import type { ItemListFilters } from '../types/item-filters'
import {
  ITEM_LIST_PAGE_SIZE,
  type ItemListResponse,
} from '../types/item-list'

export async function fetchItems(
  filters: ItemListFilters,
  page = 1,
  pageSize = ITEM_LIST_PAGE_SIZE,
) {
  const params = new URLSearchParams()
  const term = filters.q.trim()
  if (term) params.set('q', term)
  if (filters.visibility !== 'active') {
    params.set('visibility', filters.visibility)
  }
  if (filters.status !== 'all') params.set('status', filters.status)
  if (filters.stock !== 'all') params.set('stock', filters.stock)
  if (filters.sort !== 'newest') params.set('sort', filters.sort)
  params.set('page', String(page))
  params.set('limit', String(pageSize))
  const qs = params.toString()
  return apiJson<ItemListResponse>(`/items?${qs}`)
}

export async function predictCategoryFromTitle(title: string, site = 'MLB') {
  const params = new URLSearchParams({ q: title.trim(), site })
  return apiJson<PredictCategoryResponse>(`/items/categories/predict?${params.toString()}`)
}

export async function fetchCategoryAttributes(categoryId: string) {
  return apiJson<CategoryAttributesResponse>(
    `/items/categories/${encodeURIComponent(categoryId)}/attributes`,
  )
}

export async function resolveCategoryAttributes(
  categoryId: string,
  payload: {
    title?: string
    condition?: string
    listing_type_id?: string
    attributes: { id: string; value_id?: string; value_name?: string }[]
  },
) {
  return apiJson<CategoryAttributesResponse>(
    `/items/categories/${encodeURIComponent(categoryId)}/attributes/resolve`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  )
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
