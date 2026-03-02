'use server'

import { filterAndScoreRecipes } from '@/lib/utils/recipe-scoring'
import { getRecipesForScoringFromDB } from '@/lib/data/recipes.queries'

// To swap back to mock data, uncomment these and comment out the DB call:
// import recipesData from '@/mocks/recipes.mock.json'
// import { Recipe } from '@/types/recipes'
// const recipes: Recipe[] = recipesData

export type SearchResult = {
  recipe_id: string
  recipe_name: string
  recipe_slug: string
  recipe_image: string
  recipe_country: string
  creator_name: string
  score: number
}

export async function searchRecipesByIngredients(
  ingredientNames: string[]
): Promise<SearchResult[]> {
  if (ingredientNames.length === 0) return []

  const recipes = await getRecipesForScoringFromDB()

  const recipesForScoring = recipes.map((recipe) => ({
    id: recipe.recipe_id,
    title: recipe.recipe_name,
    ingredients: recipe.recipe_ingredients.map((ing) => ({
      name: ing.name,
      weight: ing.weight,
    })),
  }))

  const scoredRecipes = filterAndScoreRecipes(recipesForScoring, ingredientNames)

  return scoredRecipes.flatMap((scored) => {
    const original = recipes.find((r) => r.recipe_id === scored.id)
    if (!original) return []
    return [{
      recipe_id: original.recipe_id,
      recipe_name: original.recipe_name,
      recipe_slug: original.recipe_slug,
      recipe_image: original.recipe_image,
      recipe_country: original.recipe_country,
      creator_name: original.creator_name,
      score: Math.round(scored.score * 100),
    }]
  })
}
