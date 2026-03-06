'use server'

import { getRecipeById as _getRecipeById, getRandomRecipeSlug as _getRandomRecipeSlug } from '@/lib/data/fetch-recipes'
import { Recipe } from '@/types/recipes'

export async function getRecipeById(id: string): Promise<Recipe | null> {
  return _getRecipeById(id)
}

export async function getRandomRecipeSlug(): Promise<string | null> {
  return _getRandomRecipeSlug()
}
