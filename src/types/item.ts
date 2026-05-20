export type Item = {
  id: string
  mlItemId: string
  title: string
  price: number
  availableQty: number
  status: string
  active: boolean
  thumbnail: string | null
  categoryId: string | null
  createdAt: string
  updatedAt: string
  permalink?: string | null
  condition?: string | null
  listingTypeId?: string | null
  currencyId?: string | null
  categoryName?: string | null
  soldQuantity?: number | null
  pictures?: string[]
  attributes?: ItemDetailAttribute[]
}

export type ItemDetailAttribute = {
  id: string
  name: string
  value_name?: string
  value_id?: string
}

export type ItemAttributePayload = {
  id: string
  value_id?: string
  value_name?: string
}

export type CreateItemPayload = {
  title: string
  category_id: string
  price: number
  available_quantity: number
  condition: 'new' | 'used' | 'not_specified'
  listing_type_id: string
  pictures: { source: string }[]
  attributes: ItemAttributePayload[]
}

export type UpdateItemPayload = {
  title?: string
  price?: number
  available_quantity?: number
  pictures?: { source: string }[]
}
