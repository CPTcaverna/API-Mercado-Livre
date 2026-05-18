import { apiJson } from './api'
import type { CreateItemPayload, Item, UpdateItemPayload } from '../types/item'

export async function fetchItems(includeInactive = false) {
  const q = includeInactive ? '?includeInactive=true' : ''
  const data = await apiJson<{ items: Item[] }>(`/items${q}`)
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
