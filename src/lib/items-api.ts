import { apiJson } from './api'
import type { CreateItemPayload, Item, UpdateItemPayload } from '../types/item'

export async function fetchItems(
  includeInactive = false,
  search = '',
) {
  const params = new URLSearchParams()
  if (includeInactive) params.set('includeInactive', 'true')
  const term = search.trim()
  if (term) params.set('q', term)
  const qs = params.toString()
  const data = await apiJson<{ items: Item[] }>(`/items${qs ? `?${qs}` : ''}`)
  return data.items
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
