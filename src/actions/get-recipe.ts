'use server'

import { Recipe } from '@/types/recipes'
import { getRecipeByIdFromDB } from '@/lib/data/recipes.queries'

// To swap back to mock data, uncomment these and comment out the DB call:
// import recipesData from '@/mocks/recipes.mock.json'
// const recipes: Recipe[] = recipesData

export async function getRecipeById(id: string): Promise<Recipe | null> {
  if (!id || typeof id !== 'string') return null
  return getRecipeByIdFromDB(id)

  // Mock version:
  // return recipes.find((r) => r.recipe_id === id) ?? null
}
