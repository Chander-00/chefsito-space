'use server'

import { Recipe } from '@/types/recipes'
import { getRecipeByIdFromDB, getRandomRecipeSlugFromDB } from '@/lib/data/recipes.queries'

export async function getRecipeById(id: string): Promise<Recipe | null> {
  if (!id || typeof id !== 'string') return null
  return getRecipeByIdFromDB(id)
}

export async function getRandomRecipeSlug(): Promise<string | null> {
  return getRandomRecipeSlugFromDB()
}
