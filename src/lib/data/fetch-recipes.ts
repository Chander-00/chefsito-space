'use server'

import { RecipePreview } from "@/types/recipes";
import { getRecipesPreviewFromDB, getRecipeBySlugFromDB } from "./recipes.queries";

// To swap back to mock data, uncomment these and comment out the DB calls:
// import recipesData from '@/mocks/recipes.mock.json'
// import { Recipe } from "@/types/recipes";
// const recipes: Recipe[] = recipesData;

export async function getRecipesPreview(query?: string, currentPage?: number): Promise<RecipePreview[]> {
  return getRecipesPreviewFromDB(query)

  // Mock version:
  // return recipes
  //   .filter((recipe) => !query || recipe.recipe_name.toLowerCase().includes(query.toLowerCase()))
  //   .map((recipe) => ({
  //     recipe_id: recipe.recipe_id,
  //     recipe_name: recipe.recipe_name,
  //     recipe_slug: recipe.recipe_slug,
  //     recipe_country: recipe.recipe_country,
  //     recipe_image: recipe.recipe_image,
  //     creator_name: recipe.creator_name,
  //   }));
}

export async function getRecipeBySlug(slug: string) {
  return getRecipeBySlugFromDB(slug)

  // Mock version:
  // return recipes.find((recipe) => recipe.recipe_slug === slug)
}
