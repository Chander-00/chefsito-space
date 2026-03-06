import { Recipe } from '@/types/recipes'
import { AggregatedIngredient } from './ingredient-aggregator'

export function generateShareText(
  recipes: Recipe[],
  shoppingList: AggregatedIngredient[],
  baseUrl: string
): string {
  const recipeCount = recipes.length
  const header = `My Meal Plan (${recipeCount} recipe${recipeCount !== 1 ? 's' : ''})`

  const recipeLines = recipes
    .map((r) => `- ${r.recipe_name} — ${baseUrl}/recipes/details/${r.recipe_slug}`)
    .join('\n')

  const ingredientLines = shoppingList
    .map((item) => `- ${item.name} — ${item.quantity}${item.unit}`)
    .join('\n')

  return `${header}\n\nRecipes:\n${recipeLines}\n\nShopping List:\n${ingredientLines}`
}

export function shareViaWhatsApp(text: string) {
  const encoded = encodeURIComponent(text)
  window.open(`https://wa.me/?text=${encoded}`, '_blank')
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
