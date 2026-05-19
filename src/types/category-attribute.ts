export type CategoryAttribute = {
  id: string
  name: string
  tags?: {
    required?: boolean
    catalog_required?: boolean
    conditional_required?: boolean
    hidden?: boolean
    read_only?: boolean
  }
  value_type?: string
  values?: { id: string; name: string }[]
  hint?: string
  example?: string
  default_unit?: string
  allowed_units?: { id: string; name: string }[]
  value_max_length?: number
  hierarchy?: string
}

export type CategoryAttributesResponse = {
  required: CategoryAttribute[]
  all: CategoryAttribute[]
}

export type CategoryAttributeValue = {
  value_id?: string
  value_name?: string
}
