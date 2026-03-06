"use server";

import { RecipePreview } from "@/types/recipes";
import { getRecipesPreviewFromDB, getRecipeBySlugFromDB, getRandomRecipeSlugFromDB } from "./recipes.queries";

export async function getRecipesPreview(query?: string, currentPage?: number): Promise<RecipePreview[]> {
  return getRecipesPreviewFromDB(query)
}

export async function getRecipeBySlug(slug: string) {
  return getRecipeBySlugFromDB(slug)
}

export async function getRandomRecipeSlug(): Promise<string | null> {
  return getRandomRecipeSlugFromDB()
}
