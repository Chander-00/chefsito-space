'use server'

import recipesData from '@/mocks/recipes.mock.json'
import { Recipe } from '@/types/recipes'
import { filterAndScoreRecipes } from '@/lib/utils/recipe-scoring'

const recipes: Recipe[] = recipesData

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

// --- Real DB implementation ---
// import { prisma } from '@/lib/prisma'
// import { filterAndScoreRecipes } from '@/lib/utils/recipe-scoring'
//
// export async function searchRecipesByIngredients(
//   ingredientNames: string[]
// ): Promise<SearchResult[]> {
//   if (ingredientNames.length === 0) return []
//
//   const recipes = await prisma.recipe.findMany({
//     where: { deletedAt: null },
//     select: {
//       id: true,
//       title: true,
//       slug: true,
//       image: true,
//       country: { select: { name: true } },
//       user: { select: { name: true } },
//       recipeIngredients: {
//         select: {
//           weight: true,
//           ingredient: { select: { name: true } },
//         },
//       },
//     },
//   })
//
//   const recipesForScoring = recipes.map((recipe) => ({
//     id: recipe.id,
//     title: recipe.title,
//     ingredients: recipe.recipeIngredients.map((ri) => ({
//       name: ri.ingredient.name,
//       weight: ri.weight,
//     })),
//   }))
//
//   const scoredRecipes = filterAndScoreRecipes(recipesForScoring, ingredientNames)
//
//   return scoredRecipes.flatMap((scored) => {
//     const original = recipes.find((r) => r.id === scored.id)
//     if (!original) return []
//     return [{
//       recipe_id: original.id,
//       recipe_name: original.title,
//       recipe_slug: original.slug,
//       recipe_image: original.image,
//       recipe_country: original.country.name,
//       creator_name: original.user.name ?? 'Unknown',
//       score: Math.round(scored.score * 100),
//     }]
//   })
// }
