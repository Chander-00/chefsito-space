'use server'

import {
  searchRecipesByIngredients as _searchRecipesByIngredients,
  type SearchResult,
} from '@/lib/data/fetch-recipes'

export async function searchRecipesByIngredients(
  ingredientNames: string[]
): Promise<SearchResult[]> {
  return _searchRecipesByIngredients(ingredientNames)
}
