export type ItemVisibilityFilter = 'all' | 'active' | 'inactive'

export type ItemStatusFilter = 'all' | 'active' | 'paused' | 'closed'

export type ItemStockFilter = 'all' | 'in' | 'out'

export type ItemSortFilter =
  | 'newest'
  | 'oldest'
  | 'price_asc'
  | 'price_desc'
  | 'title_asc'
  | 'title_desc'

export type ItemListFilters = {
  q: string
  visibility: ItemVisibilityFilter
  status: ItemStatusFilter
  stock: ItemStockFilter
  sort: ItemSortFilter
}

export const DEFAULT_ITEM_LIST_FILTERS: ItemListFilters = {
  q: '',
  visibility: 'active',
  status: 'all',
  stock: 'all',
  sort: 'newest',
}

export function hasActiveModalFilters(filters: ItemListFilters): boolean {
  return (
    filters.visibility !== 'active' ||
    filters.status !== 'all' ||
    filters.stock !== 'all' ||
    filters.sort !== 'newest'
  )
}

export function hasActiveItemFilters(filters: ItemListFilters): boolean {
  return filters.q.trim() !== '' || hasActiveModalFilters(filters)
}
