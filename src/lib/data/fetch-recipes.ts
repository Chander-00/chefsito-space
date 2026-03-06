"use server";

import { RecipePreview } from "@/types/recipes";
import { getRecipesPreviewFromDB, getRecipeBySlugFromDB, getRandomRecipeSlugFromDB, getUserFavoriteIds } from "./recipes.queries";

export async function getRecipesPreview(
  query?: string,
  page = 1,
  perPage = 25
): Promise<{ recipes: RecipePreview[]; total: number }> {
  return getRecipesPreviewFromDB(query, page, perPage)
}

export async function getRecipeBySlug(slug: string) {
  return getRecipeBySlugFromDB(slug)
}

export async function getRandomRecipeSlug(): Promise<string | null> {
  return getRandomRecipeSlugFromDB()
}

export async function getFavoriteIds(userId: string): Promise<string[]> {
  const set = await getUserFavoriteIds(userId)
  return Array.from(set)
}
