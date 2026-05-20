import type { Item } from './item'

export const ITEM_LIST_PAGE_SIZE = 10

export type ItemListResponse = {
  items: Item[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
