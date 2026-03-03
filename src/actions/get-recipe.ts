'use server'

import recipesData from '@/mocks/recipes.mock.json'
import { Recipe } from '@/types/recipes'

const recipes: Recipe[] = recipesData

export async function getRecipeById(id: string): Promise<Recipe | null> {
  if (!id || typeof id !== 'string') return null
  return recipes.find((r) => r.recipe_id === id) ?? null
}

// --- Real DB implementation ---
// import { prisma } from '@/lib/prisma'
//
// export async function getRecipeById(id: string): Promise<Recipe | null> {
//   if (!id || typeof id !== 'string') return null
//
//   const recipe = await prisma.recipe.findUnique({
//     where: { id, deletedAt: null },
//     select: {
//       id: true,
//       title: true,
//       slug: true,
//       description: true,
//       image: true,
//       instructions: true,
//       userId: true,
//       country: { select: { name: true } },
//       user: { select: { name: true } },
//       recipeIngredients: {
//         select: {
//           quantity: true,
//           unit: true,
//           weight: true,
//           ingredient: { select: { name: true } },
//         },
//       },
//     },
//   })
//
//   if (!recipe) return null
//
//   return {
//     recipe_id: recipe.id,
//     recipe_name: recipe.title,
//     recipe_slug: recipe.slug,
//     recipe_description: recipe.description,
//     recipe_image: recipe.image,
//     recipe_instructions: recipe.instructions as Recipe['recipe_instructions'],
//     recipe_user_id: recipe.userId,
//     recipe_country: recipe.country.name,
//     creator_name: recipe.user.name ?? 'Unknown',
//     recipe_ingredients: recipe.recipeIngredients.map((ri) => ({
//       name: ri.ingredient.name,
//       unit: ri.unit,
//       weight: ri.weight,
//       quantity: ri.quantity,
//     })),
//   }
// }
