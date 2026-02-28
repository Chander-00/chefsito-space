'use server'

import recipesData from '@/mocks/recipes.mock.json'
import { Recipe } from '@/types/recipes'

const recipes: Recipe[] = recipesData

export async function getRecipeById(id: string): Promise<Recipe | null> {
  if (!id || typeof id !== 'string') return null
  return recipes.find((r) => r.recipe_id === id) ?? null
}
