export type CategorySuggestion = {
  category_id: string
  category_name: string
  domain_id: string | null
  domain_name: string | null
}

export type PredictCategoryResponse = {
  query: string
  site_id: string
  suggestions: CategorySuggestion[]
  predicted: CategorySuggestion | null
}
